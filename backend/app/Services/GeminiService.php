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

    /**
     * Upload file ke Gemini Files API
     * @return string|null  file_uri seperti 'files/abc123xyz'
     */
    public function uploadFile(string $filePath, string $fileName, string $mimeType)
    {
        $url = "{$this->apiUrl}/upload/v1beta/files?uploadType=multipart&key={$this->apiKey}";

        $metadata = [
            'file' => [
                'display_name' => $fileName,
            ]
        ];

        $boundary = 'boundary_' . uniqid();

        $multipartBody =
            "--{$boundary}\r\n" .
            "Content-Type: application/json; charset=UTF-8\r\n\r\n" .
            json_encode($metadata) . "\r\n" .
            "--{$boundary}\r\n" .
            "Content-Type: {$mimeType}\r\n\r\n" .
            file_get_contents($filePath) . "\r\n" .
            "--{$boundary}--";

        $client = new \GuzzleHttp\Client();

        try {
            $response = $client->request('POST', $url, [
                'headers' => [
                    'Content-Type' => "multipart/related; boundary={$boundary}",
                    'Accept' => 'application/json',
                ],
                'body' => $multipartBody,
            ]);

            $body = $response->getBody()->getContents();
            \Log::info('Response upload Gemini:', ['body' => $body]);

            $json = json_decode($body, true);

            // ✅ Perbaikan di sini
            if (!isset($json['file']['name'])) {
                \Log::error('Upload ke Gemini gagal, tidak ada file.name di response', ['json' => $json]);
                return null;
            }

            // Kembalikan file_uri: "files/xh4v7jkr7c2f"
            return $json['file']['name'];

        } catch (\Exception $e) {
            \Log::error('Gagal upload file ke Gemini', [
                'error' => $e->getMessage(),
                'response' => method_exists($e, 'getResponse') ? $e->getResponse()?->getBody()?->getContents() : null,
            ]);
            return null;
        }
    }




    /**
     * Analisis konten dengan file PDF + prompt
     */
    public function analyzeWithFile(string $fileUri, string $mimeType, string $promptText, string $model = 'gemini-1.5-pro-latest')
    {
        $url = "{$this->apiUrl}/v1beta/models/{$model}:generateContent?key={$this->apiKey}";

        $body = [
            'contents' => [
                [
                    'parts' => [
                        [
                            'file_data' => [
                                'file_uri' => $fileUri,
                                'mime_type' => $mimeType,
                            ]
                        ],
                        [
                            'text' => $promptText
                        ]
                    ]
                ]
            ]
        ];

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post($url, $body);

        if ($response->failed()) {
            \Log::error('Gagal analisis file di Gemini', ['body' => $response->body()]);
            return null;
        }

        return $response->json()['candidates'][0]['content']['parts'][0]['text'] ?? null;
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