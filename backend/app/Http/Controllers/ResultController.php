<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\JawabanPeserta;
use App\Models\Project;
use App\Models\Question;
use App\Models\Option;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ResultController extends Controller
{
    // ... (method simpanJawaban dan getJawaban yang sudah ada)

    /**
     * Menggabungkan perhitungan validitas dan reliabilitas untuk suatu project.
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

            // 2. Ambil semua opsi jawaban yang benar
            $correctOptions = Option::whereIn('question_id', $questions->pluck('id'))
                                    ->where('is_right', true)
                                    ->pluck('option_code', 'question_id')
                                    ->toArray();

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

            $participantScoresRaw = []; // [kode_peserta => [question_id => score]]
            $totalScoresPerParticipant = []; // [kode_peserta => total_score]

            // Inisialisasi skor untuk semua peserta dan soal yang memiliki kunci jawaban
            // Ini penting untuk memastikan setiap peserta memiliki entri untuk setiap soal yang valid
            // meskipun mereka tidak menjawabnya (skor 0).
            foreach ($answers as $answer) {
                $kodePeserta = $answer->kode_peserta;
                $questionId = $answer->question_id;
                $jawabanPeserta = $answer->jawaban_huruf;

                if (!isset($kunciJawaban[$questionId])) {
                    continue;
                }

                $score = ($jawabanPeserta === $kunciJawaban[$questionId]) ? 1 : 0;

                $participantScoresRaw[$kodePeserta][$questionId] = $score;
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
            // Ini sangat penting untuk konsistensi.
            natsort($allKodePeserta); // Mengurutkan string 'Peserta_1', 'Peserta_10', 'Peserta_2' dengan benar

            // --- REKONSTRUKSI DATA UNTUK KORELASI & VARIAN SECARA KONSISTEN ---
            $totalScoresArrayForCorrelation = []; // Array total skor peserta (sesuai urutan $allKodePeserta)
            $itemScoresForCorrelation = [];      // [question_id => [skor_peserta_1, skor_peserta_2, ...]]

            // Inisialisasi struktur itemScoresForCorrelation dengan semua question_ids
            foreach ($questionIdsWithKeys as $qId) {
                $itemScoresForCorrelation[$qId] = [];
            }

            // Iterasi melalui peserta dalam urutan yang konsisten
            foreach ($allKodePeserta as $kodePeserta) {
                $currentParticipantTotalScore = 0;
                foreach ($questionIdsWithKeys as $qId) {
                    // Dapatkan skor item untuk peserta ini, default 0 jika tidak ada jawaban
                    $itemScore = $participantScoresRaw[$kodePeserta][$qId] ?? 0;

                    // Tambahkan skor item ke array itemScoresForCorrelation
                    $itemScoresForCorrelation[$qId][] = $itemScore;

                    // Tambahkan skor item ke total skor peserta ini
                    $currentParticipantTotalScore += $itemScore;
                }
                $totalScoresArrayForCorrelation[] = $currentParticipantTotalScore;
            }
            // Kini $totalScoresArrayForCorrelation dan setiap $itemScoresForCorrelation[$qId]
            // memiliki panjang yang sama dan urutan yang sama (sesuai $allKodePeserta).


            // --- PERHITUNGAN VARIAN (Populasi atau Sampel) ---
            // Set ini menjadi TRUE jika Excel Anda menggunakan VAR.S atau STDEV.S
            // Jika tidak, biarkan FALSE (ini standar untuk psikometri, VAR.P / STDEV.P)
            $useSampleVariance = true; // <--- Sesuaikan ini dengan Excel Anda!


            // --- PERHITUNGAN RELIABILITAS (Cronbach's Alpha) ---
            $alpha = null;
            $sumOfItemVariances = 0;
            // Hitung varian total skor
            $totalScoreVariance = $this->calculateVariance($totalScoresArrayForCorrelation, $useSampleVariance);

            // Hitung varian setiap item dan jumlahkan
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

                if (count($itemScoreArray) > 1 && count($itemScoreArray) === count($totalScoresArrayForCorrelation)) {
                    // Kirim parameter $useSampleVariance ke fungsi korelasi Pearson
                    $correlation = $this->calculatePearsonCorrelation($itemScoreArray, $totalScoresArrayForCorrelation, $useSampleVariance);
                    $validitasItems[$questionId] = $correlation;
                } else {
                    $validitasItems[$questionId] = null;
                }
            }


            return response()->json([
                'message' => 'Analisis validitas dan reliabilitas berhasil dihitung.',
                'status' => 'success',
                'analisis' => [
                    'validitas_soal' => $validitasItems,
                    'reliabilitas_tes' => $alpha,
                    'k_items' => $numberOfItems,
                    'sum_of_item_variances' => $sumOfItemVariances,
                    'total_score_variance' => $totalScoreVariance,
                    // Tambahan untuk debugging, bisa dihapus di production
                    'all_kode_peserta_sorted' => $allKodePeserta,
                    'item_scores_for_correlation' => $itemScoresForCorrelation,
                    'total_scores_for_correlation' => $totalScoresArrayForCorrelation,
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
     * x dan y adalah array numerik dengan panjang yang sama.
     * @param bool $useSampleVariance Jika true, akan menggunakan standar deviasi sampel dalam perhitungan denominator.
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

        // Denominator (standard definition based on sums of squares)
        // This implicitly works with N or N-1 based on how N and N-1 are used in std dev
        // For CORREL in Excel, this form is usually robust if data is consistent.
        // It relies on the consistency of the variance calculation.

        // Perbaikan: Gunakan standard deviasi yang dihitung dengan parameter $useSampleVariance
        $stdDevX = $this->calculateStandardDeviation($x, $useSampleVariance);
        $stdDevY = $this->calculateStandardDeviation($y, $useSampleVariance);

        if ($stdDevX == 0 || $stdDevY == 0) {
            return null; // Hindari pembagian dengan nol jika salah satu varian nol
        }

        // Rumus Pearson: Cov(X,Y) / (StdDev(X) * StdDev(Y))
        // Cov(X,Y) = (Sum(XY) - Sum(X)Sum(Y)/N) / (N-1) (for sample covariance)
        // Cov(X,Y) = (Sum(XY) - Sum(X)Sum(Y)/N) / N (for population covariance)
        // Atau, bisa juga pakai rumus aslinya: (N * Sum(XY) - Sum(X) * Sum(Y)) / sqrt((N * Sum(X^2) - (Sum(X))^2) * (N * Sum(Y^2) - (Sum(Y))^2))
        // Rumus yang terakhir ini yang paling umum diimplementasikan dan harus cocok dengan CORREL di Excel
        // jika data inputnya sama persis dan tidak ada pembulatan yang aneh.

        $denominator = sqrt( ($n * $sumX2 - $sumX * $sumX) * ($n * $sumY2 - $sumY * $sumY) );

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
            return 0.0; // Varian nol atau tidak terdefinisi untuk data kurang dari 2
        }

        $mean = array_sum($data) / $n;
        $sumSquaredDifferences = 0;

        foreach ($data as $value) {
            $sumSquaredDifferences += pow($value - $mean, 2);
        }

        $divisor = $is_sample ? ($n - 1) : $n; // Pembagi berdasarkan populasi atau sampel

        if ($divisor == 0) {
             return 0.0; // Hindari pembagian dengan nol jika hanya 1 data dan diminta sampel
        }

        return $sumSquaredDifferences / $divisor;
    }

    /**
     * Fungsi pembantu untuk menghitung standar deviasi.
     * @param bool $is_sample Jika true, akan menghitung standar deviasi sampel. Jika false, standar deviasi populasi.
     */
    private function calculateStandardDeviation(array $data, bool $is_sample = false): float
    {
        // Pastikan varian tidak negatif (bisa terjadi karena floating point error)
        $variance = $this->calculateVariance($data, $is_sample);
        return sqrt(max(0.0, $variance)); // max(0.0, ...) untuk menghindari sqrt dari angka negatif kecil
    }
}
