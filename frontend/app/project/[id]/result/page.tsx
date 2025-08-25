'use client';

import Loader from "@/components/Loader";
import React, { useEffect, useState, useRef } from 'react';
import { myAppHook } from "@/context/AppProvider";
import { useParams, useRouter } from "next/navigation";
import toast from 'react-hot-toast'; // Pastikan sudah diimpor
import { AnalysisResults, OptionAnalysis, Question } from "@/types";
import { AxiosInstance } from "@/lib/axios";

export default function EditorPage() {
  const router = useRouter();
  const { authToken } = myAppHook();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const params = useParams<{ id: any; tag: string; item: string }>();
  const [isRight, setIsRight] = useState<{ [key: string]: number }>({});
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null); // State baru untuk hasil analisis

  const huruf = (i: number) => { return String.fromCharCode('A'.charCodeAt(0) + i) }

  useEffect(() => {
    setLoading(true);
    if (!authToken) {
      router.push("/auth");
      return;
    }
    // Panggil kedua fetch: pertanyaan dan analisis
    Promise.all([
      fetchAllQuestions(),
      fetchAnalysisResults() // Panggil fungsi untuk mengambil hasil analisis
    ]).finally(() => {
      setLoading(false);
    });
  }, [authToken, params.id]); // Tambahkan params.id sebagai dependensi untuk memastikan fetch ulang jika project berubah

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

  // --- Fungsi Baru untuk Mengambil Hasil Analisis ---
  const fetchAnalysisResults = async () => {
    try {
      const response = await AxiosInstance.get(`/projects/${params.id}/result`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      setAnalysisResults(response.data.analisis); // Simpan hasil analisis dari backend
      toast.success('hasil analisis ditemukan'); // Notifikasi sukses
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
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-13 col-sm-11 col-md-9 col-lg-7">
            {questions.map((q) => (
              <div key={q.id} className="card mb-4">
                <div className="card-body">
                  <div className="d-flex justify-content-between  mb-3 flex-column">
                    <div className="flex-grow-1 me-2 p-2">
                      <p>
                        {q.text}
                      </p>
                    </div>

                  </div>

                  <ul className="list-unstyled ps-3">
                    {q.options.map((opt, index) => (
                      <li key={opt.id} className="d-flex justify-content-center align-items-center mb-2">
                        <div className="mb-0 d-flex flex-row" style={{ marginRight: '30px' }}>{opt.option_code}</div>
                        <div className="mb-0 ">
                          {opt.text}
                          {opt.is_right ? (
                            <span className="ms-2 badge bg-primary">Kunci jawaban</span>
                          ) : null}
                        </div>
                        {/* Tampilkan Analisis Pengecoh per Opsi */}
                        {analysisResults && analysisResults.kualitas_pengecoh && analysisResults.kualitas_pengecoh[q.id] &&
                          'options' in analysisResults.kualitas_pengecoh[q.id] && analysisResults.kualitas_pengecoh[q.id].options[opt.option_code || ''] && (
                            <div className="distractor-stats ms-auto text-end">
                              <span className={`badge ms-1 p-2 fw-normal fs-6 
                              ${(analysisResults.kualitas_pengecoh[q.id].options[opt.option_code || ''] as OptionAnalysis).quality_rating === 'Sangat Baik'
                                  || (analysisResults.kualitas_pengecoh[q.id].options[opt.option_code || ''] as OptionAnalysis).quality_rating === 'Efektif' ? 'bg-success' :
                                  (analysisResults.kualitas_pengecoh[q.id].options[opt.option_code || ''] as OptionAnalysis).quality_rating === 'Baik'
                                    || (analysisResults.kualitas_pengecoh[q.id].options[opt.option_code || ''] as OptionAnalysis).quality_rating === 'Cukup Efektif' ? 'bg-warning text-dark' :
                                    'bg-danger'
                                }`}>
                                {(analysisResults.kualitas_pengecoh[q.id].options[opt.option_code || ''] as OptionAnalysis).effectiveness_score !== null ? (analysisResults.kualitas_pengecoh[q.id].options[opt.option_code || ''] as OptionAnalysis).effectiveness_score!.toFixed(3) : 'N/A'} :&nbsp;
                                {(analysisResults.kualitas_pengecoh[q.id].options[opt.option_code || ''] as OptionAnalysis).quality_rating}
                              </span>
                            </div>
                          )}
                      </li>
                    ))}
                    <li
                      className="d-flex justify-content-between align-items-center pt-3"
                      style={{ cursor: "pointer" }}
                    >

                    </li>
                  </ul>
                  {/* Tampilkan Hasil Analisis per Soal */}
                  {analysisResults && (
                    <div className="analysis-summary d-flex flex-row p-2 align-items-center justify-content-between fs-5">
                      {/* <small className="text-muted">ID Soal: {q.id}</small> */}
                      {analysisResults.tingkat_kesukaran && analysisResults.tingkat_kesukaran[q.id] !== undefined && (
                        <small className="badge ms-1 p-3 bg-success fw-normal">Kesukaran: <span>{analysisResults.tingkat_kesukaran[q.id]?.toFixed(2)}</span></small>
                      )}
                      {analysisResults.daya_beda && analysisResults.daya_beda[q.id] !== undefined && (
                        <small className="badge ms-1 p-3 bg-success fw-normal">Daya Beda: <span>{analysisResults.daya_beda[q.id]?.toFixed(2)}</span></small>
                      )}
                      {analysisResults.validitas_soal && analysisResults.validitas_soal[q.id] !== undefined && (
                        <small className="badge ms-1 p-3 bg-success fw-normal">Validitas: <span>{analysisResults.validitas_soal[q.id]?.toFixed(2)}</span></small>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {/* Tampilkan hasil reliabilitas keseluruhan di bagian bawah */}
            {analysisResults && analysisResults.reliabilitas_tes !== null && (
              <div className="card mt-4">
                <div className="card-body">
                  <h5 className="card-title">Reliabilitas Tes (Cronbach's Alpha):</h5>
                  <p className="lead fw-bold">
                    &alpha; = {analysisResults.reliabilitas_tes.toFixed(3)}
                  </p>
                  <p className="text-muted">
                    *Nilai &alpha; yang baik biasanya &gt; 0.7, &gt; 0.8 lebih baik lagi.
                  </p>
                </div>
              </div>
            )}

            {/* Jika tidak ada hasil analisis sama sekali */}
            {loading === false && !analysisResults && (
              <div className="alert alert-info text-center mt-4">
                Tidak ada hasil analisis yang dapat ditampilkan. Pastikan data jawaban sudah tersedia.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}