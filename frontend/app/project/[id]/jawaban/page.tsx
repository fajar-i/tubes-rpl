"use client";
import Loader from "@/components/Loader";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import "jsuites/dist/jsuites.css";
import axios from 'axios';
import { myAppHook } from "@/context/AppProvider";
import { useRouter, useParams } from "next/navigation";
import { Spreadsheet, Worksheet } from "@jspreadsheet-ce/react";
import React, { useRef, useEffect, useState } from "react";

type Question = {
    id: number;
    // Mungkin ada properti lain seperti text: string;
};

export default function Jawaban() {
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const params = useParams<{ id: any; tag: string; item: string }>()
    const [questions, setQuestions] = useState<Question[]>([]);
    const { authToken } = myAppHook();
    const [kodePesertaList, setKodePesertaList] = useState<string[]>([]);

    useEffect(() => {
        setLoading(true);
        if (!authToken) {
            router.push("/auth");
            return;
        }
        fetchAllQuestions().finally(() => {
            setLoading(false);
        });
    }, [authToken]); // Tambahkan dependensi lain jika kodePesertaList diambil dari state/props

    useEffect(() => {
        console.log("Current questions state:", questions);
        // Anda juga bisa melihat questionIds yang terbuat dari state ini
        const questionIds = questions.map(q => q.id);
        console.log("Current question IDs:", questionIds);
    }, [questions]); // Jalankan setiap kali `questions` berubah

    const fetchAllQuestions = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/projects/${params.id}/questions`, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            })
            setQuestions(response.data.questions);
            console.log(response.data.questions);
            console.log(questions);
        } catch (error) {
            console.log("fetch all questions error : " + error);
        }
    };

    const spreadsheetRef = useRef(null);

    const handleSave = async () => {
        if (spreadsheetRef.current) {
            const allData = spreadsheetRef.current[0].getData();
            const generatedKodePesertaList: string[] = [];
            const jawabanDataValid: (string | null)[][] = [];
            console.log("Data mentah dari jspreadsheet:", allData);

            // Filter baris yang benar-benar memiliki data
            const nonEmptyRows = allData.filter(row =>
                row && row.length > 0 && row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== '')
            );

            if (nonEmptyRows.length === 0) {
                console.warn("Tidak ada data yang valid untuk disimpan.");
                alert("Tidak ada data yang valid untuk disimpan.");
                return;
            }

            // Iterasi hanya pada baris yang memiliki data untuk mengenerate kode peserta dan mengekstrak jawaban
            nonEmptyRows.forEach((row, index) => {
                // Generate kode peserta secara dinamis dan rapih (1 sampai N)
                const kodePeserta = `PESERTA_${index + 1}`;
                generatedKodePesertaList.push(kodePeserta);

                // Ekstrak jawaban dari baris ini
                const answersForRow = row.map(cell => {
                    const cellValue = String(cell).trim();
                    return cellValue === '' ? null : cellValue; // Jika kosong, kirim null
                });
                jawabanDataValid.push(answersForRow);
            });

            // Set state kodePesertaList dengan daftar kode peserta yang baru digenerate
            // Penting: Pastikan ini dilakukan SETELAH loop selesai
            setKodePesertaList(generatedKodePesertaList);

            const questionIds = questions.map(q => q.id); // Mendapatkan ID pertanyaan dari state

            // Validasi tambahan sebelum mengirim
            if (questionIds.length === 0) {
                console.error("Tidak ada ID pertanyaan yang diambil. Pastikan API pertanyaan berfungsi.");
                return;
            }
            if (kodePesertaList.length === 0 || jawabanDataValid.length === 0) {
                console.warn("Tidak ada data peserta atau jawaban untuk disimpan.");
                return;
            }
            // Pastikan jumlah baris jawaban sama dengan jumlah kode peserta
            if (jawabanDataValid.length !== kodePesertaList.length) {
                console.error("Jumlah baris jawaban tidak sesuai dengan jumlah kode peserta yang disediakan.");
                return;
            }
            // Pastikan jumlah kolom jawaban per peserta sama dengan jumlah pertanyaan
            if (jawabanDataValid.some(row => row.length !== questionIds.length)) {
                console.error("Jumlah jawaban per peserta tidak sesuai dengan jumlah pertanyaan. Periksa data jspreadsheet.");
                return;
            }

            const payload = {
                question_ids: questionIds,
                kode_peserta_list: kodePesertaList, // Ambil dari state atau sumber lain
                jawaban_data: jawabanDataValid,
            };

            console.log("Payload yang akan dikirim:", payload);

            try {
                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/projects/${params.id}/answers`, // Sesuaikan dengan route API Anda
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
                console.log("Respon dari backend:", response.data);
                alert(response.data.message); // Tampilkan pesan sukses
            } catch (error) {
                console.error("Gagal menyimpan jawaban:", error);
                if (axios.isAxiosError(error) && error.response) {
                    console.error("Error response data:", error.response.data);
                    alert(`Gagal menyimpan: ${error.response.data.message || 'Terjadi kesalahan'}`);
                } else {
                    alert("Terjadi kesalahan jaringan atau server.");
                }
            }
        }
    };

    if (loading) {
        return <Loader />;
    } else {
        // Render component
        return (
            <div>
                <Spreadsheet ref={spreadsheetRef} tabs={true} toolbar={true}>
                    <Worksheet
                        minDimensions={[questions.length, 6]} // Jumlah kolom sesuai jumlah pertanyaan
                        allowInsertColumn={false}
                        columns={questions.map((q, index) => ({ title: `Pertanyaan ${index + 1} (ID: ${q.id})`, width: 50 }))}
                    // Anda mungkin ingin menambahkan header untuk kolom
                    // Jika Anda menggunakan nama baris (row headers) di jspreadsheet,
                    // Anda bisa mengaturnya di sini atau saat inisialisasi JSS:
                    // rowHeaders: kodePesertaList,
                    />
                </Spreadsheet>
                <button onClick={handleSave}>Simpan Data sebagai JSON</button>
            </div>
        );
    }
}