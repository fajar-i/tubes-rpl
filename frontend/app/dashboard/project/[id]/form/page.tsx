"use client";

import Loader from "@/components/ui/Loader";
import React, { useEffect, useState } from "react";
import { useMyAppHook } from "@/context/AppProvider";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { AxiosInstance } from "@/lib/axios";
import { OptionForm, QuestionForm } from "@/types";
import EditableText from "@/components/ui/EditableText";

export default function EditorPage() {
  const router = useRouter();
  const { authToken } = useMyAppHook();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuestionForm[]>([]);
  const params = useParams<{ id: string; tag: string; item: string }>();
  const [isRight, setIsRight] = useState<{ [key: string]: number }>({});
  const huruf = (i: number) => {
    return String.fromCharCode("A".charCodeAt(0) + i);
  };

  const fetchAllQuestions = async () => {
    try {
      const response = await AxiosInstance.get(
        `/projects/${params.id}/questions`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      setQuestions(response.data.questions);
    } catch (error) {
      console.log("fetch all questions error : " + error);
    }
  };
  
  useEffect(() => {
    setLoading(true);
    
    fetchAllQuestions().finally(() => {
      setLoading(false);
    });
  }, [authToken, router]);

  useEffect(() => {
    const rightAnswer: { [key: string]: number } = {};
    questions.forEach((q) => {
      const correctOption = q.options.find((o) => o.is_right);
      if (correctOption) {
        rightAnswer[q.id] = correctOption.id;
      }
    });
    setIsRight(rightAnswer);
  }, [questions]);

  const handleAddQuestion = async () => {
    const newQuestion: QuestionForm = {
      id: Date.now(),
      text: "Soal baru...",
      options: [
        { id: Date.now(), text: "Pilihan A" },
        { id: Date.now(), text: "Pilihan B" },
        { id: Date.now(), text: "Pilihan C" },
      ],
    };

    const response = await AxiosInstance.post(
      `/projects/${params.id}/questions/`,
      newQuestion,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    setQuestions((prev) => [...prev, response.data.questions]);
    toast.success("Soal baru ditambahkan");
  };

  const handleQuestionBlur = async (qId: number, newText: string) => {
    if (!newText) {
      newText = "Text harus diisi";
    }
    setQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, text: newText } : q))
    );
    try {
      await AxiosInstance.post(
        `/questions/${qId}`,
        { text: newText, _method: "PUT" },
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      toast.success("Soal tersimpan");
    } catch (e) {
      toast.error("Gagal menyimpan soal");
      console.error(e);
      fetchAllQuestions();
    }
  };

  const handleOptionBlur = async (
    qId: number,
    oId: number,
    newText: string
  ) => {
    if (!newText) {
      newText = "Text harus diisi";
    }
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? {
              ...q,
              options: q.options.map((o) =>
                o.id === oId ? { ...o, text: newText } : o
              ),
            }
          : q
      )
    );

    try {
      await AxiosInstance.post(
        `/options/${oId}`,
        { question_id: qId, text: newText, _method: "PUT" },
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      toast.success("Opsi tersimpan");
    } catch (e) {
      toast.error("Gagal menyimpan opsi");
      console.error(e);
      fetchAllQuestions();
    }
  };

  const handleSetIsRight = async (qId: string, oId: string) => {
    const parsedQId = parseInt(qId, 10);
    const parsedOId = parseInt(oId, 10);
    setIsRight((prev) => ({
      ...prev,
      [parsedQId]: parsedOId,
    }));

    setQuestions((prevQuestions) =>
      prevQuestions.map((q) =>
        q.id === parsedQId
          ? {
              ...q,
              options: q.options.map((opt) => ({
                ...opt,
                is_right: opt.id === parsedOId,
              })),
            }
          : q
      )
    );

    try {
      await AxiosInstance.post(
        `/rightOption/${parsedOId}`,
        { _method: "PUT" },
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      toast.success("Kunci Jawaban tersimpan");
    } catch (e) {
      toast.error("Gagal menyimpan kunci jawaban");
      console.error(e);

      setIsRight((prev) => {
        const newIsRight = { ...prev };
        const originalQuestion = questions.find((q) => q.id === parsedQId);
        const originalCorrectOption = originalQuestion?.options.find(
          (o) => o.is_right
        );
        if (originalCorrectOption) {
          newIsRight[parsedQId] = originalCorrectOption.id;
        } else {
          delete newIsRight[parsedQId];
        }
        return newIsRight;
      });

      setQuestions((prevQuestions) =>
        prevQuestions.map((q) =>
          q.id === parsedQId
            ? {
                ...q,
                options: q.options.map((opt) => ({
                  ...opt,
                  is_right:
                    opt.id ===
                    (questions
                      .find((q) => q.id === parsedQId)
                      ?.options.find((o) => o.is_right)?.id || false),
                })),
              }
            : q
        )
      );
    }
  };

  const handleAddOption = async (qId: number) => {
    const tempId = Date.now();

    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? {
              ...q,
              options: [...q.options, { id: tempId, text: "Pilihan baru" }],
            }
          : q
      )
    );
    try {
      const response = await AxiosInstance.post(
        `/options/`,
        {
          question_id: qId,
          text: "Pilihan baru",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      const created: OptionForm = response.data;
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === qId
            ? {
                ...q,
                options: q.options.map((o) =>
                  o.id === tempId ? { id: created.id, text: created.text } : o
                ),
              }
            : q
        )
      );
      toast.success("Opsi berhasil ditambahkan");
    } catch (e) {
      console.error(e);
      toast.error("Gagal menambah opsi");
      fetchAllQuestions();
    }
  };

  const handleDelete = async (id: number, type: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await AxiosInstance.delete(`/${type}/${id}`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          });
          if (response.data.status) {
            toast.success(response.data.message);
            fetchAllQuestions();
          }
        } catch (error) {
          console.log(error);
        }
      }
    });
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <div className="flex justify-center">
        <div className="w-full max-w-3xl">
          {questions.map((q, index) => (
            <div
              key={q.id}
              className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-4"
            >
              <h3 className="text-lg text-[#00A1A9] font-bold mb-2">Soal #{index + 1}</h3>
              <div className="flex justify-between items-center mb-3">
                <div className="flex-grow-1 me-2">
                  <EditableText
                    text={q.text}
                    onBlur={(newText) => handleQuestionBlur(q.id, newText)}
                    className="text-lg font-semibold"
                  />
                </div>
              </div>
              <ul className="list-none pl-3">
                {q.options.map((opt, index) => (
                  <li key={opt.id} className="flex items-center mb-2">
                    <div className="mr-4 text-gray-700 dark:text-gray-300">
                      {huruf(index)}
                    </div>
                    <div className="flex-grow-1 mr-2">
                      <EditableText
                        text={opt.text}
                        onBlur={(newText) =>
                          handleOptionBlur(q.id, opt.id, newText)
                        }
                        className="text-base max-w-lg text-justify"
                      />
                    </div>
                    <button
                      className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 min-w-[100px]"
                      onClick={() => handleDelete(opt.id, "options")}
                    >
                      Hapus Opsi
                    </button>
                  </li>
                ))}

                <li className="flex justify-between items-center pt-3 cursor-pointer">
                  <span
                    onClick={() => handleAddOption(q.id)}
                    className="text-blue-600 italic hover:underline"
                  >
                    {" "}
                    + Tambah Pilihan
                  </span>
                  <label
                    htmlFor={`${q.id}`}
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Kunci jawaban:
                  </label>
                  <select
                    id={`${q.id}`}
                    value={isRight[q.id]}
                    className="form-select w-1/4 p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    onChange={(e) =>
                      handleSetIsRight(e.target.id, e.target.value)
                    }
                  >
                    {q.options.map((opt, index) => (
                      <option key={opt.id} value={opt.id}>
                        {huruf(index)}.
                      </option>
                    ))}
                  </select>
                  <button
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 min-w-[130px]"
                    onClick={() => handleDelete(q.id, "questions")}
                  >
                    Hapus Soal
                  </button>
                </li>
              </ul>
            </div>
          ))}
          <div className="text-center mt-4">
            <button
              onClick={handleAddQuestion}
              className="px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              + Tambah Soal
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
