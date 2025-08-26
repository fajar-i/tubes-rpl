<?php

namespace App\Http\Controllers;

use App\Services\GeminiService;
use Illuminate\Http\Request;

class GeminiController extends Controller
{
    protected $gemini;

    public function __construct(GeminiService $gemini)
    {
        $this->gemini = $gemini;
    }

    public function generate(Request $request)
    {
        $prompt = $request->input('prompt', 'Hello Gemini!');
        $result = $this->gemini->generateText($prompt);

        return response()->json([
            'prompt' => $prompt,
            'result' => $result,
        ]);
    }
}
