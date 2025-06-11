"use client";
import Loader from "@/components/Loader";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import "jsuites/dist/jsuites.css";
import axios from 'axios';
import { myAppHook } from "@/context/AppProvider";
import { useRouter, useParams } from "next/navigation";
import { Spreadsheet, Worksheet } from "@jspreadsheet-ce/react";
import React, { useRef, useEffect, useState } from "react";
import toast from 'react-hot-toast'; // Pastikan Anda mengimpor toast

type Question = {
    id: number;
    // Mungkin ada properti lain seperti text: string;
};

export default function Jawaban() {
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const params = useParams<{ id: any; tag: string; item: string }>();
    const [questions, setQuestions] = useState<Question[]>([]);
    const { authToken } = myAppHook();
    const [kodePesertaList, setKodePesertaList] = useState<string[]>([]);
    const [initialSpreadsheetData, setInitialSpreadsheetData] = useState<(string | null)[][]>([]);

    const minRows = 10;

    // Awalnya generate kodePesertaList dan data awal untuk minRows
    useEffect(() => {
        const generatedList: string[] = [];
        for (let i = 0; i < minRows; i++) {
            generatedList.push(`Peserta_${i + 1}`);
        }
        setKodePesertaList(generatedList);
        // Inisialisasi initialSpreadsheetData di sini juga agar Jspreadsheet tidak kosong sebelum data dimuat
        // Ini penting jika pertanyaan belum dimuat saat Jspreadsheet dirender pertama kali
        // setInitialSpreadsheetData(Array.from({ length: minRows }, () => Array(questions.length).fill(null))); // questions.length bisa 0 di awal
    }, [minRows]);


    useEffect(() => {
        setLoading(true);
        if (!authToken) {
            router.push("/auth");
            return;
        }

        const fetchData = async () => {
            try {
                const questionsResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/projects/${params.id}/questions`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                setQuestions(questionsResponse.data.questions);

                const answersResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/projects/${params.id}/answers`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });

                if (answersResponse.data.jawaban_data && answersResponse.data.jawaban_data.length > 0) {
                    // Update kodePesertaList dan data dari DB
                    setKodePesertaList(answersResponse.data.kode_peserta_list);
                    setInitialSpreadsheetData(answersResponse.data.jawaban_data);
                } else {
                    // Jika tidak ada data jawaban dari DB, inisialisasi dengan data kosong sesuai minRows
                    // dan kodePesertaList sudah di-generate oleh useEffect terpisah
                    setInitialSpreadsheetData(
                        Array.from({ length: minRows }, () => Array(questionsResponse.data.questions.length || minCols).fill(null))
                    );
                }
            } catch (error) {
                console.error("Gagal mengambil data awal:", error);
                toast.error("Gagal memuat data. Mohon coba lagi.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [authToken, params.id, router, minRows]);

    const spreadsheetRef = useRef<any>(null);

    const handleSave = async () => {
        if (!spreadsheetRef.current) {
            console.error("Spreadsheet reference is not available.");
            return;
        }

        const allData = spreadsheetRef.current[0].getData();
        console.log("Data mentah dari jspreadsheet (termasuk kosong):", allData);

        const questionIds = questions.map(q => q.id);

        const filteredKodePesertaList: string[] = [];
        const filteredJawabanData: (string | null)[][] = [];

        // Buat daftar kode peserta yang baru berdasarkan data di spreadsheet
        const newGeneratedKodePesertaList: string[] = []; // Untuk update kodePesertaList state
        let currentPesertaIndex = 0; // Untuk mengelola index peserta jika ada baris kosong di awal

        allData.forEach((row, index) => {
            const answersForRow = row.map(cell => {
                const cellValue = String(cell).trim();
                return cellValue === '' || cellValue.toLowerCase() === 'null' ? null : cellValue;
            });

            // Hanya proses dan kirim baris yang memiliki setidaknya satu jawaban non-null
            if (answersForRow.some(cell => cell !== null)) {
                // Generate kode peserta untuk baris yang ada datanya
                const kodePeserta = `Peserta_${currentPesertaIndex + 1}`;
                newGeneratedKodePesertaList.push(kodePeserta); // Tambahkan ke daftar baru
                filteredKodePesertaList.push(kodePeserta);
                filteredJawabanData.push(answersForRow);
                currentPesertaIndex++; // Increment index untuk peserta berikutnya
            }
        });

        // Set state kodePesertaList dengan daftar kode peserta yang baru digenerate
        // Ini akan memicu re-render dan update rowHeaders di Jspreadsheet
        setKodePesertaList(newGeneratedKodePesertaList.length > 0 ? newGeneratedKodePesertaList : Array.from({ length: minRows }, (_, i) => `Peserta_${i + 1}`));
        // Jika tidak ada data yang valid, reset ke daftar default minRows


        if (questionIds.length === 0) {
            console.error("Tidak ada ID pertanyaan yang diambil. Pastikan API pertanyaan berfungsi.");
            toast.error("Terjadi kesalahan: ID pertanyaan tidak ditemukan. Mohon coba lagi.");
            return;
        }

        const isPayloadCompletelyEmpty = filteredJawabanData.length === 0;

        if (!isPayloadCompletelyEmpty && filteredJawabanData.some(row => row.length !== questionIds.length)) {
            console.error("Jumlah jawaban per peserta tidak sesuai dengan jumlah pertanyaan. Periksa data Jspreadsheet.");
            toast.error("Jumlah kolom jawaban tidak cocok dengan jumlah pertanyaan. Pastikan semua sel terisi atau kosong sesuai soal.");
            return;
        }

        const payload = {
            question_ids: questionIds,
            kode_peserta_list: filteredKodePesertaList, // Mengirim daftar kode peserta yang difilter
            jawaban_data: filteredJawabanData,
            delete_all_if_empty: isPayloadCompletelyEmpty,
        };

        console.log("Payload yang akan dikirim:", payload);

        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/projects/${params.id}/answers`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            console.log("Respon dari backend:", response.data);
            toast.success(response.data.message);

            // OPTIONAL: Setelah berhasil menyimpan, muat ulang data dari backend
            // Ini akan memastikan Jspreadsheet menampilkan data terbaru yang konsisten
            // fetchAllQuestions(); // Atau Anda bisa memanggil fetchData() lagi.

        } catch (error) {
            console.error("Gagal menyimpan jawaban:", error);
            if (axios.isAxiosError(error) && error.response) {
                console.error("Data error dari backend:", error.response.data);
                toast.error(`Gagal menyimpan: ${error.response.data.message || 'Terjadi kesalahan pada server.'}`);
            } else {
                toast.error("Terjadi kesalahan jaringan atau server.");
            }
        }
    };

    if (loading) {
        return <Loader />;
    } else {
        const minCols = questions.length > 0 ? questions.length : 10;
        // Gunakan initialSpreadsheetData.length jika ada data dari DB,
        // jika tidak, gunakan kodePesertaList.length (yang dari minRows)
        const currentDisplayedRows = initialSpreadsheetData.length > 0 ? initialSpreadsheetData.length : kodePesertaList.length;


        return (
            <div className="d-flex align-items-center justify-content-center flex-column">
                <Spreadsheet ref={spreadsheetRef} toolbar={true}>
                    <Worksheet
                        minDimensions={[minCols, currentDisplayedRows]} // Atur tinggi Jspreadsheet sesuai data yang ditampilkan
                        data={initialSpreadsheetData}
                        allowInsertColumn={false}
                        columns={questions.map((q, index) => ({ title: `Soal ${index + 1}`, width: 80 }))}
                        rowHeaders={kodePesertaList} // Ini akan diperbarui setelah save
                    />
                </Spreadsheet>
                <div className="mt-3"> {/* Tambahkan margin atas */}
                    <button onClick={handleSave} disabled={loading || questions.length === 0} className="cta-button btn btn-primary">
                        {loading ? "Memuat..." : "Simpan"}
                    </button>
                </div>
            </div>
        );
    }
}