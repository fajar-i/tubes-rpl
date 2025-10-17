"use client";

import React, { useEffect, useState } from "react";
import Loader from "@/components/Loader";
import { useMyAppHook } from "@/context/AppProvider";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AxiosInstance } from "@/lib/axios";
import { DocumentIcon } from "@heroicons/react/24/outline";

type QuestionType = {
  id: number;
  text: string;
  options?: { id?: number; text: string; option_code?: string }[];
};

export default function AnalisisAIPage() {
  const { authToken } = useMyAppHook();
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const router = useRouter();

  const [loadingPage, setLoadingPage] = useState<boolean>(true);
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  // suggestion text per question: null => belum diminta / dismissed
  const [suggestions, setSuggestions] = useState<Record<number, string | null>>({});
  // loading flags per question
  const [loadingSuggestion, setLoadingSuggestion] = useState<Record<number, boolean>>({});
  const [savingSuggestion, setSavingSuggestion] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!authToken) {
      router.push("/auth");
      return;
    }

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

  // request suggestion untuk 1 question
  const getSuggestion = async (q: QuestionType) => {
    if (!authToken) return;
    setLoadingSuggestion((s) => ({ ...s, [q.id]: true }));

    try {
      const res = await AxiosInstance.post(`/question/${q.id}/validate`, {}, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      // backend harus mengembalikan { original, suggestion }
      setSuggestions((prev) => ({ ...prev, [q.id]: res.data.suggestion ?? null }));
    } catch (err) {
      console.error("Gagal minta saran AI:", err);
      toast.error("Gagal mengambil saran AI");
      setSuggestions((prev) => ({ ...prev, [q.id]: null }));
    } finally {
      setLoadingSuggestion((s) => ({ ...s, [q.id]: false }));
    }
  };

  // simpan saran ke DB (PUT /questions/{id})
  const applySuggestion = async (q: QuestionType) => {
    const suggested = suggestions[q.id];
    if (!suggested || !authToken) return;

    setSavingSuggestion((s) => ({ ...s, [q.id]: true }));
    try {
      const res = await AxiosInstance.put(
        `/questions/${q.id}`,
        { text: suggested },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      // update local questions list
      setQuestions((prev) => prev.map((qq) => (qq.id === q.id ? res.data.question : qq)));
      toast.success("Soal diperbarui dengan saran AI ✅");
      // hide suggestion after saving
      setSuggestions((prev) => ({ ...prev, [q.id]: null }));
    } catch (err) {
      console.error("Gagal simpan saran:", err);
      toast.error("Gagal menyimpan saran AI");
    } finally {
      setSavingSuggestion((s) => ({ ...s, [q.id]: false }));
    }
  };

  // cancel suggestion di UI (tidak menyentuh DB)
  const cancelSuggestion = (qId: number) => {
    setSuggestions((prev) => ({ ...prev, [qId]: null }));
    toast("Saran AI dibatalkan");
  };

  if (loadingPage) return <Loader />;

  return (
    <>
      {/* grid dua kolom (kiri: original, kanan: suggestion) */}
      <div className="flex-shrink-0 mb-3">
        <button
          className="flex items-center px-4 py-2 rounded-md text-base font-medium text-white bg-yellow-500 hover:bg-yellow-600 cursor-pointer"
          >
          <DocumentIcon className="h-6 w-6 mr-3" />
          Unggah Materi Ajar
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {questions.map((q) => (
          <div key={q.id} className="border-2 border-teal-700 rounded-md p-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Original */}
              <div className="border p-3 rounded">
                <div className="min-h-[120px]">
                  <div className="text-sm text-gray-700">{q.text}</div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => toast.success("Soal asli dipertahankan")}
                    className="px-3 py-2 bg-teal-800 text-white rounded-md"
                  >
                    Simpan Soal Asli
                  </button>
                </div>
              </div>

              {/* Suggestion */}
              <div className="border p-3 rounded flex flex-col justify-between">
                <div>
                  {/* if suggestion fetched show it, else show button */}
                  {loadingSuggestion[q.id] ? (
                    <div>Meminta saran AI...</div>
                  ) : suggestions[q.id] ? (
                    <div>
                      <div className="min-h-[120px] text-sm text-gray-700 mb-3">{suggestions[q.id]}</div>
                    </div>
                  ) : (
                    <div className="min-h-[120px] text-sm text-gray-500">Belum meminta saran AI</div>
                  )}
                </div>

                <div className="mt-3 flex gap-2">
                  {!suggestions[q.id] ? (
                    <button
                      onClick={() => getSuggestion(q)}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md"
                    >
                      {loadingSuggestion[q.id] ? "Meminta saran..." : "Minta Saran AI"}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => applySuggestion(q)}
                        disabled={savingSuggestion[q.id]}
                        className="px-3 py-2 bg-green-600 text-white rounded-md"
                      >
                        {savingSuggestion[q.id] ? "Menyimpan..." : "Simpan Saran AI"}
                      </button>
                      <button onClick={() => cancelSuggestion(q.id)} className="px-3 py-2 bg-red-600 text-white rounded-md">
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
