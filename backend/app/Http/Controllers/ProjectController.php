<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class ProjectController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        $projects = $user->projects()->get();
        return response()->json([
            "status" => true,
            "projects" => $projects
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $validatedData = $request->validate([
            'nama_ujian' => 'required|string|max:255',
            'mata_pelajaran' => 'nullable|string',
            'kelas' => 'nullable|string',
            'semester' => 'nullable|string',
            'capaian_pembelajaran' => 'nullable|string',
            'indikator_ketercapaian_pembelajaran' => 'nullable|string'
        ]);
        $validatedData['user_id'] = $user->id;
        $validatedData['public_id'] = (string) Str::uuid();

        $Project = Project::create($validatedData);

        $validatedData = $request->validate([
            'questions' => 'array',
            'questions.*.text' => 'required|string'
        ]);
        if (!empty($validatedData['questions'])) {
            foreach ($validatedData['questions'] as $question) {
                $Project->questions()->create(['text' => $question['text']]);
            }
        }

        return response()->json([
            "status" => true,
            "message" => "Project created succesfully",
            "project" => $Project->load('questions')
        ]);
    }

    public function show(Project $project)
    {
        $project = $project->with('questions')->get();
        return response()->json([
            "status" => true,
            "message" => "project data found",
            "project" => $project->load('questions')
        ]);
    }

    public function update(Request $request, Project $project)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        if ($project->user_id !== $user->id){
            return response()->json(['message' => 'Product not for or not owned by authenticated user'], 404);
        }

        $validatedData = $request->validate([
            'nama_ujian' => 'required|string|max:255',
            'mata_pelajaran' => 'nullable|string',
            'kelas' => 'nullable|string',
            'semester' => 'nullable|string',
            'capaian_pembelajaran' => 'nullable|string',
            'indikator_ketercapaian_pembelajaran' => 'nullable|string'
        ]);

        $project->update($validatedData);
        return response()->json([
            "status" => true,
            "message" => "project updated succesfully",
            "project" => $project->load('questions')
        ]);
    }

    public function destroy(Project $project)
    {
        $project->delete();
        return response()->json([
            "status" => true,
            "message" => "project deleted succesfully"
        ]);
    }
}
