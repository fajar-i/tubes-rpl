'use client';

import Loader from "@/components/ui/Loader";
import React, { useEffect, useState } from 'react';
import { useMyAppHook } from "@/context/AppProvider";
import { useParams, useRouter } from "next/navigation";
import toast from 'react-hot-toast';
import { AnalysisResults, QuestionResult } from "@/types";
import { AxiosInstance } from "@/lib/axios";
import { DocumentIcon } from "@heroicons/react/24/outline";

import QuestionCard from '@/components/ui/QuestionCard';
import ReliabilityCard from '@/components/ui/ReliabilityCard';

export default function EditorPage() {
  const router = useRouter();
  const { authToken } = useMyAppHook();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuestionResult[]>([]);
  const params = useParams<{ id: string; tag: string; item: string }>();
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);

  const fetchAllQuestions = async () => {
    try {
      const response = await AxiosInstance.get(`/projects/${params.id}/questions`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      setQuestions(response.data.questions);
    } catch (error) {
      console.error("Fetch all questions error:", error);
      toast.error("Gagal memuat pertanyaan.");
    }
  };

  const fetchAnalysisResults = async () => {
    try {
      const response = await AxiosInstance.get(`/projects/${params.id}/result`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      setAnalysisResults(response.data.analisis);
      console.log("Analisis berhasil dimuat:", response.data.analisis);
    } catch (error) {
      console.error("Fetch analysis results error:", error);
      toast.error("Gagal memuat hasil analisis.");
    }
  };
  
  useEffect(() => {
    setLoading(true);
    if (!authToken) {
      router.push("/auth");
      return;
    }
    Promise.all([
      fetchAllQuestions(),
      fetchAnalysisResults()
    ]).finally(() => {
      setLoading(false);
    });
  }, [authToken, params.id, router]);

  if (loading) {
    return <Loader />;
  } else {
    return (
      <>
        <div className="flex-shrink-0">
          <button
            className="flex items-center px-4 py-2 rounded-md text-base font-medium text-white bg-red-500 hover:bg-red-600 cursor-pointer"
          >
            <DocumentIcon className="h-6 w-6 mr-3" />
            Ekspor ke PDF
          </button>
        </div>
        <div className="flex justify-center">
          <div className="w-full max-w-3xl">
            {questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                analysisResults={analysisResults}
              />
            ))}
            
            {analysisResults?.reliabilitas_tes !== null && analysisResults?.reliabilitas_tes !== undefined && (
              <ReliabilityCard reliabilityScore={analysisResults.reliabilitas_tes} />
            )}

            {loading === false && !analysisResults && (
              <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative text-center mt-4" role="alert">
                Tidak ada hasil analisis yang dapat ditampilkan. Pastikan data jawaban sudah tersedia.
              </div>
            )}
          </div>
        </div>
      </>
    );
  }
}
