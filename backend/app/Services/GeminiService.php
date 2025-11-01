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
        $prompt = <<<EOT
    INSTRUKSI UNTUK MODEL:
    Kamu adalah tool evaluasi validitas konten soal. 
    Tugasmu: analisis batch soal dan kembalikan hasilnya *hanya* dalam format JSON sesuai skema yang diuraikan di bawah.
    Jangan tambahkan teks, penjelasan, atau komentar selain JSON valid.

    PRINSIP UTAMA:
    - Gunakan *indikator pembelajaran* sebagai acuan utama untuk menentukan kesesuaian.
    - Gunakan *tujuan pembelajaran* untuk cross-check tujuan umum.
    - Gunakan *materi* hanya sebagai konteks tambahan (bukan ground truth).
    - Ada dua mode: "fast" (hanya stem; lebih cepat, tidak menilai PG) dan "full" (menilai stem + opsi PG + kunci jawaban jika tersedia).

    SKEMA JSON OUTPUT (WAJIB):
    {
    "meta": {
        "tujuan": "<string>",
        "indikator": ["<string>", "..."],
        "materi": "<string - optional>",
        "analisis_generated_at": "<ISO8601 timestamp>"
    },
    "per_soal": [
        {
        "no": 1,
        "soal": "<full text of stem>",
        "pg": {
            "opsi": ["A. ...", "B. ...", "..."],
            "kunci": "A" | "B" | "C" | "D" | null
        },
        "skor": {
            "kesesuaian_tujuan": <1-4>,
            "kesesuaian_indikator": <1-4>,
            "kedalaman_kognitif": <1-4>,
            "kejelasan_perumusan": <1-4>,
            "kesesuaian_bentuk": <1-4>,
            "kesesuaian_dengan_materi": <1-4>
        },
        "rata_rata_skor": <number>,
        "kesimpulan_validitas": "Valid" | "Sebagian Valid" | "Tidak Valid",
        "catatan": "<string>"
        }
    ],
    "analisis_keseluruhan": {
        "cakupan_indikator_terpenuhi_percent": <0-100>,
        "keseimbangan_kognitif": {
        "distribusi_per_level": { "C1": <count>, "C2": <count>, "C3": <count>, "C4": <count>, "C5": <count>, "C6": <count> },
        "keterangan": "<string>"
        },
        "kesimpulan_umum": "Valid tinggi" | "Valid sedang" | "Perlu revisi signifikan",
        "rekomendasi": ["<rekomendasi singkat 1>", "..."]
    }
    }

    PETA SKOR: 1 = Sangat Tidak Sesuai, 2 = Kurang Sesuai, 3 = Cukup Sesuai, 4 = Sangat Sesuai.

    INPUT YANG AKU MASUKKAN:
    {
    "tujuan": "Evaluasi validitas konten soal berdasarkan indikator pembelajaran",
    "indikator": ["Kesesuaian tujuan", "Kejelasan perumusan", "Kedalaman kognitif"],
    "materi": "$material",
    "daftar_soal": [
        {
        "no": 1,
        "stem": "$question",
        "pg": {
            "opsi": "$optionsText",
            "kunci": "$answerKey"
        }
        }
    ]
    }

    PERINTAH:
    Baca input yang diberikan, lakukan analisis per butir sesuai aspek:
    1) kesesuaian dengan tujuan,
    2) kesesuaian dengan indikator (utama),
    3) kedalaman/kognitif,
    4) kejelasan,
    5) kesesuaian bentuk,
    6) kesesuaian dengan materi (tambahan).
    Kemudian hitung ringkasan keseluruhan sesuai skema di atas.
    Keluarkan *satu* JSON valid yang mengikuti skema.
    EOT;

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