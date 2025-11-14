<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Question;
use App\Models\Material;
use App\Services\GeminiService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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

        if ($question->ai_validation_result != null) {
            $result = $question->ai_validation_result;
        } else {
            $result = $this->gemini->validateQuestionWithBloom($question, $materi->content);
            $decoded = json_decode($result, true);

            if (!$decoded) {
                return response()->json([
                    "status" => false,
                    "message" => "Format jawaban AI tidak valid",
                    "raw" => $result
                ], 500);
            }

            try {
                // Kita simpan string mentah $result ke kolom baru
                $question->update([
                    'ai_validation_result' => $decoded
                ]);
            } catch (Exception $e) {
                Log::error('Gagal update validasi soal: ' . $e->getMessage());

                return response()->json([
                    "status" => false,
                    "message" => "Gagal menyimpan hasil analisis ke database.",
                    "error" => $e->getMessage()
                ], 500);
            }
        }

        return response()->json([
            "status" => true,
            "message" => "Analisis validitas soal berhasil",
            "data" => $decoded
        ]);
    }
    public function retryValidateQuestion(Request $request, Question $question)
    {
        try {
            $materi = Material::where('project_id', $question->project_id)->first();

            if (!$materi) {
                Log::warning('Materi tidak ditemukan untuk project: ' . $question->project_id);
                return response()->json([
                    "status" => false,
                    "message" => "Materi belum tersedia untuk project ini"
                ], 400);
            }

            Log::info('Starting retryValidateQuestion for question: ' . $question->id);

            $result = $this->gemini->validateQuestionWithBloom($question, $materi->content);

            if ($result === null) {
                Log::error('Gemini returned null result for question: ' . $question->id);
                return response()->json([
                    "status" => false,
                    "message" => "AI service gagal memproses validasi",
                    "error" => "Gemini service returned null"
                ], 500);
            }

            Log::info('Raw Gemini response: ' . substr($result, 0, 500)); // Log first 500 chars

            $decoded = json_decode($result, true);

            if (!$decoded) {
                Log::error('JSON decode failed for question: ' . $question->id);
                Log::error('Raw response: ' . $result);
                return response()->json([
                    "status" => false,
                    "message" => "Format jawaban AI tidak valid",
                    "raw" => $result,
                    "error" => "JSON decode failed: " . json_last_error_msg()
                ], 500);
            }

            Log::info('Decoded result structure: ' . json_encode(array_keys($decoded)));

            try {
                $question->update([
                    'ai_validation_result' => $decoded
                ]);
            } catch (Exception $e) {

                return response()->json([
                    "status" => false,
                    "message" => "Gagal menyimpan hasil analisis ke database.",
                    "error" => $e->getMessage()
                ], 500);
            }

            return response()->json([
                "status" => true,
                "message" => "Analisis validitas soal berhasil",
                "data" => $decoded
            ]);
        } catch (Exception $e) {
            Log::error('Unexpected error in retryValidateQuestion: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                "status" => false,
                "message" => "Terjadi kesalahan yang tidak terduga",
                "error" => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, Question $question)
    {
        $request->validate([
            "text" => "required",
            "bloom_taxonomy" => "nullable|string",
            "ai_validation_result" => "nullable",
            "options" => "nullable|array",
            "options.*.option_code" => "required|string",
            "options.*.text" => "required|string",
            "options.*.is_right" => "required|boolean",
        ]);

        $data = [];
        $data["text"] = $request->text;
        
        // Handle bloom_taxonomy
        if ($request->has('bloom_taxonomy')) {
            $data["bloom_taxonomy"] = $request->bloom_taxonomy;
        }

        // Handle ai_validation_result - allow null or array/object
        if ($request->has('ai_validation_result')) {
            $data["ai_validation_result"] = $request->ai_validation_result;
        }

        $question->update($data);

        // Handle options update/creation
        if ($request->has('options') && is_array($request->options)) {
            // Get existing options
            $existingOptions = $question->options()->get();
            $requestOptionCodes = array_column($request->options, 'option_code');

            // Delete options that are not in the request
            foreach ($existingOptions as $existingOption) {
                if (!in_array($existingOption->option_code, $requestOptionCodes)) {
                    $existingOption->delete();
                }
            }

            // Update or create options
            foreach ($request->options as $optionData) {
                $existingOption = $existingOptions->firstWhere('option_code', $optionData['option_code']);

                if ($existingOption) {
                    // Update existing option
                    $existingOption->update([
                        'text' => $optionData['text'],
                        'is_right' => $optionData['is_right'],
                    ]);
                } else {
                    // Create new option
                    $question->options()->create([
                        'text' => $optionData['text'],
                        'option_code' => $optionData['option_code'],
                        'is_right' => $optionData['is_right'],
                    ]);
                }
            }
        }

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
