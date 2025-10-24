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
            'file' => 'required|file|mimes:pdf,txt,docx|max:5120',
        ]);

        $file = $request->file('file');
        $path = $file->store('materials', 'public'); // disimpan ke storage/app/public/materials
        $filePath = storage_path("app/public/{$path}");
        $fileMime = $file->getMimeType();
        $fileName = $file->getClientOriginalName();

        // Upload ke Gemini
        $fileUri = $this->gemini->uploadFile($filePath, $fileName, $fileMime);

        if (!$fileUri) {
            return response()->json([
                "status" => false,
                "message" => "Gagal mengupload file ke Gemini API"
            ], 500);
        }

        // Simpan URL file lokal + URI Gemini di database
        $material = Material::create([
            'project_id' => $project->id,
            'content' => asset("storage/{$path}"), // URL publik untuk file
            'gemini_file_uri' => $fileUri,
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
