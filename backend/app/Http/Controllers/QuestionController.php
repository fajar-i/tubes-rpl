<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Question;
use Illuminate\Http\Request;
use App\Services\GeminiService;
use App\Models\Material;

class QuestionController extends Controller
{
    protected $gemini;

    public function __construct(GeminiService $gemini)
    {
        $this->gemini = $gemini;
    }

    public function indexByProject(Project $project)
    {
        $questions = $project->questions()->with('options')->get();
        return response()->json([
            "status" => true,
            "questions" => $questions
        ]);
    }

    public function store(Request $request, Project $project)
    {
        $data = $request->validate([
            "text" => "required",
        ]);
        $data['project_id'] = $project->id;
        $question = Question::create($data);

        $data = $request->validate([
            'options' => 'array',
            'options.*.text' => 'required|string'
        ]);
        if (!empty($data['options'])) {
            foreach ($data['options'] as $i => $option) {
                if ($i == 0) $option['is_right'] = true;
                else $option['is_right'] = false;
                $question->options()->create([
                    'text' => $option['text'],
                    'option_code' => chr(65 + $i),
                    'is_right' => $option['is_right']
                ]);
            }
        }

        return response()->json([
            "status" => true,
            "message" => "question created succesfully",
            "questions" => $question->load('options')
        ]);
    }

    public function validateQuestion(Request $request, Question $question)
    {
        $materi = Material::where('project_id', $question->project_id)->first();

        if (!$materi) {
            return response()->json([
                "status" => false,
                "message" => "Materi belum tersedia untuk project ini"
            ], 400);
        }

        $result = $this->gemini->validateQuestionWithBloom($question->text, $materi->content, $question->options);
        $decoded = json_decode($result, true);

        if (!$decoded) {
            return response()->json([
                "status" => false,
                "message" => "Format jawaban AI tidak valid",
                "raw" => $result
            ], 500);
        }

        $question->is_valid = $decoded['is_valid'] ?? null;
        $question->validation_note = $decoded['note'] ?? null;
        $question->bloom_taxonomy = $decoded['bloom_taxonomy'] ?? null;
        $question->ai_suggestion = $decoded['ai_suggestion'] ?? null;
        $question->save();

        return response()->json([
            "status" => true,
            "message" => "Soal berhasil divalidasi",
            "question" => $question
        ]);
    }

    // Gak jadi di pake
    // public function applySuggestion(Request $request, Question $question)
    // {
    //     $request->validate([
    //         'action' => 'required|in:accept,reject'
    //     ]);

    //     if ($request->action === 'accept' && $question->ai_suggestion) {
    //         // update text soal dengan saran AI
    //         $question->update([
    //             "text"   => $question->ai_suggestion,
    //             "status" => "revised"
    //         ]);

    //         return response()->json([
    //             "status" => true,
    //             "message" => "Saran AI diterima & soal diperbarui",
    //             "question" => $question
    //         ]);
    //     }

    //     if ($request->action === 'reject') {
    //         $question->update([
    //             "status" => "validated" // tetap valid tapi tanpa revisi
    //         ]);

    //         return response()->json([
    //             "status" => true,
    //             "message" => "Saran AI ditolak, soal tetap sama",
    //             "question" => $question
    //         ]);
    //     }

    //     return response()->json([
    //         "status" => false,
    //         "message" => "Tidak ada saran AI untuk diterapkan"
    //     ], 400);
    // }


    // public function show(Question $question)
    // {
    //     $question = $question->with('options')->get();
    //     return response()->json([
    //         "status" => true,
    //         "message" => "question data found",
    //         "question" => $question
    //     ]);
    // }

    public function update(Request $request, Question $question)
    {
        $request->validate([
            "text" => "required"
        ]);
        $data["text"] = isset($request->text) ? $request->text : $question->text;

        $question->update($data);
        return response()->json([
            "status" => true,
            "message" => "question updated succesfully",
            "question" => $question->load('options')
        ]);
    }

    public function destroy(Question $question)
    {
        $question->delete();
        return response()->json([
            "status" => true,
            "message" => "question deleted succesfully"
        ]);
    }
}
