"use client";

import React, { useEffect, useState } from "react";
import Loader from "@/components/ui/Loader";
import { useMyAppHook } from "@/context/AppProvider";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AxiosInstance } from "@/lib/axios";
import { DocumentIcon } from "@heroicons/react/24/outline";

type QuestionType = {
  id: number;
  text: string;
  options?: { id?: number; text: string; option_code?: string }[];
  suggestion?: string;
};

export default function AnalisisAIPage() {
  const { authToken } = useMyAppHook();
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const router = useRouter();

  const [loadingPage, setLoadingPage] = useState<boolean>(true);
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState<boolean>(false);
  const [savingSuggestion, setSavingSuggestion] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoadingPage(true);
      try {
        const resp = await AxiosInstance.get(`/projects/${projectId}/questions`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setQuestions(resp.data.questions || []);
      } catch (err) {
        console.error("Gagal ambil questions:", err);
        toast.error("Gagal memuat soal. Mohon coba lagi.");
      } finally {
        setLoadingPage(false); // penting: set false agar Loader hilang
      }
    };

    fetchQuestions();
  }, [authToken, projectId, router]);

  const handleFileUpload = async (file: File) => {
    if (!authToken || !questions.length) return;
    
    setSelectedFile(file);
    setLoadingSuggestion(true);

    try {
      // Create form data with file and questions
      const formData = new FormData();
      formData.append('file', file);
      formData.append('project_id', projectId);
      formData.append('questions', JSON.stringify(questions.map(q => ({ 
        id: q.id, 
        text: q.text,
        options: q.options 
      }))));

      // Upload file and analyze questions
      const res = await AxiosInstance.post('/projects/analyze-with-material', formData, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuggestion(res.data.suggestion);
      toast.success("Analisis dengan materi berhasil dilakukan");
    } catch (err) {
      console.error("Gagal menganalisis dengan materi:", err);
      toast.error("Gagal menganalisis dengan materi ajar");
      setSuggestion(null);
      setSelectedFile(null);
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const applySuggestions = async () => {
    if (!suggestion || !authToken) return;

    setSavingSuggestion(true);
    try {
      // Apply suggestions to all questions
      await AxiosInstance.post(
        `/projects/${projectId}/apply-suggestions`,
        { suggestion },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      // Refresh questions list
      const resp = await AxiosInstance.get(`/projects/${projectId}/questions`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setQuestions(resp.data.questions || []);
      
      toast.success("Saran AI berhasil diterapkan ✅");
      setSuggestion(null);
    } catch (err) {
      console.error("Gagal menerapkan saran:", err);
      toast.error("Gagal menerapkan saran AI");
    } finally {
      setSavingSuggestion(false);
    }
  };

  const cancelSuggestion = () => {
    setSuggestion(null);
    toast("Saran AI dibatalkan");
  };

  if (loadingPage) return <Loader />;

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-3xl">
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-4">
            Unggah materi ajar untuk menganalisis kesesuaian soal dengan materi
          </p>
          
          <div className="flex gap-4 items-center">
            <input
              type="file"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              accept=".pdf,.doc,.docx"
              className="hidden"
              id="fileInput"
              disabled={loadingSuggestion || !questions.length}
            />
            <label
              htmlFor="fileInput"
              className={`flex items-center px-4 py-2 rounded-md text-base font-medium text-white 
                ${questions.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 
                loadingSuggestion ? 'bg-yellow-400 cursor-wait' : 
                'bg-yellow-500 hover:bg-yellow-600 cursor-pointer'}`}
            >
              <DocumentIcon className="h-6 w-6 mr-3" />
              {loadingSuggestion ? "Menganalisis..." : "Unggah Materi Ajar"}
            </label>
            {selectedFile && (
              <span className="text-sm text-gray-600">
                File: {selectedFile.name}
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-500 mt-2">
            Format yang didukung: PDF, DOC, DOCX
          </p>
          {questions.length === 0 && (
            <p className="text-sm text-red-500 mt-2">
              Tambahkan soal terlebih dahulu sebelum melakukan analisis
            </p>
          )}
        </div>

        {loadingSuggestion && (
          <div className="mb-6 flex justify-center items-center gap-2 p-4 bg-blue-50 rounded-lg">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span className="text-blue-600">Menganalisis materi...</span>
          </div>
        )}

        {suggestion && (
          <div className="mb-6 p-4 rounded-lg bg-green-50">
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-lg font-medium">Hasil Analisis AI</h4>
              <div className="flex gap-2">
                <button
                  onClick={cancelSuggestion}
                  className="px-3 py-1 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                  disabled={savingSuggestion}
                >
                  Batalkan
                </button>
                <button
                  onClick={applySuggestions}
                  disabled={savingSuggestion}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  {savingSuggestion ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Menerapkan...
                    </div>
                  ) : (
                    "Terapkan Semua Saran"
                  )}
                </button>
              </div>
            </div>
            <div
              className="bg-white rounded p-3"
              dangerouslySetInnerHTML={{ __html: suggestion }}
            />
          </div>
        )}

        <div className="space-y-4">
          {questions.map((q, index) => (
            <div key={q.id} className="bg-white shadow-md rounded-lg p-4">
              <div className="mb-2">
                <h3 className="text-lg font-medium mb-2">Soal #{index + 1}</h3>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: q.text }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
