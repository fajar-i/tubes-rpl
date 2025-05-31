<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\JawabanPeserta;
use App\Models\Project;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AnswerController extends Controller
{
    /**
     * Menyimpan atau memperbarui jawaban peserta dari frontend.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function simpanJawaban(Request $request, Project $project)
    {
        try {
            // Validasi data yang masuk
            $validatedData = $request->validate([

                'question_ids' => 'required|array',
                'question_ids.*' => 'required|integer|exists:questions,id',
                'kode_peserta_list' => 'required|array', // Tambahkan validasi untuk daftar kode peserta
                'kode_peserta_list.*' => 'required|string|max:255', // Setiap kode peserta harus string unik
                'jawaban_data' => 'required|array',
                'jawaban_data.*' => 'required|array',
                'jawaban_data.*.*' => 'nullable|string|max:1|in:A,B,C,D',
            ], [
                // Pesan validasi
                'question_ids.required' => 'Daftar ID pertanyaan tidak boleh kosong.',
                'question_ids.*.required' => 'ID pertanyaan wajib diisi.',
                'question_ids.*.integer' => 'ID pertanyaan harus berupa angka.',
                'question_ids.*.exists' => 'ID pertanyaan tidak ditemukan.',
                'kode_peserta_list.required' => 'Daftar kode peserta tidak boleh kosong.',
                'kode_peserta_list.*.required' => 'Kode peserta wajib diisi.',
                'kode_peserta_list.*.string' => 'Kode peserta harus berupa teks.',
                'jawaban_data.required' => 'Data jawaban tidak boleh kosong.',
                'jawaban_data.array' => 'Format data jawaban tidak valid.',
                'jawaban_data.*.required' => 'Setiap array jawaban peserta tidak boleh kosong.',
                'jawaban_data.*.array' => 'Format array jawaban peserta tidak valid.',
                'jawaban_data.*.*.string' => 'Jawaban harus berupa huruf.',
                'jawaban_data.*.*.max' => 'Jawaban hanya boleh 1 karakter.',
                'jawaban_data.*.*.in' => 'Jawaban tidak valid (harus A, B, C, atau D).',
            ]);

            $questionIds = $validatedData['question_ids'];
            $kodePesertaList = $validatedData['kode_peserta_list'];
            $jawabanData = $validatedData['jawaban_data'];


            // Penting: Pastikan jumlah baris jawaban sama dengan jumlah kode peserta
            if (count($jawabanData) !== count($kodePesertaList)) {
                return response()->json([
                    'message' => 'Jumlah baris jawaban tidak sesuai dengan jumlah kode peserta yang diberikan.',
                    'status' => 'error'
                ], 422);
            }

            // Penting: Pastikan jumlah kolom jawaban per peserta sama dengan jumlah question_ids
            foreach ($jawabanData as $pesertaJawaban) {
                if (count($pesertaJawaban) !== count($questionIds)) {
                    return response()->json([
                        'message' => 'Jumlah jawaban per peserta tidak sesuai dengan jumlah pertanyaan yang diberikan.',
                        'status' => 'error'
                    ], 422);
                }
            }

            DB::beginTransaction();

            $jawabanToProcess = [];

            // Siapkan data untuk upsert
            foreach ($jawabanData as $pesertaIndex => $jawabanPeserta) {
                $kodePeserta = $kodePesertaList[$pesertaIndex];

                foreach ($jawabanPeserta as $jawabanIndex => $jawabanHuruf) {
                    $pertanyaanId = $questionIds[$jawabanIndex];

                    $jawabanToProcess[] = [
                        'project_id' => $project->id,
                        'kode_peserta' => $kodePeserta,
                        'question_id' => $pertanyaanId,
                        'jawaban_huruf' => $jawabanHuruf, // Ini akan menyimpan null jika $jawabanHuruf kosong
                        'created_at' => now(), // Penting untuk `upsert` jika Anda punya timestamp
                        'updated_at' => now(), // Penting untuk `upsert` jika Anda punya timestamp
                    ];
                }
            }

            // Gunakan metode `upsert` untuk efisiensi.
            // Ini akan mencoba memperbarui record jika 'kode_peserta' dan 'pertanyaan_id' cocok,
            // atau membuat record baru jika tidak ada yang cocok.
            JawabanPeserta::upsert(
                $jawabanToProcess,
                ['kode_peserta', 'pertanyaan_id'], // Kolom yang harus unik (kunci untuk mengidentifikasi record)
                ['jawaban_huruf', 'updated_at'] // Kolom yang akan diperbarui jika record ditemukan
            );

            DB::commit();

            return response()->json([
                'message' => 'Jawaban peserta berhasil disimpan/diperbarui!',
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
            return response()->json([
                'message' => 'Terjadi kesalahan saat menyimpan jawaban: ' . $e->getMessage(),
                'status' => 'error'
            ], 500);
        }
    }
}
