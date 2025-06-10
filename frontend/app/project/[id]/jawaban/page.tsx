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
    const params = useParams<{ id: any; tag: string; item: string }>();
    const [questions, setQuestions] = useState<Question[]>([]);
    const { authToken } = myAppHook();
    const [kodePesertaList, setKodePesertaList] = useState<string[]>([]);
    const spreadsheetRef = useRef<any>(null);
    const minRows = 10;

    useEffect(() => {
        const generatedList: string[] = [];
        for (let i = 0; i < minRows; i++) {
            generatedList.push(`Peserta_${i + 1}`);
        }
        setKodePesertaList(generatedList);
    }, [minRows]);

    useEffect(() => {
        setLoading(true);
        if (!authToken) {
            router.push("/auth");
            return;
        }
        fetchAllQuestions().finally(() => {
            setLoading(false);
        });
    }, [authToken, params.id, router]);

    // useEffect(() => {
    //     if (spreadsheetRef.current && spreadsheetRef.current[0]) {
    //         const spreadsheetInstance = spreadsheetRef.current[0];
    //         // spreadsheetInstance.setWidth(0, 150);
    //         // spreadsheetInstance.setWidth(1, 100);
    //     }
    // }, [questions, kodePesertaList]);

    const fetchAllQuestions = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/projects/${params.id}/questions`, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });
            setQuestions(response.data.questions);
            console.log("Pertanyaan yang berhasil dimuat:", response.data.questions);
        } catch (error) {
            console.error("Gagal mengambil semua pertanyaan:", error);
        }
    };

    const handleSave = async () => {
        if (!spreadsheetRef.current) {
            console.error("Spreadsheet reference is not available.");
            return;
        }

        const allData = spreadsheetRef.current[0].getData();
        console.log("Data mentah dari jspreadsheet (termasuk kosong):", allData);

        const questionIds = questions.map(q => q.id);

        const filteredKodePesertaList: string[] = []; // Daftar kode peserta yang benar-benar ada datanya
        const filteredJawabanData: (string | null)[][] = []; // Data jawaban yang valid

        // Iterasi semua baris dari Jspreadsheet
        allData.forEach((row, index) => {
            const kodePesertaSaatIni = kodePesertaList[index]; // Ambil kode peserta yang sudah digenerate/tersedia

            // Pastikan kode peserta untuk baris ini ada
            if (!kodePesertaSaatIni) {
                console.warn(`Kode peserta tidak ditemukan untuk baris indeks ${index}. Melewati baris ini.`);
                return;
            }

            const answersForRow = row.map(cell => {
                const cellValue = String(cell).trim();
                return cellValue === '' || cellValue.toLowerCase() === 'null' ? null : cellValue;
            });

            // Filter: Hanya kirim baris jika ada setidaknya satu jawaban non-null
            if (answersForRow.some(cell => cell !== null)) {
                filteredKodePesertaList.push(kodePesertaSaatIni);
                filteredJawabanData.push(answersForRow);
            }
            // Baris yang sepenuhnya null (tidak ada jawaban sama sekali) tidak akan masuk ke filteredJawabanData
        });

        // Validasi dasar
        if (questionIds.length === 0) {
            console.error("Tidak ada ID pertanyaan yang diambil. Pastikan API pertanyaan berfungsi.");
            alert("Terjadi kesalahan: ID pertanyaan tidak ditemukan. Mohon coba lagi.");
            return;
        }

        // Jika tidak ada data yang difilter sama sekali
        const isPayloadCompletelyEmpty = filteredJawabanData.length === 0;

        // Validasi jumlah kolom per baris jawaban (hanya untuk data yang akan dikirim)
        if (!isPayloadCompletelyEmpty && filteredJawabanData.some(row => row.length !== questionIds.length)) {
            console.error("Jumlah jawaban per peserta tidak sesuai dengan jumlah pertanyaan. Periksa data Jspreadsheet.");
            alert("Jumlah kolom jawaban tidak cocok dengan jumlah pertanyaan. Pastikan semua sel terisi atau kosong sesuai soal.");
            return;
        }

        const payload = {
            question_ids: questionIds,
            // Kirim daftar kode peserta yang hanya memiliki data
            kode_peserta_list: filteredKodePesertaList,
            // Kirim data jawaban yang sudah difilter
            jawaban_data: filteredJawabanData,
            // Flag ini sekarang menandakan jika *tidak ada data valid sama sekali* yang dikirim
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
            alert(response.data.message);
        } catch (error) {
            console.error("Gagal menyimpan jawaban:", error);
            if (axios.isAxiosError(error) && error.response) {
                console.error("Data error dari backend:", error.response.data);
                alert(`Gagal menyimpan: ${error.response.data.message || 'Terjadi kesalahan pada server.'}`);
            } else {
                alert("Terjadi kesalahan jaringan atau server.");
            }
        }
    };

    if (loading) {
        return <Loader />;
    } else {
        const minCols = questions.length > 0 ? questions.length : 10;
        const initialRows = kodePesertaList.length > 0 ? kodePesertaList.length : 6;

        return (
            <div>
                <Spreadsheet ref={spreadsheetRef} tabs={true} toolbar={true}>
                    <Worksheet
                        minDimensions={[minCols, initialRows]}
                        allowInsertColumn={false}
                        columns={questions.map((q, index) => ({ title: `Soal ${index + 1}`, width: 80 }))}
                        rows={kodePesertaList.map((kode) => ({ title: kode, width: 100 }))} // Menggunakan kodePesertaList sebagai nama baris
                    />
                </Spreadsheet>
                <button onClick={handleSave} disabled={loading || questions.length === 0}>
                    {loading ? "Memuat..." : "Simpan Data sebagai JSON"}
                </button>
            </div>
        );
    }
}