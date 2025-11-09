<?php

namespace App\Http\Controllers;

use App\Models\Material;
use App\Models\Project;
use Illuminate\Http\Request;
use App\Services\GeminiService;

class MaterialController extends Controller
{
    protected $gemini;

    public function __construct(GeminiService $gemini)
    {
        $this->gemini = $gemini;
    }
    
    // Kalau Dibutuhin
    // Ambil semua materi dalam 1 project
    public function index(Project $project)
    {
        $materials = $project->materials()->get();
        return response()->json([
            "status" => true,
            "materials" => $materials
        ]);
    }

    // Simpan materi baru 
    public function store(Request $request, Project $project)
    {
        $request->validate([
            'content' => 'required|string',
        ]);

        $material = Material::create([
            'project_id' => $project->id,
            'content' => $request->content,
        ]);

        return response()->json([
            "status" => true,
            "message" => "File materi berhasil diunggah",
            "material" => $material
        ]);
    }


    // Update materi
    public function update(Request $request, Material $material)
    {
        $data = $request->validate([
            'content' => 'required|string',
        ]);

        $material->update($data);

        return response()->json([
            "status" => true,
            "message" => "Material updated successfully",
            "material" => $material
        ]);
    }

    //Hapus materi
    public function destroy(Material $material)
    {
        $material->delete();

        return response()->json([
            "status" => true,
            "message" => "Material deleted successfully"
        ]);
    }
}
