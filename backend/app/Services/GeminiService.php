<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

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
            Log::info('Response upload Gemini:', ['body' => $body]);

            $json = json_decode($body, true);

            // ✅ Perbaikan di sini
            if (!isset($json['file']['name'])) {
                Log::error('Upload ke Gemini gagal, tidak ada file.name di response', ['json' => $json]);
                return null;
            }

            // Kembalikan file_uri: "files/xh4v7jkr7c2f"
            return $json['file']['name'];

        } catch (\Exception $e) {
            Log::error('Gagal upload file ke Gemini', [
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
            Log::error('Gagal analisis file di Gemini', ['body' => $response->body()]);
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

    public function validateQuestionWithBloom(string $question, string $material, $options = null)
    {
        $url = $this->buildUrl();

        // 🔹 Siapkan teks opsi agar mudah dibaca AI
        $optionsText = '';
        $answerKey = null;
        if ($options && count($options) > 0) {
            foreach ($options as $opt) {
                $optionsText .= $opt->option_code . '. ' . $opt->text . "\n";
                if (isset($opt->is_right) && $opt->is_right == 1) {
                    $answerKey = $opt->option_code;
                }
            }
        } else {
            $optionsText = '(Belum ada opsi)';
        }

        // 🔹 Instruksi baru agar AI bertindak sebagai tool evaluasi validitas konten soal
        $prompt = "Analisis soal pilihan ganda berikut berdasarkan materi ajar dan taksonomi Bloom.
        Soal: \"$question\"
        Pilihan jawaban:
        $optionsText
        Materi: \"$material\"
        Kunci Jawaban: \"$answerKey\"

        Tugas kamu:
        1. Analisis validitas isi soal berdasarkan kesesuaian dengan MATERI AJAR dan TUJUAN PEMBELAJARAN.
        - Jika isi soal tidak membahas topik, istilah, atau konsep yang ada dalam materi, maka soal otomatis 'Tidak Valid' (meskipun strukturnya baik).
        - Jika soal menggunakan konteks dari mata pelajaran lain (misalnya Bahasa Indonesia padahal materi Literasi Digital), maka soal otomatis 'Tidak Valid'.
        - Jangan menilai hanya dari kejelasan kalimat atau bentuk soal, tetapi dari relevansi substansi terhadap materi.

        2. Beri skor 1–4 untuk tiap aspek berikut:
        - kesesuaian_tujuan
        - kesesuaian_indikator
        - kedalaman_kognitif
        - kejelasan_perumusan
        - kesesuaian_bentuk
        - kesesuaian_dengan_materi

        3. Aturan penilaian WAJIB:
        - Jika soal TIDAK relevan dengan materi → semua skor maksimum 2, rata-rata < 2.5, dan kesimpulan = 'Tidak Valid'.
        - Jika hanya sebagian aspek relevan → rata-rata antara 2.5–3.4 dan kesimpulan = 'Sebagian Valid'.
        - Hanya jika SEMUA aspek sesuai (≥3) dan materi relevan barulah kesimpulan = 'Valid'.

        4. Hitung rata-rata skor dari seluruh aspek.
        5. Tentukan kesimpulan validitas soal:
        - 'Valid' jika rata-rata ≥ 3.5 dan semua aspek minimal 3.
        - 'Sebagian Valid' jika 2.5 ≤ rata-rata < 3.5.
        - 'Tidak Valid' jika rata-rata < 2.5 atau soal tidak relevan dengan materi.

        6. Tentukan level Taksonomi Bloom dari soal (C1–C6).
        7. Jika soal atau pilihan jawabannya tidak valid, berikan saran perbaikan berdasarkan materi:
        - 'ai_suggestion_question' berisi teks soal baru yang sesuai dengan materi.
        - 'ai_suggestion_options' berisi pilihan jawaban baru dalam format JSON.

        Jawablah **hanya dalam format JSON** tanpa teks tambahan seperti berikut:

        {
        \"is_valid\": true/false,
        \"note\": \"penjelasan singkat alasan valid/tidak\",
        \"bloom_taxonomy\": \"C? - Nama Level\",
        \"skor\": {
            \"kesesuaian_tujuan\": 1-4,
            \"kesesuaian_indikator\": 1-4,
            \"kedalaman_kognitif\": 1-4,
            \"kejelasan_perumusan\": 1-4,
            \"kesesuaian_bentuk\": 1-4,
            \"kesesuaian_dengan_materi\": 1-4
        },
        \"rata_rata_skor\": <number>,
        \"kesimpulan_validitas\": \"Valid\" | \"Sebagian Valid\" | \"Tidak Valid\",
        \"ai_suggestion_question\": \"Saran perbaikan untuk soal\",
        \"ai_suggestion_options\": [
            {\"option_code\": \"A\", \"text\": \"pilihan baru 1\", \"is_right\": false},
            {\"option_code\": \"B\", \"text\": \"pilihan baru 2\", \"is_right\": true},
            {\"option_code\": \"C\", \"text\": \"pilihan baru 3\", \"is_right\": false},
            {\"option_code\": \"D\", \"text\": \"pilihan baru 4\", \"is_right\": false}
        ]
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

        // Bersihkan dari ```json ... ```
        $clean = preg_replace('/^```json|```$/m', '', trim($text));
        $clean = trim(str_replace('```', '', $clean));

        return $clean;
    }

}