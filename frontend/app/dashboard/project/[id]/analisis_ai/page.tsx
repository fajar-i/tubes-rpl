"use client";

import React, { useEffect, useState } from "react";
import Loader from "@/components/ui/Loader";
import { useMyAppHook } from "@/context/AppProvider";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AxiosInstance } from "@/lib/axios";
import { DocumentIcon } from "@heroicons/react/24/outline";
import { AIResultType, MaterialType } from "@/types";

export default function AnalisisAIPage() {
  const { authToken } = useMyAppHook();
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const router = useRouter();

  const [loadingPage, setLoadingPage] = useState<boolean>(true);
  const [questions, setQuestions] = useState<AIResultType[]>([]);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [materials, setMaterials] = useState<MaterialType[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState<boolean>(true);

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

      // Update question text in database
      if (question.ai_suggestion_question) {
        await AxiosInstance.put(
          `/questions/${question.id}`,
          { text: question.ai_suggestion_question },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
      }

      // Update options if they exist
      if (
        question.ai_suggestion_options &&
        question.ai_suggestion_options.length > 0
      ) {
        const updateOptionPromises = question.ai_suggestion_options.map(
          (option, index) => {
            if (question.options && question.options[index]) {
              // Update local options data
              if (updatedQuestion.options && updatedQuestion.options[index]) {
                updatedQuestion.options[index].text = option.text;
              }

              return AxiosInstance.put(
                `/options/${question.options[index].id}`,
                {
                  text: option.text,
                },
                { headers: { Authorization: `Bearer ${authToken}` } }
              );
            }
            return null;
          }
        );

        await Promise.all(updateOptionPromises.filter((p) => p !== null));
      }

      // Update local state with the modified question while preserving other questions and keeping suggestion panel open
      setQuestions(
        questions.map((q) => (q.id === question.id ? updatedQuestion : q))
      );

      // Keep suggestion panel open
      setSuggestion("completed");

      toast.success("Saran berhasil diterapkan");
    } catch (err) {
      console.error("Gagal menerapkan saran:", err);
      toast.error("Gagal menerapkan saran");
    }
  };

  const fetchMaterials = async () => {
    setLoadingMaterials(true);
    try {
      const resp = await AxiosInstance.get(`/projects/${projectId}/materials`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setMaterials(resp.data.materials || []);
    } catch (err) {
      console.error("Gagal mengambil materials:", err);
      toast.error("Gagal memuat materi");
    } finally {
      setLoadingMaterials(false);
    }
  };

  const deleteMaterial = async (materialId: number) => {
    try {
      await AxiosInstance.delete(`/materials/${materialId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      await fetchMaterials();
      setSuggestion(null);
      toast.success("Materi berhasil dihapus");
    } catch (err) {
      console.error("Gagal menghapus material:", err);
      toast.error("Gagal menghapus materi");
    }
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoadingPage(true);
      try {
        const resp = await AxiosInstance.get(
          `/projects/${projectId}/questions`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
        setQuestions(
          (resp.data.questions || []).map((q: AIResultType) => ({
            ...q,
            showSuggestion: false,
          }))
        );
      } catch (err) {
        console.error("Gagal ambil questions:", err);
        toast.error("Gagal memuat soal. Mohon coba lagi.");
      } finally {
        setLoadingPage(false);
      }
    };

    fetchQuestions();
    fetchMaterials();
  }, [authToken, projectId, router]);

  const handleFileUpload = async (file: File) => {
    if (!authToken || !questions.length) return;

    setSelectedFile(file);
    setLoadingSuggestion(true);

    try {
      // First upload the material
      const formData = new FormData();
      formData.append("file", file);

      const materialRes = await AxiosInstance.post(
        `/projects/${projectId}/materials`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!materialRes.data.status) {
        throw new Error(
          materialRes.data.message || "Failed to upload material"
        );
      }

      // Add a small delay to ensure the material is processed
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Then validate each question with the uploaded material
      const validationPromises = questions.map(async (question) => {
        try {
          const response = await AxiosInstance.post(
            `/question/${question.id}/validate`,
            null,
            {
              headers: { Authorization: `Bearer ${authToken}` },
            }
          );

          // The validation results are in response.data.data
          const validationData = response.data.data; // Access the data property

          return {
            data: {
              status: true,
              question: {
                ...question,
                id: question.id,
                text: question.text,
                options: question.options,
                kesimpulan_validitas: validationData.kesimpulan_validitas || "Tidak Valid",
                skor: validationData.skor || {
                  kesesuaian_tujuan: { skor: 0, penjelasan: "Validasi gagal dilakukan" },
                  kesesuaian_indikator: { skor: 0, penjelasan: "Validasi gagal dilakukan" },
                  kedalaman_kognitif: { skor: 0, penjelasan: "Validasi gagal dilakukan" },
                  kejelasan_perumusan: { skor: 0, penjelasan: "Validasi gagal dilakukan" },
                  kesesuaian_bentuk: { skor: 0, penjelasan: "Validasi gagal dilakukan" },
                  kesesuaian_materi: { skor: 0, penjelasan: "Validasi gagal dilakukan" }
                },
                rata_rata_skor: validationData.rata_rata_skor || 0,
                note: validationData.note || null,
                bloom_taxonomy: validationData.bloom_taxonomy || null,
                ai_suggestion_question:
                  validationData.ai_suggestion_question || null,
                ai_suggestion_options:
                  validationData.ai_suggestion_options || [],
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
                id: question.id, // Ensure ID is preserved
                is_valid: false,
                note: "Validasi gagal dilakukan",
                text: question.text,
                skor: {
                  kesesuaian_tujuan: {
                    skor: 0,
                    penjelasan: "Validasi gagal dilakukan",
                  },
                  kesesuaian_indikator: {
                    skor: 0,
                    penjelasan: "Validasi gagal dilakukan",
                  },
                  kedalaman_kognitif: {
                    skor: 0,
                    penjelasan: "Validasi gagal dilakukan",
                  },
                  kejelasan_perumusan: {
                    skor: 0,
                    penjelasan: "Validasi gagal dilakukan",
                  },
                  kesesuaian_bentuk: {
                    skor: 0,
                    penjelasan: "Validasi gagal dilakukan",
                  },
                  kesesuaian_materi: {
                    skor: 0,
                    penjelasan: "Validasi gagal dilakukan",
                  },
                },
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

      // Ensure each question has a unique ID and proper structure
      const updatedQuestions = validationResults.map((res) => {
        const question = res.data.question;
        return {
          ...question,
          id: question.id, // Ensure ID is preserved
          showSuggestion: false,
        };
      });

      setQuestions(updatedQuestions);
      setSuggestion("completed");
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

  if (loadingPage) return <Loader />;

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-3xl">
        <div className="mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium mb-4">Materi Ajar</h3>

            <div className="flex gap-4 items-center mb-4">
              <input
                type="file"
                onChange={(e) =>
                  e.target.files?.[0] && handleFileUpload(e.target.files[0])
                }
                accept=".pdf,.doc,.docx"
                className="hidden"
                id="fileInput"
                disabled={loadingSuggestion || !questions.length}
              />
              <label
                htmlFor="fileInput"
                className={`flex items-center px-4 py-2 rounded-md text-base font-medium text-white 
                  ${
                    questions.length === 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : loadingSuggestion
                      ? "bg-yellow-400 cursor-wait"
                      : "bg-yellow-500 hover:bg-yellow-600 cursor-pointer"
                  }`}
              >
                <DocumentIcon className="h-6 w-6 mr-3" />
                {loadingSuggestion ? "Menganalisis..." : "Unggah Materi Baru"}
              </label>
              {selectedFile && (
                <span className="text-sm text-gray-600">
                  File: {selectedFile.name}
                </span>
              )}
            </div>

            {/* Material List */}
            {loadingMaterials ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin h-5 w-5 border-2 border-gray-500 border-t-transparent rounded-full"></div>
              </div>
            ) : materials.length > 0 ? (
              <div className="space-y-3">
                {materials.map((material) => (
                  <div
                    key={material.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <DocumentIcon className="h-5 w-5 text-gray-500" />
                      <a
                        href={material.content}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline truncate max-w-[300px]"
                      >
                        {material.content.split("/").pop()}
                      </a>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          setSuggestion(null);
                          setSelectedFile(null);
                          setLoadingSuggestion(true);

                          try {
                            // Validate each question with this material
                            const validationPromises = questions.map(
                              async (question) => {
                                try {
                                  const response = await AxiosInstance.post(
                                    `/question/${question.id}/validate`,
                                    null,
                                    {
                                      headers: {
                                        Authorization: `Bearer ${authToken}`,
                                      },
                                    }
                                  );
                                  const validatedData = response.data.data; // Access the data property

                                  return {
                                    data: {
                                      status: true,
                                      question: {
                                        ...question,
                                        id: question.id,
                                        kesimpulan_validitas:
                                          validatedData.kesimpulan_validitas,
                                        skor: validatedData.skor,
                                        rata_rata_skor:
                                          validatedData.rata_rata_skor,
                                        note: validatedData.note,
                                        bloom_taxonomy:
                                          validatedData.bloom_taxonomy,
                                        ai_suggestion_question:
                                          validatedData.ai_suggestion_question,
                                        ai_suggestion_options:
                                          validatedData.ai_suggestion_options,
                                        showSuggestion: false,
                                      },
                                    },
                                  };
                                } catch (error) {
                                  console.log(
                                    "Gagal melakukan validasi",
                                    error
                                  );
                                  return {
                                    data: {
                                      status: false,
                                      question: {
                                        ...question, // Keep existing question data
                                        id: question.id,
                                        is_valid: false,
                                        text: question.text,
                                        skor: {
                                          kesesuaian_tujuan: {
                                            skor: 0,
                                            penjelasan:
                                              "Validasi gagal dilakukan",
                                          },
                                          kesesuaian_indikator: {
                                            skor: 0,
                                            penjelasan:
                                              "Validasi gagal dilakukan",
                                          },
                                          kedalaman_kognitif: {
                                            skor: 0,
                                            penjelasan:
                                              "Validasi gagal dilakukan",
                                          },
                                          kejelasan_perumusan: {
                                            skor: 0,
                                            penjelasan:
                                              "Validasi gagal dilakukan",
                                          },
                                          kesesuaian_bentuk: {
                                            skor: 0,
                                            penjelasan:
                                              "Validasi gagal dilakukan",
                                          },
                                          kesesuaian_materi: {
                                            skor: 0,
                                            penjelasan:
                                              "Validasi gagal dilakukan",
                                          },
                                        },
                                        kesimpulan_validitas: "Tidak Valid" as const,
                                        rata_rata_skor: 0,
                                        note: "Validasi gagal dilakukan",
                                        bloom_taxonomy: null,
                                        ai_suggestion_question: null,
                                        ai_suggestion_options: [],
                                        showSuggestion: false,
                                      },
                                    },
                                  };
                                }
                              }
                            );

                            const validationResults = await Promise.all(
                              validationPromises
                            );

                            // Ensure each question has a unique ID and proper structure
                            const updatedQuestions = validationResults.map(
                              (res) => {
                                const question = res.data.question;
                                return {
                                  ...question,
                                  id: question.id, // Ensure ID is preserved
                                  showSuggestion: false,
                                };
                              }
                            );
                            setQuestions(updatedQuestions);
                            setSuggestion("completed");
                            toast.success(
                              "Analisis dengan materi berhasil dilakukan"
                            );
                          } catch (err) {
                            console.error("Gagal menganalisis:", err);
                            toast.error("Gagal menganalisis dengan materi");
                          } finally {
                            setLoadingSuggestion(false);
                          }
                        }}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                        disabled={loadingSuggestion}
                      >
                        Analisis Ulang
                      </button>
                      <button
                        onClick={() => deleteMaterial(material.id)}
                        className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Belum ada materi ajar. Silakan unggah materi untuk menganalisis
                soal.
              </p>
            )}

            <p className="text-xs text-gray-500 mt-4">
              Format yang didukung: PDF, DOC, DOCX
            </p>
            {questions.length === 0 && (
              <p className="text-xs text-red-500 mt-2">
                Tambahkan soal terlebih dahulu sebelum melakukan analisis
              </p>
            )}
          </div>
        </div>

        {loadingSuggestion && (
          <div className="mb-6 flex justify-center items-center gap-2 p-4 bg-blue-50 rounded-lg">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span className="text-blue-600">Menganalisis materi...</span>
          </div>
        )}

        <div className="space-y-6">
          {questions.map((q, index) => (
            <div
              key={q.id}
              className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden"
            >
              {suggestion && (
                <button
                  onClick={() => {
                    setQuestions(
                      questions.map((question) =>
                        question.id === q.id
                          ? { ...question, showSuggestion: false }
                          : question
                      )
                    );
                    setSuggestion(null);
                  }}
                  className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  Tutup Saran
                </button>
              )}
              <div
                className={`grid grid-cols-${
                  !suggestion ? 1 : 2
                } divide-x divide-gray-200`}
              >
                {/* Question Section */}
                <div className="p-4">
                  <h3 className="text-lg text-[#00A1A9] font-medium mb-2">
                    Soal #{index + 1}
                  </h3>
                  <div
                    className="prose font-bold"
                    dangerouslySetInnerHTML={{ __html: q.text }}
                  />
                  {q.options && q.options.length > 0 && (
                    <div className="mt-3 pt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Pilihan Jawaban:
                      </p>
                      <div className="space-y-1">
                        {q.options.map((option) => (
                          <div key={option.id} className="text-sm">
                            {option.option_code}. {option.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {/* Analysis Section */}
                {suggestion && (
                  <div className="p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-lg font-medium">Hasil Analisis</h4>
                      <div>
                        {q.ai_suggestion_question && !q.showSuggestion && (
                          <button
                            onClick={() => {
                              setQuestions(
                                questions.map((question) =>
                                  question.id === q.id
                                    ? { ...question, showSuggestion: true }
                                    : question
                                )
                              );
                            }}
                            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            Lihat Saran
                          </button>
                        )}
                        {q.showSuggestion && q.ai_suggestion_question && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => applySuggestions(q)}
                              className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                              Terapkan Saran
                            </button>
                          </div>
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
                          className={`text-sm mt-1 font-medium ${
                            q.kesimpulan_validitas === "Valid"
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

                      {q.ai_suggestion_question && q.showSuggestion && (
                        <>
                          <div>
                            <span className="text-sm font-medium text-gray-700">
                              Saran Perbaikan Soal:
                            </span>
                            <p className="text-sm mt-1 text-blue-600 whitespace-pre-wrap text-justify">
                              {q.ai_suggestion_question}
                            </p>
                          </div>
                          {q.ai_suggestion_options && (
                            <div>
                              <span className="text-sm font-medium text-gray-700">
                                Saran Perbaikan Opsi:
                              </span>
                              <div className="mt-1 space-y-1">
                                {q.ai_suggestion_options.map(
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  (opt: any, idx: number) => (
                                    <p
                                      key={idx}
                                      className="text-sm text-blue-600 text-justify"
                                    >
                                      {opt.option_code}. {opt.text}{" "}
                                      {opt.is_right && "(Kunci)"}
                                    </p>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
