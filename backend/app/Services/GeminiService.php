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
        $this->apiKey = config('services.gemini.key');
        $this->apiUrl = config('services.gemini.url');
    }

    protected function buildUrl(string $model = null): string
    {
        $model = $model ?? $this->defaultModel;

        $endpoint = "v1beta/models/{$model}:generateContent";

        return "{$this->apiUrl}/{$endpoint}?key={$this->apiKey}";
    }

    public function validateQuestionWithBloom(Question $question, string $material)
    {
        try {
            $url = $this->buildUrl();
            $project = Project::where('id', $question->project_id)->first();
            $profil_ujian = "$project->nama_ujian : $project->mata_pelajaran kelas $project->kelas semester $project->semester";
            $capaian_pembelajaran = $project->capaian_pembelajaran;
            $indikator_ketercapaian_pembelajaran = $project->indikator_ketercapaian_pembelajaran;

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
                        Capaian Pembelajaran: \"$capaian_pembelajaran\"
                        Indikator Soal: \"$indikator_ketercapaian_pembelajaran\"
                        Profil Ujian: \"$profil_ujian\" (Contoh: 'Formatif', 'Sumatif')

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
                        1. kesesuaian_tujuan: Seberapa relevan soal dengan $capaian_pembelajaran?
                        2. kesesuaian_indikator: Seberapa tepat soal mengukur $indikator_ketercapaian_pembelajaran secara spesifik?
                        3. kedalaman_kognitif: Seberapa sesuai level kognitif soal dengan yang dituntut oleh indikator? (Gunakan juga $profil_ujian sebagai pertimbangan).
                        4. kejelasan_perumusan: Seberapa jelas stem soal, bebas ambigu, komunikatif, dan sesuai kaidah bahasa? Apakah pilihan jawaban homogen?
                        5. kesesuaian_bentuk: Seberapa tepat bentuk Pilihan Ganda digunakan untuk mengukur indikator ini? (Gunakan $profil_ujian sebagai pertimbangan).
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


        

            $json = $response->json();


            // Check if response has expected structure
            if (!isset($json['candidates']) || !is_array($json['candidates']) || count($json['candidates']) === 0) {
                return null;
            }

            if (!isset($json['candidates'][0]['content']['parts'][0]['text'])) {
                return null;
            }

            $text = $json['candidates'][0]['content']['parts'][0]['text'];

            if (!$text) {
                return null;
            }


            $clean = preg_replace('/^```json|```$/m', '', trim($text));
            $clean = trim(str_replace('```', '', $clean));


            // Validate JSON structure before returning
            $testDecode = json_decode($clean, true);
            if (!$testDecode) {
                return null;
            }

            return $clean;
        } catch (Exception $e) {
            return null;
        }
    }
}
