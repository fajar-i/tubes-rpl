<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\JawabanPeserta;
use App\Models\Project;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AnswerController extends Controller
{
    public function simpanJawaban(Request $request, Project $project)
    {
        try {
            $validatedData = $request->validate([
                'question_ids' => 'required|array',
                'question_ids.*' => 'required|integer|exists:questions,id',
                'kode_peserta_list' => 'array', // Izinkan kosong jika tidak ada data valid
                'kode_peserta_list.*' => 'required|string|max:255',
                'jawaban_data' => 'array', // Izinkan kosong jika tidak ada data valid
                'jawaban_data.*' => 'array',
                'jawaban_data.*.*' => 'nullable|string|max:1',
                'delete_all_if_empty' => 'boolean',
            ], [
                'question_ids.required' => 'Daftar ID pertanyaan tidak boleh kosong.',
                'question_ids.*.required' => 'ID pertanyaan wajib diisi.',
                'question_ids.*.integer' => 'ID pertanyaan harus berupa angka.',
                'question_ids.*.exists' => 'ID pertanyaan tidak ditemukan.',
                'kode_peserta_list.array' => 'Format daftar kode peserta tidak valid.',
                'kode_peserta_list.*.required' => 'Kode peserta wajib diisi.',
                'kode_peserta_list.*.string' => 'Kode peserta harus berupa teks.',
                'jawaban_data.array' => 'Format data jawaban tidak valid.',
                'jawaban_data.*.array' => 'Format array jawaban peserta tidak valid.',
                'jawaban_data.*.*.string' => 'Jawaban harus berupa huruf.',
                'jawaban_data.*.*.max' => 'Jawaban hanya boleh 1 karakter.',
            ]);

            $questionIds = $validatedData['question_ids'];
            $kodePesertaList = $validatedData['kode_peserta_list'] ?? []; // Ambil, default ke array kosong
            $jawabanData = $validatedData['jawaban_data'] ?? []; // Ambil, default ke array kosong
            $deleteAllIfEmpty = $validatedData['delete_all_if_empty'];

            DB::beginTransaction();

            // LOGIKA PENGHAPUSAN MASAL:
            // Ini akan menghapus SEMUA data jawaban untuk project ini jika frontend mengirim
            // `delete_all_if_empty` sebagai `true` (karena spreadsheet kosong total)
            if ($deleteAllIfEmpty) {
                JawabanPeserta::where('project_id', $project->id)->delete();
                DB::commit();
                return response()->json([
                    'message' => 'Semua jawaban terkait project ini berhasil dihapus.',
                    'status' => 'success'
                ], 200);
            }

            // Validasi tambahan (jika bukan hapus semua)
            if (!empty($jawabanData) && count($jawabanData) !== count($kodePesertaList)) {
                return response()->json([
                    'message' => 'Jumlah baris jawaban tidak sesuai dengan jumlah kode peserta yang diberikan.',
                    'status' => 'error'
                ], 422);
            }
            if (!empty($jawabanData)) {
                foreach ($jawabanData as $pesertaJawaban) {
                    if (count($pesertaJawaban) !== count($questionIds)) {
                        return response()->json([
                            'message' => 'Jumlah jawaban per peserta tidak sesuai dengan jumlah pertanyaan yang diberikan.',
                            'status' => 'error'
                        ], 422);
                    }
                }
            }

            // **LOGIKA PENGHAPUSAN PESERTA YANG TIDAK TERDAFTAR (BARU)**
            if (!empty($kodePesertaList)) {
                // Ambil daftar kode peserta yang saat ini ada di database untuk project ini
                $existingKodePeserta = JawabanPeserta::where('project_id', $project->id)
                                                    ->pluck('kode_peserta')
                                                    ->unique()
                                                    ->toArray();

                // Identifikasi kode peserta yang ada di DB tapi tidak ada di payload frontend
                $kodePesertaToDelete = array_diff($existingKodePeserta, $kodePesertaList);

                if (!empty($kodePesertaToDelete)) {
                    // Hapus semua jawaban untuk kode peserta yang tidak lagi terdaftar di frontend
                    JawabanPeserta::where('project_id', $project->id)
                                ->whereIn('kode_peserta', $kodePesertaToDelete)
                                ->delete();
                }
            } else {
                // Jika kodePesertaList dari frontend kosong, artinya tidak ada peserta yang dikirim.
                // Dalam kasus ini, kita ingin menghapus semua jawaban untuk project ini,
                // karena tidak ada peserta aktif yang dikirim.
                // Ini menangani kasus jika spreadsheet dikosongkan sampai tidak ada baris yang valid sama sekali.
                JawabanPeserta::where('project_id', $project->id)->delete();
            }
            // **AKHIR LOGIKA PENGHAPUSAN PESERTA YANG TIDAK TERDAFTAR**


            $jawabanToUpsert = [];

            // Siapkan data untuk UPSERT (semua, termasuk null)
            foreach ($jawabanData as $pesertaIndex => $jawabanPeserta) {
                $kodePeserta = $kodePesertaList[$pesertaIndex];

                foreach ($jawabanPeserta as $jawabanIndex => $jawabanHuruf) {
                    $questionId = $questionIds[$jawabanIndex];

                    $jawabanToUpsert[] = [
                        'project_id' => $project->id,
                        'kode_peserta' => $kodePeserta,
                        'question_id' => $questionId,
                        'jawaban_huruf' => $jawabanHuruf, // Akan simpan NULL jika $jawabanHuruf adalah NULL
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }

            if (!empty($jawabanToUpsert)) {
                JawabanPeserta::upsert(
                    $jawabanToUpsert,
                    ['project_id', 'kode_peserta', 'question_id'],
                    ['jawaban_huruf', 'updated_at']
                );
            }

            DB::commit();

            return response()->json([
                'message' => 'Jawaban peserta berhasil diproses (disimpan/diperbarui/dihapus)!',
                'status' => 'success'
            ], 200);

        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
                'status' => 'error'
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Kesalahan Upsert Jawaban: ' . $e->getMessage() . ' Trace: ' . $e->getTraceAsString());
            return response()->json([
                'message' => 'Terjadi kesalahan saat memproses jawaban: ' . $e->getMessage(),
                'status' => 'error'
            ], 500);
        }
    }
}
