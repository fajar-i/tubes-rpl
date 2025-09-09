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

        // Validasi dengan Gemini (Kalau ada yang misspersepsi, kasih tau cuy)
        $materi = Material::where('project_id', $project->id)->first();
        if ($materi) {
            $prompt = "Validasi soal berikut terhadap materi ajar.\n
            Soal: \"{$question->text}\"\n
            Materi: \"{$materi->content}\"\n
            Jawab dengan format JSON: {\"is_valid\": true/false, \"note\": \"penjelasan singkat\"}";

            $result = $this->gemini->generateText($prompt);

            // parse JSON dari AI
            $decoded = json_decode($result, true);
            if ($decoded) {
                $question->is_valid = $decoded['is_valid'] ?? null;
                $question->validation_note = $decoded['note'] ?? null;
                $question->save();
            }
        }

        return response()->json([
            "status" => true,
            "message" => "question created succesfully",
            "questions" => $question->load('options')
        ]);
    }

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
