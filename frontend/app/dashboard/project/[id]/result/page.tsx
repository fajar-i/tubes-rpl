'use client';

import Loader from "@/components/Loader";
import React, { useEffect, useState } from 'react';
import { useMyAppHook } from "@/context/AppProvider";
import { useParams, useRouter } from "next/navigation";
import toast from 'react-hot-toast';
import { AnalysisResults, OptionAnalysis, QuestionDistractorAnalysis, QuestionResult } from "@/types";
import { AxiosInstance } from "@/lib/axios";

export default function EditorPage() {
  const router = useRouter();
  const { authToken } = useMyAppHook();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuestionResult[]>([]);
  const params = useParams<{ id: string; tag: string; item: string }>();
  const [isRight, setIsRight] = useState<{ [key: string]: number }>({});
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);

  const huruf = (i: number) => { return String.fromCharCode('A'.charCodeAt(0) + i) }

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

  useEffect(() => {
    const rightAnswer: { [key: string]: number } = {};
    questions.forEach((q) => {
      const correctOption = q.options.find((o) => o.is_right);
      if (correctOption) { rightAnswer[q.id] = correctOption.id; }
    });
    setIsRight(rightAnswer);
  }, [questions]);

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
      toast.success('Hasil analisis ditemukan');
      console.log("Analisis berhasil dimuat:", response.data.analisis);
    } catch (error) {
      console.error("Fetch analysis results error:", error);
      toast.error("Gagal memuat hasil analisis.");
    }
  };

  if (loading) {
    return <Loader />;
  } else {
    return (
      <>
        <div className="flex justify-center">
          <div className="w-full max-w-3xl">
            {questions.map((q) => (
              <div key={q.id} className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-4">
                <div className="flex flex-col mb-3">
                  <div className="p-2">
                    <p className="text-lg font-semibold">
                      {q.text}
                    </p>
                  </div>
                </div>

                <ul className="list-none pl-3">
                  {q.options.map((opt) => (
                    <li key={opt.id} className="flex items-center mb-2">
                      <div className="mr-4 text-gray-700 dark:text-gray-300">{opt.option_code}</div>
                      <div className="text-base">
                        {opt.text}
                        {opt.is_right ? (
                          <span className="ml-2 px-2 py-1 text-xs font-semibold text-white bg-blue-600 rounded-full">Kunci jawaban</span>
                        ) : null}
                      </div>
                      {analysisResults && analysisResults.kualitas_pengecoh && analysisResults.kualitas_pengecoh[q.id] &&
                        'options' in analysisResults.kualitas_pengecoh[q.id] &&
                        !Array.isArray(analysisResults.kualitas_pengecoh[q.id].options) &&
                        (analysisResults.kualitas_pengecoh[q.id].options as QuestionDistractorAnalysis)[opt.option_code || ''] && (
                          <div className="ml-auto text-right">
                            <span className={`inline-block ml-1 px-3 py-2 font-normal text-base rounded-full
                              ${((analysisResults.kualitas_pengecoh[q.id].options as QuestionDistractorAnalysis)[opt.option_code || ''] as OptionAnalysis).quality_rating === 'Sangat Baik'
                                || ((analysisResults.kualitas_pengecoh[q.id].options as QuestionDistractorAnalysis)[opt.option_code || ''] as OptionAnalysis).quality_rating === 'Efektif' ? 'bg-green-500 text-white' :
                                ((analysisResults.kualitas_pengecoh[q.id].options as QuestionDistractorAnalysis)[opt.option_code || ''] as OptionAnalysis).quality_rating === 'Baik'
                                  || ((analysisResults.kualitas_pengecoh[q.id].options as QuestionDistractorAnalysis)[opt.option_code || ''] as OptionAnalysis).quality_rating === 'Cukup Efektif' ? 'bg-yellow-400 text-gray-900' :
                                  'bg-red-500 text-white'
                              }`}>
                              {(((analysisResults.kualitas_pengecoh[q.id].options as QuestionDistractorAnalysis)[opt.option_code || ''] as OptionAnalysis).effectiveness_score !== null) ? ((analysisResults.kualitas_pengecoh[q.id].options as QuestionDistractorAnalysis)[opt.option_code || ''] as OptionAnalysis).effectiveness_score!.toFixed(3) : 'N/A'} :&nbsp;
                              {((analysisResults.kualitas_pengecoh[q.id].options as QuestionDistractorAnalysis)[opt.option_code || ''] as OptionAnalysis).quality_rating}
                            </span>
                          </div>
                        )}
                    </li>
                  ))}
                </ul>
                {analysisResults && (
                  <div className="flex flex-row p-2 items-center justify-between text-lg mt-3">
                    {analysisResults.tingkat_kesukaran && analysisResults.tingkat_kesukaran[q.id] !== undefined && (
                      <span className="px-3 py-2 bg-green-500 text-white font-normal rounded-full">Kesukaran: <span>{analysisResults.tingkat_kesukaran[q.id]?.toFixed(2)}</span></span>
                    )}
                    {analysisResults.daya_beda && analysisResults.daya_beda[q.id] !== undefined && (
                      <span className="px-3 py-2 bg-green-500 text-white font-normal rounded-full">Daya Beda: <span>{analysisResults.daya_beda[q.id]?.toFixed(2)}</span></span>
                    )}
                    {analysisResults.validitas_soal && analysisResults.validitas_soal[q.id] !== undefined && (
                      <span className="px-3 py-2 bg-green-500 text-white font-normal rounded-full">Validitas: <span>{analysisResults.validitas_soal[q.id]?.toFixed(2)}</span></span>
                    )}
                  </div>
                )}
              </div>
            ))}
            {analysisResults && analysisResults.reliabilitas_tes !== null && (
              <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mt-4">
                <h5 className="text-xl font-semibold mb-2">Reliabilitas Tes (Cronbach&apos; Alpha):</h5>
                <p className="text-2xl font-bold">
                  &alpha; = {analysisResults.reliabilitas_tes.toFixed(3)}
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  *Nilai &alpha; yang baik biasanya {'>'} 0.7, {'>'} 0.8 lebih baik lagi.
                </p>
              </div>
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
