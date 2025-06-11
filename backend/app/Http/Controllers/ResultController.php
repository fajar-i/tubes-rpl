<?php

namespace App\Http\Controllers;

use App\Models\JawabanPeserta;
use App\Models\Project;
use App\Models\Question;
use App\Models\Option;

class ResultController extends Controller
{
    // ... (method simpanJawaban dan getJawaban yang sudah ada)

    /**
     * Menggabungkan perhitungan validitas, reliabilitas, tingkat kesukaran, daya beda, dan kualitas pengecoh untuk suatu project.
     * @param  \App\Models\Project  $project
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAnalisis(Project $project)
    {
        try {
            // 1. Ambil semua pertanyaan terkait project ini
            $questions = Question::where('project_id', $project->id)
                ->orderBy('id')
                ->get();

            if ($questions->isEmpty()) {
                return response()->json([
                    'message' => 'Tidak ada soal ditemukan untuk project ini.',
                    'status' => 'error'
                ], 404);
            }

            // 2. Ambil semua opsi jawaban (TERMASUK YANG SALAH) untuk pertanyaan-pertanyaan ini
            // Kita juga perlu tahu kunci jawaban
            $allOptions = Option::whereIn('question_id', $questions->pluck('id'))
                ->orderBy('question_id')
                ->orderBy('option_code') // Pastikan urutan opsi konsisten (A, B, C, D)
                ->get()
                ->groupBy('question_id'); // Kelompokkan berdasarkan question_id

            $correctOptions = []; // [question_id => option_code_benar]
            foreach ($allOptions as $qId => $options) {
                foreach ($options as $option) {
                    if ($option->is_right) {
                        $correctOptions[$qId] = $option->option_code;
                        break;
                    }
                }
            }

            if (empty($correctOptions)) {
                return response()->json([
                    'message' => 'Tidak ada kunci jawaban benar ditemukan untuk soal-soal di project ini.',
                    'status' => 'error'
                ], 404);
            }

            $kunciJawaban = $correctOptions;
            $questionIdsWithKeys = array_keys($kunciJawaban);
            $numberOfItems = count($questionIdsWithKeys);

            // 3. Ambil semua jawaban peserta dan hitung skor
            $answers = JawabanPeserta::where('project_id', $project->id)
                ->whereIn('question_id', $questionIdsWithKeys)
                ->get();

            $participantItemAnswers = []; // [kode_peserta => [question_id => jawaban_huruf_peserta]] - Untuk kualitas pengecoh
            $participantScoresRaw = []; // [kode_peserta => [question_id => score (0/1)]]

            foreach ($answers as $answer) {
                $kodePeserta = $answer->kode_peserta;
                $questionId = $answer->question_id;
                $jawabanPeserta = $answer->jawaban_huruf;

                if (!isset($kunciJawaban[$questionId])) {
                    continue;
                }

                $score = ($jawabanPeserta === $kunciJawaban[$questionId]) ? 1 : 0;

                $participantItemAnswers[$kodePeserta][$questionId] = $jawabanPeserta; // Simpan jawaban asli
                $participantScoresRaw[$kodePeserta][$questionId] = $score; // Simpan skor
            }

            // Ambil semua kode peserta unik yang memiliki jawaban
            $allKodePeserta = array_keys($participantScoresRaw);
            if (empty($allKodePeserta)) {
                return response()->json([
                    'message' => 'Tidak ada data jawaban yang cukup untuk menghitung analisis.',
                    'status' => 'error'
                ], 404);
            }

            // Urutkan kode peserta secara alami (misal: Peserta_1, Peserta_2, Peserta_10)
            natsort($allKodePeserta);

            // --- REKONSTRUKSI DATA UNTUK KORELASI, VARIAN, TINGKAT KESUKARAN, DAYA BEDA ---
            $totalScoresArrayForCorrelation = []; // Array total skor peserta (sesuai urutan $allKodePeserta)
            $itemScoresForCorrelation = [];      // [question_id => [skor_peserta_1, skor_peserta_2, ...]]
            $participantTotalScores = [];       // [kode_peserta => total_score] - untuk pengurutan
            $totalParticipants = count($allKodePeserta); // N = jumlah peserta

            foreach ($questionIdsWithKeys as $qId) {
                $itemScoresForCorrelation[$qId] = [];
            }

            foreach ($allKodePeserta as $kodePeserta) {
                $currentParticipantTotalScore = 0;
                foreach ($questionIdsWithKeys as $qId) {
                    $itemScore = $participantScoresRaw[$kodePeserta][$qId] ?? 0;
                    $itemScoresForCorrelation[$qId][] = $itemScore;
                    $currentParticipantTotalScore += $itemScore;
                }
                $totalScoresArrayForCorrelation[] = $currentParticipantTotalScore;
                $participantTotalScores[$kodePeserta] = $currentParticipantTotalScore;
            }


            // --- PERHITUNGAN VARIAN (Populasi atau Sampel) ---
            $useSampleVariance = true; // <--- Sesuaikan ini dengan Excel Anda!


            // --- PERHITUNGAN RELIABILITAS (Cronbach's Alpha) ---
            $alpha = null;
            $sumOfItemVariances = 0;
            $totalScoreVariance = $this->calculateVariance($totalScoresArrayForCorrelation, $useSampleVariance);

            foreach ($questionIdsWithKeys as $qId) {
                $itemVariance = $this->calculateVariance($itemScoresForCorrelation[$qId], $useSampleVariance);
                $sumOfItemVariances += $itemVariance;
            }

            if ($numberOfItems > 1 && $totalScoreVariance > 0) {
                $alpha = ($numberOfItems / ($numberOfItems - 1)) * (1 - ($sumOfItemVariances / $totalScoreVariance));
            }


            // --- PERHITUNGAN VALIDITAS (Item-Total Correlation) ---
            $validitasItems = [];
            foreach ($questions as $question) {
                $questionId = $question->id;

                if (!isset($kunciJawaban[$questionId])) {
                    $validitasItems[$questionId] = null;
                    continue;
                }

                $itemScoreArray = $itemScoresForCorrelation[$questionId];

                if ($totalParticipants > 1 && count($itemScoreArray) === $totalParticipants) {
                    $correlation = $this->calculatePearsonCorrelation($itemScoreArray, $totalScoresArrayForCorrelation, $useSampleVariance);
                    $validitasItems[$questionId] = $correlation;
                } else {
                    $validitasItems[$questionId] = null;
                }
            }


            // --- PERHITUNGAN TINGKAT KESUKARAN (Difficulty Level / P-value) ---
            $tingkatKesukaranItems = [];
            foreach ($questions as $question) {
                $questionId = $question->id;

                if (!isset($kunciJawaban[$questionId])) {
                    $tingkatKesukaranItems[$questionId] = null;
                    continue;
                }

                $correctCount = array_sum($itemScoresForCorrelation[$questionId]);
                $tingkatKesukaranItems[$questionId] = ($totalParticipants > 0) ? ($correctCount / $totalParticipants) : null;
            }


            // --- PERHITUNGAN DAYA BEDA (Discrimination Index) ---
            $dayaBedaItems = [];
            arsort($participantTotalScores); // Urutkan peserta berdasarkan skor total mereka (descending)

            $groupPercentage = 0.27; // 27% adalah standar umum
            $numInGroup = floor($totalParticipants * $groupPercentage);

            if ($numInGroup < 1) {
                $dayaBedaItems = array_fill_keys($questionIdsWithKeys, null);
            } else {
                $upperGroup = array_slice($participantTotalScores, 0, $numInGroup, true);
                $lowerGroup = array_slice($participantTotalScores, -$numInGroup, $numInGroup, true);

                foreach ($questions as $question) {
                    $questionId = $question->id;

                    if (!isset($kunciJawaban[$questionId])) {
                        $dayaBedaItems[$questionId] = null;
                        continue;
                    }

                    $correctInUpperGroup = 0;
                    foreach ($upperGroup as $kodePeserta => $score) {
                        $correctInUpperGroup += $participantScoresRaw[$kodePeserta][$questionId] ?? 0;
                    }

                    $correctInLowerGroup = 0;
                    foreach ($lowerGroup as $kodePeserta => $score) {
                        $correctInLowerGroup += $participantScoresRaw[$kodePeserta][$questionId] ?? 0;
                    }

                    $dayaBedaItems[$questionId] = ($numInGroup > 0) ? (($correctInUpperGroup - $correctInLowerGroup) / $numInGroup) : null;
                }
            }


            // --- PERHITUNGAN KUALITAS PENGECOH (Distractor Analysis) ---
            $kualitasPengecohItems = [];
            if ($numInGroup >= 1) {
                foreach ($questions as $question) {
                    $questionId = $question->id;

                    if (!isset($kunciJawaban[$questionId])) {
                        $kualitasPengecohItems[$questionId] = [
                            'summary_message' => 'Tidak ada kunci jawaban.',
                            'options' => [] // Mengganti 'distractors' menjadi 'options'
                        ];
                        continue;
                    }

                    $correctAnswerCode = $kunciJawaban[$questionId];
                    $optionsForQuestion = $allOptions->get($questionId);

                    if ($optionsForQuestion->isEmpty()) {
                        $kualitasPengecohItems[$questionId] = [
                            'summary_message' => 'Tidak ada opsi jawaban.',
                            'options' => []
                        ];
                        continue;
                    }

                    $optionAnalysis = [];
                    foreach ($optionsForQuestion as $option) {
                        $optionCode = $option->option_code;
                        $isCorrectOption = $option->is_right;

                        $countUpper = 0;
                        $countLower = 0;
                        $countTotal = 0;

                        foreach ($allKodePeserta as $kodePeserta) {
                            $answer = $participantItemAnswers[$kodePeserta][$questionId] ?? null;

                            if ($answer === $optionCode) {
                                $countTotal++;
                                if (isset($upperGroup[$kodePeserta])) {
                                    $countUpper++;
                                } elseif (isset($lowerGroup[$kodePeserta])) {
                                    $countLower++;
                                }
                            }
                        }

                        $upperProp = ($numInGroup > 0) ? ($countUpper / $numInGroup) : 0;
                        $lowerProp = ($numInGroup > 0) ? ($countLower / $numInGroup) : 0;
                        $totalProp = ($totalParticipants > 0) ? ($countTotal / $totalParticipants) : 0;

                        $effectivenessScore = null; // Skor efektivitas 0-1 untuk pengecoh
                        $qualityRating = "Tidak Cukup Data";

                        if (!$isCorrectOption) { // Hanya untuk pengecoh (opsi yang salah)
                            if ($totalParticipants > 0) {
                                // Pengecoh efektif jika menarik lebih banyak kelompok bawah daripada atas
                                // Dan secara umum menarik sejumlah peserta
                                if ($lowerProp > $upperProp && $totalProp > 0.05) { // Misalnya minimal 5% memilih
                                    $effectivenessScore = $lowerProp - $upperProp; // Selisih proporsi
                                    $qualityRating = "Efektif";
                                    if ($effectivenessScore < 0.10) $qualityRating = "Cukup Efektif"; // Contoh ambang batas
                                } elseif ($lowerProp == $upperProp && $totalProp > 0) {
                                    $effectivenessScore = 0.0;
                                    $qualityRating = "Netral";
                                } elseif ($upperProp > $lowerProp && $totalProp > 0) {
                                    $effectivenessScore = $lowerProp - $upperProp; // Akan negatif
                                    $qualityRating = "Terbalik / Perlu Revisi";
                                } else {
                                    $effectivenessScore = 0.0;
                                    $qualityRating = "Tidak Dipilih";
                                }
                            } else {
                                $effectivenessScore = null;
                                $qualityRating = "Tidak Cukup Data";
                            }
                        } else { // Ini adalah kunci jawaban
                            $effectivenessScore = $upperProp - $lowerProp; // Kunci harus menarik upper lebih dari lower
                            if ($upperProp > 0.7 && $upperProp > $lowerProp) {
                                $qualityRating = "Sangat Baik";
                            } elseif ($upperProp > 0.4 && $upperProp > $lowerProp) {
                                $qualityRating = "Baik";
                            } else {
                                $qualityRating = "Perlu Cek (Kunci)";
                            }
                        }


                        $optionAnalysis[$optionCode] = [
                            'is_correct' => $isCorrectOption,
                            'total_prop' => $totalProp, // Proporsi total yang memilih opsi ini
                            'upper_prop' => $upperProp, // Proporsi kelompok atas
                            'lower_prop' => $lowerProp, // Proporsi kelompok bawah
                            'effectiveness_score' => $effectivenessScore, // Untuk pengecoh: 0-1, untuk kunci: -1-1
                            'quality_rating' => $qualityRating, // Penilaian kualitatif
                        ];
                    }
                    $kualitasPengecohItems[$questionId] = [
                        'options' => $optionAnalysis,
                        'summary_message' => 'Analisis selesai.'
                    ];
                }
            } else {
                $kualitasPengecohItems = array_fill_keys($questionIdsWithKeys, [
                    'summary_message' => 'Tidak cukup peserta untuk analisis kelompok.',
                    'options' => []
                ]);
            }


            return response()->json([
                'message' => 'Analisis validitas, reliabilitas, tingkat kesukaran, daya beda, dan kualitas pengecoh berhasil dihitung.',
                'status' => 'success',
                'analisis' => [
                    'validitas_soal' => $validitasItems,
                    'reliabilitas_tes' => $alpha,
                    'tingkat_kesukaran' => $tingkatKesukaranItems,
                    'daya_beda' => $dayaBedaItems,
                    'kualitas_pengecoh' => $kualitasPengecohItems, // <-- BARU
                    // Tambahan informasi untuk debugging/detail jika perlu
                    // 'k_items' => $numberOfItems,
                    // 'sum_of_item_variances' => $sumOfItemVariances,
                    // 'total_score_variance' => $totalScoreVariance,
                    // 'all_kode_peserta_sorted' => $allKodePeserta,
                    // 'item_scores_for_correlation' => $itemScoresForCorrelation,
                    // 'total_scores_for_correlation' => $totalScoresArrayForCorrelation,
                    // 'participant_total_scores_raw' => $participantTotalScores,
                    // 'upper_group_members' => $upperGroup ?? [],
                    // 'lower_group_members' => $lowerGroup ?? [],
                ],
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Gagal menghitung analisis: ' . $e->getMessage() . ' Trace: ' . $e->getTraceAsString());
            return response()->json([
                'message' => 'Terjadi kesalahan saat menghitung analisis: ' . $e->getMessage(),
                'status' => 'error'
            ], 500);
        }
    }

    /**
     * Fungsi pembantu untuk menghitung Pearson Correlation Coefficient.
     */
    private function calculatePearsonCorrelation(array $x, array $y, bool $useSampleVariance = false): ?float
    {
        $n = count($x);
        if ($n <= 1 || $n !== count($y)) {
            return null;
        }

        $sumX = array_sum($x);
        $sumY = array_sum($y);
        $sumXY = 0;
        $sumX2 = 0; // Sum of X squared
        $sumY2 = 0; // Sum of Y squared

        for ($i = 0; $i < $n; $i++) {
            $sumXY += ($x[$i] * $y[$i]);
            $sumX2 += ($x[$i] * $x[$i]);
            $sumY2 += ($y[$i] * $y[$i]);
        }

        $numerator = ($n * $sumXY) - ($sumX * $sumY);
        $stdDevX = $this->calculateStandardDeviation($x, $useSampleVariance);
        $stdDevY = $this->calculateStandardDeviation($y, $useSampleVariance);

        if ($stdDevX == 0 || $stdDevY == 0) {
            return null; // Hindari pembagian dengan nol jika salah satu varian nol
        }
        $denominator = sqrt(($n * $sumX2 - $sumX * $sumX) * ($n * $sumY2 - $sumY * $sumY));

        if ($denominator == 0) {
            return null;
        }

        return $numerator / $denominator;
    }

    /**
     * Fungsi pembantu untuk menghitung varian dari sebuah array numerik.
     * @param bool $is_sample Jika true, akan menghitung varian sampel (dibagi n-1). Jika false, varian populasi (dibagi n).
     */
    private function calculateVariance(array $data, bool $is_sample = false): float
    {
        $n = count($data);
        if ($n <= 1) {
            return 0.0;
        }

        $mean = array_sum($data) / $n;
        $sumSquaredDifferences = 0;

        foreach ($data as $value) {
            $sumSquaredDifferences += pow($value - $mean, 2);
        }

        $divisor = $is_sample ? ($n - 1) : $n;

        if ($divisor == 0) {
            return 0.0;
        }

        return $sumSquaredDifferences / $divisor;
    }

    /**
     * Fungsi pembantu untuk menghitung standar deviasi.
     * @param bool $is_sample Jika true, akan menghitung standar deviasi sampel. Jika false, standar deviasi populasi.
     */
    private function calculateStandardDeviation(array $data, bool $is_sample = false): float
    {
        $variance = $this->calculateVariance($data, $is_sample);
        return sqrt(max(0.0, $variance));
    }
}
