<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class GeminiService
{
    protected $apiKey;
    protected $apiUrl;
    protected $defaultModel = 'gemini-2.5-flash'; // Model yang stabil dan direkomendasikan

    public function __construct()
    {
        // Pastikan Anda telah membuat config/services.php seperti di atas
        $this->apiKey = config('services.gemini.key');
        $this->apiUrl = config('services.gemini.url');
    }

    // Mengizinkan penentuan model, default: gemini-2.5-flash
    protected function buildUrl(string $model = null): string
    {
        $model = $model ?? $this->defaultModel;
        
        // Endpoint: /v1beta/models/{model}:generateContent
        $endpoint = "v1beta/models/{$model}:generateContent"; 
        
        return "{$this->apiUrl}/{$endpoint}?key={$this->apiKey}";
    }

    public function generateText(string $prompt)
    {
        $url = $this->buildUrl(); // Gunakan URL yang sudah diperbaiki

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post($url, [
            // Payload sudah benar untuk format contents
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

        // Pastikan model tidak diblokir
        return $json['candidates'][0]['content']['parts'][0]['text'] ?? 'Model response blocked or empty.';
    }

    public function validateQuestionWithBloom(string $question, string $material)
    {
        $url = $this->buildUrl(); // Gunakan URL yang sudah diperbaiki

        $prompt = "Analisis soal berikut berdasarkan materi ajar dan taksonomi Bloom.

    Soal: \"$question\"
    Materi: \"$material\"

    Tugas kamu:
    1. Tentukan apakah soal ini relevan dengan materi. 
    2. Jelaskan alasannya secara singkat.
    3. Tentukan level Taksonomi Bloom dari soal (C1 = Remembering, C2 = Understanding, C3 = Applying, C4 = Analyzing, C5 = Evaluating, C6 = Creating).
    4. Jika soal tidak valid, berikan saran soal agar sesuai dan valid (langsung berikan soalnya).

    Jawablah hanya dalam format JSON:
    {
    \"is_valid\": true/false,
    \"note\": \"penjelasan singkat\",
    \"bloom_taxonomy\": \"C? - Nama Level\"
    \"ai_suggestion\": \"Saran perbaikan dari AI jika soal tidak valid, jika valid boleh kosong\"
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
        $text = $json['candidates'][0]['content']['parts'][0]['text'] ?? null;

        if (!$text) return null;

        // Hapus tanda ```json dan ```
        $clean = preg_replace('/^```json|```$/m', '', trim($text));
        $clean = trim(str_replace('```', '', $clean));

        // Kembalikan JSON murni agar bisa didecode di controller
        return $clean;

    }
}