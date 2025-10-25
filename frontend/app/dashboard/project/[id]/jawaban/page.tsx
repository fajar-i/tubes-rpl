"use client";
import Loader from "@/components/ui/Loader";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import "jsuites/dist/jsuites.css";
import axios from "axios";
import { useMyAppHook } from "@/context/AppProvider";
import { useRouter, useParams } from "next/navigation";
import { Spreadsheet, Worksheet } from "@jspreadsheet-ce/react";
import React, { useRef, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AxiosInstance } from "@/lib/axios";
import { QuestionJawaban } from "@/types";
import { DocumentIcon } from "@heroicons/react/24/outline";
import * as XLSX from 'xlsx';

export default function Jawaban() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams<{ id: string; tag: string; item: string }>();
  const [questions, setQuestions] = useState<QuestionJawaban[]>([]);
  const { authToken } = useMyAppHook();
  const [kodePesertaList, setKodePesertaList] = useState<string[]>([]);
  const [initialSpreadsheetData, setInitialSpreadsheetData] = useState<
    (string | null)[][]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    const fetchData = async () => {
      try {
        const questionsResponse = await AxiosInstance.get(
          `/projects/${params.id}/questions`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
        setQuestions(questionsResponse.data.questions);

        const answersResponse = await AxiosInstance.get(
          `/projects/${params.id}/answers`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );

        const jawabanData = answersResponse.data.jawaban_data;
        const kodePesertaFromApi = answersResponse.data.kode_peserta_list;

        if (jawabanData && jawabanData.length > 0) {
          if (
            kodePesertaFromApi &&
            kodePesertaFromApi.length === jawabanData.length
          ) {
            setKodePesertaList(kodePesertaFromApi);
          } else {
            const generatedList = Array.from(
              { length: jawabanData.length },
              (_, i) => `Peserta_${i + 1}`
            );
            setKodePesertaList(generatedList);
          }
          setInitialSpreadsheetData(jawabanData);
          
        } else {
          const minCols =
            questionsResponse.data.questions.length > 0
              ? questionsResponse.data.questions.length
              : 10;
          if (kodePesertaList.length === 0) {
            const defaultList = Array.from(
              { length: minRows },
              (_, i) => `Peserta_${i + 1}`
            );
            setKodePesertaList(defaultList);
          }

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
  }, [authToken, params.id, router, kodePesertaList.length]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const spreadsheetRef = useRef<any>(null);

  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert the worksheet to JSON with headers
        const rawData = XLSX.utils.sheet_to_json(worksheet, { 
          header: Array.from({ length: questions.length }, (_, i) => `Soal ${i + 1}`)
        });
        
        console.log("Raw data from Excel:", rawData);
        
        if (!Array.isArray(rawData) || rawData.length === 0) {
          toast.error('File Excel kosong atau tidak valid');
          return;
        }

        // Remove header row if it matches our generated headers
        if (rawData[0] && typeof rawData[0] === 'object' && 
            Object.keys(rawData[0]).every(key => key.startsWith('Soal '))) {
          rawData.shift();
        }

        // Process the data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parsedData: (string | null)[][] = rawData.map((row: any) => {
          const answers: (string | null)[] = [];
          for (let i = 0; i < questions.length; i++) {
            const key = `Soal ${i + 1}`;
            const cellValue = row[key];
            answers.push(cellValue !== undefined ? String(cellValue).trim() : null);
          }
          return answers;
        });

        if (parsedData.length === 0) {
          toast.error('File Excel kosong atau tidak valid');
          return;
        }

        // Update participant codes
        const newKodePesertaList = Array.from(
          { length: parsedData.length },
          (_, i) => `Peserta_${i + 1}`
        );

        // Force a clean update of the spreadsheet
        if (spreadsheetRef.current?.[0]) {
          try {
            spreadsheetRef.current[0].destroy();
          } catch (error) {
            console.log("Destroy error (can be ignored):", error);
          }
        }

        // Update states
        setInitialSpreadsheetData(parsedData);
        setKodePesertaList(newKodePesertaList);
        
        // Give the state time to update before updating the spreadsheet
        setTimeout(() => {
          if (spreadsheetRef.current?.[0]) {
            spreadsheetRef.current[0].setData(parsedData);
            console.log("Spreadsheet data updated");
          }
        }, 100);
        
        toast.success('Data Excel berhasil diimpor');
      } catch (error) {
        console.error('Error parsing Excel:', error);
        toast.error('Gagal mengimpor file Excel. Pastikan format file sesuai.');
      }
    };

    reader.onerror = () => {
      toast.error('Gagal membaca file Excel');
    };

    reader.readAsArrayBuffer(file);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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

    const questionIds = questions.map((q) => q.id);

    const filteredKodePesertaList: string[] = [];
    const filteredJawabanData: (string | null)[][] = [];

    const newGeneratedKodePesertaList: string[] = [];
    let currentPesertaIndex = 0;

    allData.forEach((row: (string | null)[]) => {
      // Explicitly type row
      const answersForRow = row.map((cell: string | null) => {
        // Explicitly type cell
        const cellValue = String(cell).trim();
        return cellValue === "" || cellValue.toLowerCase() === "null"
          ? null
          : cellValue;
      });

      if (answersForRow.some((cell) => cell !== null)) {
        const kodePeserta = `Peserta_${currentPesertaIndex + 1}`;
        newGeneratedKodePesertaList.push(kodePeserta);
        filteredKodePesertaList.push(kodePeserta);
        filteredJawabanData.push(answersForRow);
        currentPesertaIndex++;
      }
    });

    setKodePesertaList(
      newGeneratedKodePesertaList.length > 0
        ? newGeneratedKodePesertaList
        : Array.from({ length: minRows }, (_, i) => `Peserta_${i + 1}`)
    );

    if (questionIds.length === 0) {
      toast.error("Terjadi kesalahan: ID pertanyaan tidak ditemukan. Mohon coba lagi.");
      return;
    }

    const isPayloadCompletelyEmpty = filteredJawabanData.length === 0;

    if (
      !isPayloadCompletelyEmpty &&
      filteredJawabanData.some((row) => row.length !== questionIds.length)
    ) {
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

    try {
      await AxiosInstance.post(
        `/projects/${params.id}/answers`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Jawaban berhasil simpan");
    } catch (error) {
      console.error("Gagal menyimpan jawaban:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("Data error dari backend:", error.response.data);
        toast.error(`Gagal menyimpan: ${error.response.data.message || "Terjadi kesalahan pada server."}`);
      } else {
        toast.error("Terjadi kesalahan jaringan atau server.");
      }
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!questions || questions.length === 0) {
    return (
      <div
        className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative text-center mt-4"
        role="alert"
      >
        Tidak ada pertanyaan yang dapat ditampilkan. Pastikan sudah membuat
        pertanyaan terlebih dahulu.
      </div>
    );
  }

  const minCols = questions.length > 0 ? questions.length : 10;
  const currentDisplayedRows =
    initialSpreadsheetData.length > 0
      ? initialSpreadsheetData.length
      : kodePesertaList.length;

  return (
    <>
      <div className="flex flex-col items-center justify-center overflow-x-auto">
        {/* Added overflow-x-auto */}
        <div className="min-w-full">
          {/* Added min-w-full to ensure it takes full width */}
          <div className="flex space-x-2 mb-4">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportExcel}
              ref={fileInputRef}
              className="hidden"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex justify-center items-center px-4 py-2 bg-green-500 hover:bg-green-600 rounded-md text-sm font-medium text-white cursor-pointer"
            >
              <DocumentIcon className="h-6 w-6 mr-3" />
              Impor dari Excel
            </button>
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
          </div>
          <Spreadsheet 
            ref={spreadsheetRef} 
            key={kodePesertaList.length}
          >
            <Worksheet
              rowHeaderWidth={150}
              rows={kodePesertaList.map((namaPeserta) => ({
                title: namaPeserta,
                width: "100px",
              }))}
              minDimensions={[minCols, currentDisplayedRows]}
              data={initialSpreadsheetData}
              allowInsertColumn={false}
              allowInsertRow={true}
              columns={questions.map((q, index) => ({
                title: `Soal ${index + 1}`,
                width: 80,
              }))}
            />
          </Spreadsheet>
        </div>
        <div className="mt-3">
          <button
            onClick={handleSave}
            disabled={loading || questions.length === 0}
            className="px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            {loading ? "Memuat..." : "Simpan"}
          </button>
        </div>
      </div>
    </>
  );
}
