"use client";

import React, { useEffect, useState } from "react";
import Loader from "@/components/ui/Loader";
import { useMyAppHook } from "@/context/AppProvider";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AxiosInstance } from "@/lib/axios";
import { ArrowPathIcon, DocumentIcon, TrashIcon, PencilIcon, SparklesIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { AIResultType, MaterialType } from "@/types";
import useTitle from "@/hooks/useTitle";

export default function AnalisisAIPage() {
  useTitle('Analis - Analisis AI', 'Analisis AI untuk Analis');
  const { authToken } = useMyAppHook();
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const router = useRouter();

  const [loadingPage, setLoadingPage] = useState<boolean>(true);
  const [appliedSuggestions, setAppliedSuggestions] = useState<{ [key: string]: boolean }>({});
  const defaultScores = {
    kesesuaian_tujuan: { skor: 0, penjelasan: "Validasi gagal dilakukan" },
    kesesuaian_indikator: { skor: 0, penjelasan: "Validasi gagal dilakukan" },
    kedalaman_kognitif: { skor: 0, penjelasan: "Validasi gagal dilakukan" },
    kejelasan_perumusan: { skor: 0, penjelasan: "Validasi gagal dilakukan" },
    kesesuaian_bentuk: { skor: 0, penjelasan: "Validasi gagal dilakukan" },
    kesesuaian_materi: { skor: 0, penjelasan: "Validasi gagal dilakukan" }
  };

  const [questions, setQuestions] = useState<AIResultType[]>([]);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState<boolean>(false);
  const [materialContent, setMaterialContent] = useState<string>("");
  const [currentMaterial, setCurrentMaterial] = useState<MaterialType | null>(null);
  const [isEditingMaterial, setIsEditingMaterial] = useState<boolean>(false);
  const [hasExistingAnalysis, setHasExistingAnalysis] = useState<boolean>(false);
  const [expandedQuestions, setExpandedQuestions] = useState<{ [key: number]: boolean }>({});

  const applySuggestions = async (question: AIResultType) => {
    try {
      // Create updated question object with suggestion applied
      const updatedQuestion = {
        ...question,
        text: question.ai_suggestion_question || question.text,
        showSuggestion: false,
        // Keep all the existing analysis data
        kesimpulan_validitas: question.kesimpulan_validitas,
        skor: question.skor,
        rata_rata_skor: question.rata_rata_skor,
        bloom_taxonomy: question.bloom_taxonomy,
        note: question.note,
      };

      // Prepare options for update
      let optionsToUpdate = question.options || [];
      if (
        question.ai_suggestion_options &&
        question.ai_suggestion_options.length > 0
      ) {
        optionsToUpdate = question.ai_suggestion_options.map((aiOption) => ({
          option_code: aiOption.option_code,
          text: aiOption.text,
          is_right: aiOption.is_right,
        }));
      }

      // Update question text and options in database
      await AxiosInstance.put(
        `/questions/${question.id}`,
        { 
          text: question.ai_suggestion_question || question.text,
          ai_validation_result: null,
          options: optionsToUpdate,
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      // Refresh the updated question from backend
      const refreshResponse = await AxiosInstance.get(`/projects/${projectId}/questions`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const refreshedQuestionsData = (refreshResponse.data.questions || []).map((q: AIResultType) => {
        if (q.ai_validation_result && Object.keys(q.ai_validation_result).length > 0) {
          const savedAnalysis = q.ai_validation_result;
          return {
            ...q,
            showSuggestion: false,
            kesimpulan_validitas: savedAnalysis.kesimpulan_validitas || "Tidak Valid",
            skor: savedAnalysis.skor || defaultScores,
            rata_rata_skor: savedAnalysis.rata_rata_skor || 0,
            note: savedAnalysis.note || null,
            bloom_taxonomy: savedAnalysis.bloom_taxonomy || null,
            ai_suggestion_question: savedAnalysis.ai_suggestion_question || null,
            ai_suggestion_options: savedAnalysis.ai_suggestion_options || [],
          };
        }
        return {
          ...q,
          showSuggestion: false,
        };
      });

      setQuestions(refreshedQuestionsData);

      // Mark this question's suggestion as applied
      setAppliedSuggestions(prev => ({
        ...prev,
        [question.id]: true
      }));

      // Keep suggestion panel open for other questions
      setSuggestion("completed");
      toast.success("Saran berhasil diterapkan");
    } catch (err) {
      console.error("Gagal menerapkan saran:", err);
      toast.error("Gagal menerapkan saran");
    }
  };

  const saveMaterial = async () => {
    if (!authToken || !questions.length || !materialContent.trim()) {
      toast.error("Materi tidak boleh kosong");
      return;
    }

    setLoadingSuggestion(true);

    try {
      if (currentMaterial) {
        // Update existing material
        await AxiosInstance.put(
          `/materials/${currentMaterial.id}`,
          { content: materialContent },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        // Immediately update local state with new content
        setCurrentMaterial({
          ...currentMaterial,
          content: materialContent,
        });
        toast.success("Materi berhasil diperbarui");
      } else {
        // Create new material
        const materialRes = await AxiosInstance.post(
          `/projects/${projectId}/materials`,
          { content: materialContent },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );

        if (materialRes.data.status) {
          setCurrentMaterial(materialRes.data.material);
          toast.success("Materi berhasil disimpan");
        }
      }

      setIsEditingMaterial(false);
    } catch (err) {
      console.error("Gagal menyimpan materi:", err);
      toast.error("Gagal menyimpan materi ajar");
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const deleteMaterial = async () => {
    if (!currentMaterial) return;

    try {
      await AxiosInstance.delete(`/materials/${currentMaterial.id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      // Immediately update local state
      setCurrentMaterial(null);
      setMaterialContent("");
      setIsEditingMaterial(false);
      setSuggestion(null);
      toast.success("Materi berhasil dihapus");
    } catch (err) {
      console.error("Gagal menghapus material:", err);
      toast.error("Gagal menghapus materi");
    }
  };

  const analyzeMaterial = async () => {
    if (!authToken || !questions.length || !currentMaterial) {
      toast.error("Harap simpan materi terlebih dahulu");
      return;
    }

    setLoadingSuggestion(true);

    try {
      const validationPromises = questions.map(async (question) => {
        try {
          // Use retryvalidate endpoint if analysis already exists, otherwise use validate
          const endpoint = hasExistingAnalysis
            ? `/question/${question.id}/retryvalidate`
            : `/question/${question.id}/validate`;

          const response = await AxiosInstance.post(
            endpoint,
            null,
            { headers: { Authorization: `Bearer ${authToken}` } }
          );

          const validationData = response.data.data;
          return {
            data: {
              status: true,
              question: {
                ...question,
                id: question.id,
                text: question.text,
                options: question.options,
                kesimpulan_validitas: validationData.kesimpulan_validitas || "Tidak Valid",
                skor: validationData.skor || defaultScores,
                rata_rata_skor: validationData.rata_rata_skor || 0,
                note: validationData.note || null,
                bloom_taxonomy: validationData.bloom_taxonomy || null,
                ai_suggestion_question: validationData.ai_suggestion_question || null,
                ai_suggestion_options: validationData.ai_suggestion_options || [],
                showSuggestion: false,
              },
            },
          };
        } catch (error) {
          console.error(`Error validating question ${question.id}:`, error);
          return {
            data: {
              status: false,
              question: {
                ...question,
                id: question.id,
                is_valid: false,
                note: "Validasi gagal dilakukan",
                text: question.text,
                skor: defaultScores,
                kesimpulan_validitas: "Tidak Valid" as const,
                rata_rata_skor: 0,
                bloom_taxonomy: null,
                ai_suggestion_question: null,
                ai_suggestion_options: [],
                showSuggestion: false,
              },
            },
          };
        }
      });

      const validationResults = await Promise.all(validationPromises);
      const updatedQuestions = validationResults.map((res) => ({
        ...res.data.question,
        id: res.data.question.id,
        showSuggestion: false,
      }));

      setQuestions(updatedQuestions);
      setSuggestion("completed");
      
      // Open all questions on first validation
      const newExpandedState: { [key: number]: boolean } = {};
      updatedQuestions.forEach((q) => {
        newExpandedState[q.id] = true;
      });
      setExpandedQuestions(newExpandedState);
      
      // Refresh all questions from backend after validation
      const refreshResponse = await AxiosInstance.get(`/projects/${projectId}/questions`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const refreshedQuestionsData = (refreshResponse.data.questions || []).map((q: AIResultType) => {
        if (q.ai_validation_result && Object.keys(q.ai_validation_result).length > 0) {
          const savedAnalysis = q.ai_validation_result;
          return {
            ...q,
            showSuggestion: false,
            kesimpulan_validitas: savedAnalysis.kesimpulan_validitas || "Tidak Valid",
            skor: savedAnalysis.skor || defaultScores,
            rata_rata_skor: savedAnalysis.rata_rata_skor || 0,
            note: savedAnalysis.note || null,
            bloom_taxonomy: savedAnalysis.bloom_taxonomy || null,
            ai_suggestion_question: savedAnalysis.ai_suggestion_question || null,
            ai_suggestion_options: savedAnalysis.ai_suggestion_options || [],
          };
        }
        return {
          ...q,
          showSuggestion: false,
        };
      });

      setQuestions(refreshedQuestionsData);
      toast.success("Analisis materi berhasil dilakukan");
    } catch (err) {
      console.error("Gagal menganalisis:", err);
      toast.error("Gagal menganalisis dengan materi");
    } finally {
      setLoadingSuggestion(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoadingPage(true);
      try {
        // Fetch questions and materials in parallel
        const [questionsResp, materialsResp] = await Promise.all([
          AxiosInstance.get(`/projects/${projectId}/questions`, {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
          AxiosInstance.get(`/projects/${projectId}/materials`, {
            headers: { Authorization: `Bearer ${authToken}` },
          })
        ]);

        // Process questions and load saved AI validation results
        const questionsData = (questionsResp.data.questions || []).map((q: AIResultType) => {
          // Check if question has saved ai_validation_result
          if (q.ai_validation_result && Object.keys(q.ai_validation_result).length > 0) {
            const savedAnalysis = q.ai_validation_result;
            return {
              ...q,
              showSuggestion: false,
              // Load saved analysis data
              kesimpulan_validitas: savedAnalysis.kesimpulan_validitas || "Tidak Valid",
              skor: savedAnalysis.skor || defaultScores,
              rata_rata_skor: savedAnalysis.rata_rata_skor || 0,
              note: savedAnalysis.note || null,
              bloom_taxonomy: savedAnalysis.bloom_taxonomy || null,
              ai_suggestion_question: savedAnalysis.ai_suggestion_question || null,
              ai_suggestion_options: savedAnalysis.ai_suggestion_options || [],
            };
          }
          return {
            ...q,
            showSuggestion: false,
          };
        });

        setQuestions(questionsData);

        // Set materials - load only the first one
        const materials = materialsResp.data.materials || [];
        if (materials.length > 0) {
          setCurrentMaterial(materials[0]);
          setMaterialContent(materials[0].content);
        }

        // Auto-trigger suggestion panel if any question has saved analysis
        const hasAnalysis = questionsData.some((q: AIResultType) => q.ai_validation_result && Object.keys(q.ai_validation_result).length > 0);
        if (hasAnalysis) {
          setSuggestion("completed");
          setHasExistingAnalysis(true);
        }
      } catch (error) {
        // Only show error toast for non-auth errors
        if (authToken === null) {
          console.log("Auth error:", error);
        } else {
          console.error("Gagal memuat data:", error);
          toast.error("Gagal memuat data. Mohon coba lagi.");
        }
      } finally {
        setLoadingPage(false);
      }
    };

    fetchData();
  }, [authToken, projectId, router]);

  if (loadingPage) return <Loader />;

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-3xl">
        <div className="mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium mb-4">Materi Ajar</h3>

            {!currentMaterial && !isEditingMaterial ? (
              <div className="space-y-4">
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="Masukkan materi pembelajaran yang berkaitan dengan soal..."
                  value={materialContent}
                  onChange={(e) => setMaterialContent(e.target.value)}
                  disabled={loadingSuggestion}
                />
                <button
                  onClick={saveMaterial}
                  className={`w-full flex items-center justify-center px-4 py-2 rounded-md text-base font-medium text-white 
                      ${questions.length === 0 || !materialContent.trim()
                      ? "bg-gray-400 cursor-not-allowed"
                      : loadingSuggestion
                        ? "bg-yellow-400 cursor-wait"
                        : "bg-yellow-500 hover:bg-yellow-600 cursor-pointer"
                    }`}
                  disabled={questions.length === 0 || !materialContent.trim() || loadingSuggestion}
                  style={{
                    backgroundColor: !materialContent.trim() ? undefined : "#00a1a9"
                  }}
                >
                  <DocumentIcon className="h-6 w-6 mr-3" />
                  {loadingSuggestion ? "Menyimpan..." : "Simpan Materi"}
                </button>
              </div>
            ) : currentMaterial && !isEditingMaterial ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-gray-700">Materi Saat Ini</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setIsEditingMaterial(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        disabled={loadingSuggestion}
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={deleteMaterial}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        disabled={loadingSuggestion}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap text-sm">
                    {currentMaterial.content}
                  </p>
                </div>
                <button
                  onClick={analyzeMaterial}
                  className={`w-full flex items-center justify-center px-4 py-2 rounded-md text-base font-medium text-white 
                      ${questions.length === 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : loadingSuggestion
                        ? "bg-gray-400 cursor-wait"
                        : "cursor-pointer"
                    }`}
                  style={{
                    backgroundColor: questions.length === 0 || loadingSuggestion ? undefined : "#00a1a9"
                  }}
                  disabled={questions.length === 0 || loadingSuggestion}
                >
                  <SparklesIcon className="h-6 w-6 mr-3" />
                  {loadingSuggestion ? "Menganalisis..." : (hasExistingAnalysis ? "Analisis Ulang" : "Analisis Materi")}
                </button>
              </div>
            ) : isEditingMaterial && currentMaterial ? (
              <div className="space-y-4">
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  value={materialContent}
                  onChange={(e) => setMaterialContent(e.target.value)}
                  disabled={loadingSuggestion}
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveMaterial}
                    className={`flex-1 px-4 py-2 rounded-md text-base font-medium text-white ${!materialContent.trim() || loadingSuggestion
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 cursor-pointer"
                      }`}
                    disabled={!materialContent.trim() || loadingSuggestion}

                  >
                    {loadingSuggestion ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingMaterial(false);
                      setMaterialContent(currentMaterial.content);
                    }}
                    className="flex-1 px-4 py-2 rounded-md text-base font-medium bg-gray-400 hover:bg-gray-500 text-white cursor-pointer"
                    disabled={loadingSuggestion}
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : null}

            {questions.length === 0 && (
              <p className="text-xs text-red-500 mt-4">
                Tambahkan soal terlebih dahulu sebelum melakukan analisis
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Masukkan atau kelola satu materi pembelajaran untuk menganalisis kesesuaian soal dengan materi
            </p>
          </div>

          {loadingSuggestion && (
            <div className="mt-4 flex justify-center items-center gap-2 p-4 bg-blue-50 rounded-lg">
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span className="text-blue-600">Menganalisis materi...</span>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {questions.map((q, index) => (
            <div
              key={q.id}
              className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Question Header with Dropdown Button */}
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg text-[#00A1A9] font-medium">
                      Soal #{index + 1}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    {suggestion === "completed" && (
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${q.kesimpulan_validitas === "Valid"
                          ? "bg-green-100 text-green-700"
                          : q.kesimpulan_validitas === "Sebagian Valid"
                            ? "bg-yellow-100 text-yellow-700"
                          : q.kesimpulan_validitas == null
                            ? "bg-gray-100 text-gray-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                        {q.kesimpulan_validitas ? q.kesimpulan_validitas : 'belum divalidasi'}
                      </span>
                    )}
                    <button
                      onClick={() => {
                        setExpandedQuestions(prev => ({
                          ...prev,
                          [q.id]: !prev[q.id]
                        }));
                      }}
                      className="p-2 hover:bg-gray-200 rounded-md transition-colors"
                      title={expandedQuestions[q.id] ? "Tutup" : "Buka"}
                    >
                      <ChevronDownIcon className={`h-5 w-5 text-gray-600 transform transition-transform ${expandedQuestions[q.id] ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Question Content - Expandable Vertical Layout */}
              {expandedQuestions[q.id] && (
                <div className="flex flex-col">
                  {/* Question Section */}
                  <div className="p-4 border-b border-gray-200">
                    <div
                      className="prose font-bold mb-3"
                      dangerouslySetInnerHTML={{ __html: q.showSuggestion && q.ai_suggestion_question ? q.ai_suggestion_question : q.text }}
                    />
                    {q.options && q.options.length > 0 && (
                      <div className="mt-3 pt-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Pilihan Jawaban:
                        </p>
                        <div className="space-y-1">
                          {(q.showSuggestion && q.ai_suggestion_options && q.ai_suggestion_options.length > 0 ? q.ai_suggestion_options : q.options).map((option, idx) => (
                            <div key={`${q.id}-option-${idx}`} className={`text-sm ${option.is_right ? 'font-bold' : ''}`}>
                              {option.option_code}. {option.text}
                              {option.is_right ? <span className="text-green-600 ml-2">(Kunci Jawaban)</span> : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Analysis Section - Show only if suggestion exists and not applied */}
                  {suggestion && q.ai_validation_result  && !appliedSuggestions[q.id] && (
                    <div className="p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-medium">Hasil Analisis</h4>
                        <div>
                          {q.ai_suggestion_question && !appliedSuggestions[q.id] && (
                            <div className="flex justify-end gap-3">
                              <button
                                onClick={() => {
                                  setQuestions(
                                    questions.map((question) =>
                                      question.id === q.id
                                        ? { ...question, showSuggestion: !question.showSuggestion }
                                        : question
                                    )
                                  );
                                }}
                                className={`px-2 py-1 text-xs rounded transition-colors font-semibold ${
                                  q.showSuggestion
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                              >
                                {q.showSuggestion ? "Tutup Saran" : "Lihat Saran"}
                              </button>
                              {q.showSuggestion && !appliedSuggestions[q.id] && (
                                <button
                                  onClick={() => applySuggestions(q)}
                                  className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                >
                                  Terapkan Saran
                                </button>
                              )}
                            </div>
                          )}
                          {appliedSuggestions[q.id] && (
                            <span className="text-xs text-green-600">
                              ✓ Saran diterapkan
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        {/* Validity Status */}
                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            Status Validitas:
                          </span>
                          
                          <p
                            className={`text-sm mt-1 font-medium ${q.kesimpulan_validitas === "Valid"
                              ? "text-green-600"
                              : q.kesimpulan_validitas === "Sebagian Valid"
                                ? "text-yellow-600"
                                : "text-red-600"
                              }`}
                          >
                            {q.kesimpulan_validitas}
                          </p>
                        </div>

                        {/* Average Score */}
                        {typeof q.rata_rata_skor === "number" && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">
                              Rata-rata Skor:
                            </span>
                            <p className="text-sm mt-1">
                              {q.rata_rata_skor?.toFixed(2) || "0.00"}
                            </p>
                          </div>
                        )}

                        {/* Detailed Scores */}
                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            Skor Penilaian:
                          </span>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-justify">
                              Kesesuaian Tujuan: {q.skor.kesesuaian_tujuan.skor}{" "}
                              <br />
                              {q.skor.kesesuaian_tujuan.penjelasan}
                            </p>
                            <p className="text-sm text-justify">
                              Kesesuaian Indikator:{" "}
                              {q.skor.kesesuaian_indikator.skor} <br />
                              {q.skor.kesesuaian_indikator.penjelasan}
                            </p>
                            <p className="text-sm text-justify">
                              Kedalaman Kognitif: {q.skor.kedalaman_kognitif.skor}{" "}
                              <br />
                              {q.skor.kedalaman_kognitif.penjelasan}
                            </p>
                            <p className="text-sm text-justify">
                              Kejelasan Perumusan:{" "}
                              {q.skor.kejelasan_perumusan?.skor} <br />
                              {q.skor.kejelasan_perumusan.penjelasan}
                            </p>
                            <p className="text-sm text-justify">
                              Kesesuaian Bentuk: {q.skor.kesesuaian_bentuk.skor}{" "}
                              <br />
                              {q.skor.kesesuaian_bentuk.penjelasan}
                            </p>
                            <p className="text-sm text-justify">
                              Kesesuaian dengan Materi:{" "}
                              {q.skor.kesesuaian_materi.skor} <br />
                              {q.skor.kesesuaian_materi.penjelasan}
                            </p>
                          </div>
                        </div>

                        {/* Bloom Taxonomy */}
                        {q.bloom_taxonomy && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">
                              Tingkatan Bloom:
                            </span>
                            <p className="text-sm mt-1">{q.bloom_taxonomy}</p>
                          </div>
                        )}

                        {/* Notes */}
                        {q.note && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">
                              Catatan:
                            </span>
                            <p className="text-sm mt-1 whitespace-pre-wrap text-justify">
                              {q.note}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>


      </div>
    </div>
  );
}
