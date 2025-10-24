<?php

namespace App\Http\Controllers;

use App\Models\Material;
use App\Models\Project;
use Illuminate\Http\Request;

class MaterialController extends Controller
{
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
        // Validasi input file
        $request->validate([
            'file' => 'required|file|mimes:pdf,txt,doc,docx,ppt,pptx|max:5120', // maksimal 5MB
        ]);

        $path = $request->file('file')->store('materials', 'public');

        $url = asset('storage/' . $path);

        $material = Material::create([
            'project_id' => $project->id,
            'content' => $url,
        ]);

        return response()->json([
            "status" => true,
            "message" => "Material uploaded successfully",
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
