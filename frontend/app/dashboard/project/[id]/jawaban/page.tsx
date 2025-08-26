"use client";
import Loader from "@/components/Loader";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import "jsuites/dist/jsuites.css";
import axios from 'axios';
import { useMyAppHook } from "@/context/AppProvider";
import { useRouter, useParams } from "next/navigation";
import { Spreadsheet, Worksheet } from "@jspreadsheet-ce/react";
import React, { useRef, useEffect, useState } from "react";
import toast from 'react-hot-toast';
import { AxiosInstance } from "@/lib/axios";
import { QuestionJawaban } from "@/types";
import Link from "next/link";

export default function Jawaban() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams<{ id: string; tag: string; item: string }>();
  const [questions, setQuestions] = useState<QuestionJawaban[]>([]);
  const { authToken } = useMyAppHook();
  const [kodePesertaList, setKodePesertaList] = useState<string[]>([]);
  const [initialSpreadsheetData, setInitialSpreadsheetData] = useState<(string | null)[][]>([]);

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

    const fetchData = async () => {
      try {
        const questionsResponse = await AxiosInstance.get(`/projects/${params.id}/questions`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        setQuestions(questionsResponse.data.questions);

        const answersResponse = await AxiosInstance.get(`/projects/${params.id}/answers`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });

        if (answersResponse.data.jawaban_data && answersResponse.data.jawaban_data.length > 0) {
          setKodePesertaList(answersResponse.data.kode_peserta_list);
          setInitialSpreadsheetData(answersResponse.data.jawaban_data);
        } else {
          const minCols = questionsResponse.data.questions.length > 0 ? questionsResponse.data.questions.length : 10;
          setInitialSpreadsheetData(
            Array.from({ length: minRows }, () => Array(minCols).fill(null))
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

  const spreadsheetRef = useRef<any>(null); // Revert to any for simplicity with external library

  const handleSave = async () => {
    if (!spreadsheetRef.current) {
      console.error("Spreadsheet reference is not available.");
      return;
    }

    // Access the jspreadsheet instance directly from the ref.
    // The Spreadsheet component from @jspreadsheet-ce/react typically exposes the jspreadsheet instance directly.
    const jspreadsheetInstance = spreadsheetRef.current[0]; // Assuming it's an array of instances
    if (!jspreadsheetInstance) {
      console.error("Jspreadsheet instance not found.");
      return;
    }

    const allData = jspreadsheetInstance.getData();
    console.log("Data mentah dari jspreadsheet (termasuk kosong):", allData);

    const questionIds = questions.map(q => q.id);

    const filteredKodePesertaList: string[] = [];
    const filteredJawabanData: (string | null)[][] = [];

    const newGeneratedKodePesertaList: string[] = [];
    let currentPesertaIndex = 0;

    allData.forEach((row: (string | null)[]) => { // Explicitly type row
      const answersForRow = row.map((cell: string | null) => { // Explicitly type cell
        const cellValue = String(cell).trim();
        return cellValue === '' || cellValue.toLowerCase() === 'null' ? null : cellValue;
      });

      if (answersForRow.some(cell => cell !== null)) {
        const kodePeserta = `Peserta_${currentPesertaIndex + 1}`;
        newGeneratedKodePesertaList.push(kodePeserta);
        filteredKodePesertaList.push(kodePeserta);
        filteredJawabanData.push(answersForRow);
        currentPesertaIndex++;
      }
    });

    setKodePesertaList(newGeneratedKodePesertaList.length > 0 ? newGeneratedKodePesertaList : Array.from({ length: minRows }, (_, i) => `Peserta_${i + 1}`));

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
      kode_peserta_list: filteredKodePesertaList,
      jawaban_data: filteredJawabanData,
      delete_all_if_empty: isPayloadCompletelyEmpty,
    };

    console.log("Payload yang akan dikirim:", payload);

    try {
      const response = await AxiosInstance.post(
        `/projects/${params.id}/answers`,
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
    const currentDisplayedRows = initialSpreadsheetData.length > 0 ? initialSpreadsheetData.length : kodePesertaList.length;

    return (
      <div className="container mx-auto py-4">
        <h1 className="text-3xl font-bold mb-2">Jawaban</h1>
        <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
          <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" id="default-tab" data-tabs-toggle="#default-tab-content" role="tablist">
            <li className="me-2" role="presentation">
              <Link href={`/dashboard/project/${params.id}/form`} className="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300" id="form-tab" type="button" role="tab" aria-controls="form" aria-selected="false">Form</Link>
            </li>
            <li className="me-2" role="presentation">
              <Link href={`/dashboard/project/${params.id}/jawaban`} className="inline-block p-4 border-b-2 rounded-t-lg text-blue-600 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-500 border-blue-600 dark:border-blue-500" id="jawaban-tab" type="button" role="tab" aria-controls="jawaban" aria-selected="true">Jawaban</Link>
            </li>
            <li className="me-2" role="presentation">
              <Link href={`/dashboard/project/${params.id}/result`} className="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300" id="result-tab" type="button" role="tab" aria-controls="result" aria-selected="false">Result</Link>
            </li>
          </ul>
        </div>
        <div className="flex flex-col items-center justify-center overflow-x-auto"> {/* Added overflow-x-auto */}
          <div className="min-w-full"> {/* Added min-w-full to ensure it takes full width */}
            <div className="flex space-x-2 mb-4">
              <button
                onClick={() => spreadsheetRef.current?.[0]?.undo()}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium"
              >
                Undo
              </button>
              <button
                onClick={() => spreadsheetRef.current?.[0]?.redo()}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium"
              >
                Redo
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
              >
                Save
              </button>
            </div>
            <Spreadsheet ref={spreadsheetRef}>
              <Worksheet
                minDimensions={[minCols, currentDisplayedRows]}
                data={initialSpreadsheetData}
                allowInsertColumn={false}
                columns={questions.map((q, index) => ({ title: `Soal ${index + 1}`, width: 80 }))}
                rowHeaders={kodePesertaList}
              />
            </Spreadsheet>
          </div>
          <div className="mt-3">
            <button onClick={handleSave} disabled={loading || questions.length === 0} className="px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
              {loading ? "Memuat..." : "Simpan"}
            </button>
          </div>
        </div>
      </div>
    );
  }
}
