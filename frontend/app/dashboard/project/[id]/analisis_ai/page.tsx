"use client";

import React, { useEffect, useState } from "react";
import Loader from "@/components/ui/Loader";
import { useMyAppHook } from "@/context/AppProvider";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AxiosInstance } from "@/lib/axios";
import { DocumentIcon } from "@heroicons/react/24/outline";

type MaterialType = {
  id: number;
  project_id: number;
  content: string;
  gemini_file_uri: string;
  created_at: string;
};

type QuestionType = {
  id: number;
  text: string;
  options?: { id?: number; text: string; option_code?: string }[];
  ai_suggestion?: string;
  is_valid?: boolean;
  validation_note?: string;
  bloom_taxonomy?: string;
  showSuggestion?: boolean;
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [materials, setMaterials] = useState<MaterialType[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState<boolean>(true);

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
        const resp = await AxiosInstance.get(`/projects/${projectId}/questions`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setQuestions((resp.data.questions || []).map((q: QuestionType) => ({
          ...q,
          showSuggestion: false
        })));
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
      formData.append('file', file);  
      
      const materialRes = await AxiosInstance.post(`/projects/${projectId}/materials`, formData, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (!materialRes.data.status) {
        throw new Error(materialRes.data.message || 'Failed to upload material');
      }

      // Add a small delay to ensure the material is processed
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Then validate each question with the uploaded material
      const validationPromises = questions.map(async (question) => {
        try {
          const response = await AxiosInstance.post(`/question/${question.id}/validate`, null, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });
          return response;
        } catch (error) {
          console.error(`Error validating question ${question.id}:`, error);
          // Return a structured error response instead of throwing
          return {
            data: {
              status: false,
              question: {
                ...question,
                is_valid: false,
                validation_note: "Validasi gagal dilakukan",
                bloom_taxonomy: null,
                ai_suggestion: null
              }
            }
          };
        }
      });

      const validationResults = await Promise.all(validationPromises);
      setQuestions(validationResults.map(res => ({
        ...res.data.question,
        showSuggestion: false // Add this flag to control individual suggestions
      })));
      
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
                  <div key={material.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center gap-3">
                      <DocumentIcon className="h-5 w-5 text-gray-500" />
                      <a 
                        href={material.content} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm text-blue-600 hover:underline truncate max-w-[300px]"
                      >
                        {material.content.split('/').pop()}
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
                            const validationPromises = questions.map(async (question) => {
                              try {
                                const response = await AxiosInstance.post(`/question/${question.id}/validate`, null, {
                                  headers: { 'Authorization': `Bearer ${authToken}` }
                                });
                                return response;
                              } catch (error) {
                                console.log("Gagal melakukan validasi", error);
                                return {
                                  data: {
                                    status: false,
                                    question: {
                                      ...question,
                                      is_valid: false,
                                      validation_note: "Validasi gagal dilakukan",
                                      bloom_taxonomy: null,
                                      ai_suggestion: null
                                    }
                                  }
                                };
                              }
                            });
                  
                            const validationResults = await Promise.all(validationPromises);
                            setQuestions(validationResults.map(res => ({
                              ...res.data.question,
                              showSuggestion: false
                            })));
                            
                            setSuggestion("completed");
                            toast.success("Analisis dengan materi berhasil dilakukan");
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
                Belum ada materi ajar. Silakan unggah materi untuk menganalisis soal.
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
            <div key={q.id} className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className={`grid grid-cols-${!suggestion ? 1 : 2} divide-x divide-gray-200`}>
                {/* Question Section */}
                <div className="p-4">
                  <h3 className="text-lg text-[#00A1A9] font-medium mb-2">Soal #{index + 1}</h3>
                  <div
                    className="prose font-bold"
                    dangerouslySetInnerHTML={{ __html: q.text }}
                  />
                  {q.options && q.options.length > 0 && (
                    <div className="mt-3 pt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Pilihan Jawaban:</p>
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
                {suggestion && <div className="p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-medium">Hasil Analisis</h4>
                    {q.ai_suggestion && !q.showSuggestion && (
                      <button
                        onClick={() => {
                          setQuestions(questions.map(question => 
                            question.id === q.id ? { ...question, showSuggestion: true } : question
                          ));
                        }}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Lihat Saran
                      </button>
                    )}
                    {q.showSuggestion && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setQuestions(questions.map(question => 
                              question.id === q.id ? { ...question, showSuggestion: false } : question
                            ));
                            setSuggestion(null);
                          }}
                          className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                        >
                          Batalkan
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await AxiosInstance.put(
                                `/questions/${q.id}`,
                                { text: q.ai_suggestion },
                                { headers: { Authorization: `Bearer ${authToken}` } }
                              );
                              
                              const resp = await AxiosInstance.get(`/projects/${projectId}/questions`, {
                                headers: { Authorization: `Bearer ${authToken}` },
                              });
                              setQuestions(resp.data.questions.map((question: QuestionType) => ({
                                ...question,
                                showSuggestion: false
                              })));
                              setSuggestion(null);
                              toast.success("Saran berhasil diterapkan");
                            } catch (err) {
                              console.error("Gagal menerapkan saran:", err);
                              toast.error("Gagal menerapkan saran");
                            }
                          }}
                          className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        >
                          Terapkan
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className={`text-sm font-medium ${
                      q.is_valid ? 'text-green-600' : 'text-red-600'
                    }`}>
                      Status: {q.is_valid ? 'Valid' : 'Invalid'}
                    </div>
                    {q.bloom_taxonomy && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Tingkatan Bloom:</span>
                        <p className="text-sm mt-1">{q.bloom_taxonomy}</p>
                      </div>
                    )}
                    {q.validation_note && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Catatan:</span>
                        <p className="text-sm mt-1">{q.validation_note}</p>
                      </div>
                    )}
                    {q.ai_suggestion && q.showSuggestion && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Saran Perbaikan:</span>
                        <p className="text-sm mt-1 text-blue-600">{q.ai_suggestion}</p>
                      </div>
                    )}
                  </div>
                </div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
