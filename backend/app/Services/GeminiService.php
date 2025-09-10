<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class GeminiService
{
    protected $apiKey;
    protected $apiUrl;

    public function __construct()
    {
        $this->apiKey = config('services.gemini.key');
        $this->apiUrl = config('services.gemini.url');
    }

    public function generateText(string $prompt)
    {
        $url = $this->apiUrl . '?key=' . $this->apiKey;

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post($url, [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ]
        ]);

        if ($response->failed()) {
            return "Error: " . $response->body();
        }

        $json = $response->json();

        return $json['candidates'][0]['content']['parts'][0]['text'] ?? null;
    }

    public function validateQuestionWithBloom(string $question, string $material)
    {
        $url = $this->apiUrl . '?key=' . $this->apiKey;

        $prompt = "Analisis soal berikut berdasarkan materi ajar dan taksonomi Bloom.

    Soal: \"$question\"
    Materi: \"$material\"

    Tugas kamu:
    1. Tentukan apakah soal ini relevan dengan materi. 
    2. Jelaskan alasannya secara singkat.
    3. Tentukan level Taksonomi Bloom dari soal (C1 = Remembering, C2 = Understanding, C3 = Applying, C4 = Analyzing, C5 = Evaluating, C6 = Creating).

    Jawablah hanya dalam format JSON:
    {
    \"is_valid\": true/false,
    \"note\": \"penjelasan singkat\",
    \"bloom_taxonomy\": \"C? - Nama Level\"
    }";

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post($url, [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ]
        ]);

        if ($response->failed()) {
            return null;
        }

        $json = $response->json();
        return $json['candidates'][0]['content']['parts'][0]['text'] ?? null;
    }


}
