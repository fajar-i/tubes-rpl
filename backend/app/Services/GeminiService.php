<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Question;
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

    public function validateQuestionWithBloom(Question $question, string $material)
    {
        $url = $this->buildUrl();
        $Project = Project::where('id', $question->project_id)->first();
        $profil_Ujian = "$Project->mata_pelajaran kelas $Project->kelas semester $Project->semester";
        $capaianPembelajaran = $Project->CapaianPembelajaran;
        $indikatorKetercapaianPembelajaran = $Project->indikatorKetercapaianPembelajaran;

        // 🔹 Siapkan teks opsi agar mudah dibaca AI
        $optionsText = '';
        $answerKey = null;
        if ($question->options && count($question->options) > 0) {
            foreach ($question->options as $opt) {
                $optionsText .= $opt->option_code . '. ' . $opt->text . "\n";
                if (isset($opt->is_right) && $opt->is_right == 1) {
                    $answerKey = $opt->option_code;
                }
            }
        } else {
            $optionsText = '(Belum ada opsi)';
        }


        // 🔹 Instruksi baru agar AI bertindak sebagai tool evaluasi validitas konten soal
        $prompt = "Kamu adalah seorang ahli (expert) evaluasi pendidikan dan psikometri. Tugasmu adalah menganalisis kualitas butir soal pilihan ganda berikut secara kualitatif (telaah teoretis) berdasarkan konteks yang diberikan.

                    KONTEKS SOAL:
                    Soal: \"$question->text\"
                    Pilihan jawaban: $optionsText
                    Kunci Jawaban: \"$answerKey\"
                    Materi Ajar: \"$material\"
                    Capaian Pembelajaran: \"$capaianPembelajaran\"
                    Indikator Soal: \"$indikatorKetercapaianPembelajaran\"
                    Profil Ujian: \"$profil_Ujian\" (Contoh: 'Formatif', 'Sumatif')

                    TUGAS KAMU:

                    Tugas 1: Validasi Substansi (Gatekeeper)
                    Analisis relevansi mendasar soal.
                    - Cek 1: Apakah substansi soal (stem dan pilihan) relevan dengan \"$material\"?
                    - Cek 2: Apakah \"$answerKey\" benar secara keilmuan berdasarkan \"$material\"?
                    - Cek 3: Apakah soal menggunakan konteks mata pelajaran yang benar (sesuai materi)?
                    - ATURAN: Jika Cek 1 salah, ATAU Cek 2 salah, ATAU Cek 3 salah, soal otomatis 'Tidak Valid'. Hentikan penilaian mendalam dan langsung beri skor 1 untuk semua aspek di Tugas 2.

                    Tugas 2: Penilaian Aspek (Skala Likert 1-5)
                    Berikan skor 1-5 untuk tiap aspek berikut.
                    Gunakan definisi skala ini:
                    1 = Sangat Tidak Sesuai / Buruk
                    2 = Tidak Sesuai
                    3 = Cukup Sesuai (Perlu revisi minor)
                    4 = Sesuai
                    5 = Sangat Sesuai / Sangat Baik

                    Aspek yang Dinilai:
                    1. kesesuaian_tujuan: Seberapa relevan soal dengan $capaianPembelajaran?
                    2. kesesuaian_indikator: Seberapa tepat soal mengukur $indikatorKetercapaianPembelajaran secara spesifik?
                    3. kedalaman_kognitif: Seberapa sesuai level kognitif soal dengan yang dituntut oleh indikator? (Gunakan juga $profil_Ujian sebagai pertimbangan).
                    4. kejelasan_perumusan: Seberapa jelas stem soal, bebas ambigu, komunikatif, dan sesuai kaidah bahasa? Apakah pilihan jawaban homogen?
                    5. kesesuaian_bentuk: Seberapa tepat bentuk Pilihan Ganda digunakan untuk mengukur indikator ini? (Gunakan $profil_Ujian sebagai pertimbangan).
                    6. kesesuaian_materi: Seberapa akurat fakta/konsep pada stem, semua pilihan jawaban, dan kunci jawaban berdasarkan $material?

                    Tugas 3: Identifikasi Taksonomi Bloom
                    Tentukan level Taksonomi Bloom dari soal (C1-C6).

                    Tugas 4: Kalkulasi dan Kesimpulan
                    1. Hitung rata-rata skor dari 6 aspek.
                    2. Tentukan kesimpulan validitas berdasarkan aturan WAJIB berikut:
                    - 'Valid': Jika rata-rata skor >= 4.0 DAN tidak ada skor aspek individual di bawah 3.
                    - 'Sebagian Valid (Revisi)': Jika rata-rata skor >= 2.5 TAPI tidak memenuhi kriteria 'Valid'.
                    - 'Tidak Valid': Jika rata-rata skor < 2.5 ATAU jika Gatekeeper (Tugas 1) gagal.
                    3. Tentukan 'is_valid' (boolean):
                    - 'false' HANYA JIKA 'kesimpulan_validitas' adalah 'Tidak Valid'.
                    - 'true' JIKA 'kesimpulan_validitas' adalah 'Valid' ATAU 'Sebagian Valid'.
                    4. Buat 'note' (penjelasan singkat) yang merangkum alasan kesimpulan.

                    Tugas 5: Saran Perbaikan
                    Jika 'kesimpulan_validitas' BUKAN 'Valid' (artinya 'Sebagian Valid' atau 'Tidak Valid'), berikan saran perbaikan konkret.
                    - Fokus pada perbaikan aspek dengan skor terendah.
                    - Jika Gatekeeper gagal, buat soal BARU yang relevan.

                    Tugas 6: Format Output
                    Jawablah HANYA dalam format JSON yang ketat. Jangan ada teks pembuka atau penutup.

                    {
                    \"is_valid\": true/false,
                    \"note\": \"penjelasan singkat alasan valid/tidak\",
                    \"bloom_taxonomy\": \"C? - Nama Level\",
                    \"skor\": {
                        \"kesesuaian_tujuan\": {
                        \"skor\": 1-5,
                        \"penjelasan\": \"Jelaskan alasan skormu di sini.\"
                        },
                        \"kesesuaian_indikator\": {
                        \"skor\": 1-5,
                        \"penjelasan\": \"Jelaskan alasan skormu di sini.\"
                        },
                        \"kedalaman_kognitif\": {
                        \"skor\": 1-5,
                        \"penjelasan\": \"Jelaskan alasan skormu dan perbandingannya dengan indikator.\"
                        },
                        \"kejelasan_perumusan\": {
                        \"skor\": 1-5,
                        \"penjelasan\": \"Jelaskan alasan skormu (tinjau stem, bahasa, homogenitas pilihan).\"
                        },
                        \"kesesuaian_bentuk\": {
                        \"skor\": 1-5,
                        \"penjelasan\": \"Jelaskan alasan skormu terkait ketepatan bentuk soal PG.\"
                        },
                        \"kesesuaian_materi\": {
                        \"skor\": 1-5,
                        \"penjelasan\": \"Jelaskan alasan skormu (tinjau akurasi fakta & kunci jawaban).\"
                        }
                    },
                    \"rata_rata_skor\": <number>,
                    \"kesimpulan_validitas\": \"Valid\" | \"Sebagian Valid (Revisi)\" | \"Tidak Valid\",
                    \"ai_suggestion_question\": \"Saran perbaikan untuk soal (kosongkan jika 'Valid').\",
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
