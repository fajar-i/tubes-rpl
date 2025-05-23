'use client';

import Loader from "@/components/Loader";
import React, { useEffect, useState, useRef } from 'react';
import { myAppHook } from "@/context/AppProvider";
import { useRouter } from "next/navigation";
import axios from 'axios';
import toast from 'react-hot-toast';
import Swal from "sweetalert2";

type Option = { id: number; text: string };
type Question = {
  id: number;
  text: string;
  options: Option[];
};

export default function EditorPage() {
  const router = useRouter();
  const { authToken } = myAppHook();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    setLoading(true);
    if (!authToken) {
      router.push("/auth");
      return;
    }
    fetchAllQuestions().finally(() => {
      setLoading(false);
    });

  }, [authToken])

  const fetchAllQuestions = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/questions`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      })
      setQuestions(response.data.question)

    } catch (error) {
      console.log("fetch all questions error : " + error);
    }
  }

  const handleAddQuestion = async () => {
    const newQuestion: Question = {
      id: Date.now(),
      text: "Soal baru...",
      options: [
        { id: Date.now(), text: "Pilihan A" },
        { id: Date.now(), text: "Pilihan B" },
        { id: Date.now(), text: "Pilihan C" },
      ],
    };

    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/questions/`, newQuestion, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${authToken}`
      }
    })
    setQuestions((prev) => [...prev, response.data.questions]);
    toast.success(response.data.message);
  };

  const handleQuestionBlur = async (qId: number, newText: string) => {
    // 1. Optimistic update: ubah state lokal dulu
    setQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, text: newText } : q))
    );

    // 2. Panggil API, tapi jangan panggil fetchAllQuestions()
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/questions/${qId}`,
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
      // (opsional) rollback state jika error:
      fetchAllQuestions();
    }
  };
  const handleOptionBlur = async (qId: number, oId: number, newText: string) => {
    // Optimistic update
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? {
            ...q,
            options: q.options.map((o) =>
              o.id === oId ? { ...o, text: newText } : o
            ),
          } : q
      )
    );

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/options/${oId}`,
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
      // (opsional) rollback state jika error:
      fetchAllQuestions();
    }
  };

  const handleAddOption = async (qId: number) => {
    // temporary ID untuk opsi baru
    const tempId = Date.now();

    // tambahkan opsi baru ke state (Optimistic update)
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? {
            ...q,
            options: [
              ...q.options,
              { id: tempId, text: "Pilihan baru" }, // text default
            ],
          }
          : q
      )
    );
    // Panggil API untuk simpan opsi
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/options/`,
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
      const created: Option = response.data; // { id: realId, text: "Pilihan baru", question_id: qId }
      // 4. Replace temporary ID dengan ID asli dari server
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === qId
            ? {
              ...q,
              options: q.options.map(o =>
                o.id === tempId
                  ? { id: created.id, text: created.text }  // ← pakai created.id & created.text
                  : o
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
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/${type}/${id}`, {
            headers: {
              Authorization: `Bearer ${authToken}`
            }
          })
          if (response.data.status) {
            toast.success(response.data.message)
            fetchAllQuestions();
          }
        } catch (error) { console.log(error) }
      }
    });
  }
  if (loading) {
    return <Loader />;
  } else {
    return (
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6">
            {questions.map((q) => (
              <div key={q.id} className="card mb-4">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="flex-grow-1 me-2">
                      <EditableText
                        text={q.text}
                        onBlur={(newText) => handleQuestionBlur(q.id, newText)}
                        className="h5 mb-0"
                      />
                    </div>
                  </div>
                  <ul className="list-unstyled ps-3">
                    {q.options.map((opt) => (
                      <li key={opt.id} className="d-flex justify-content-between align-items-center mb-2">
                        <div className="flex-grow-1 me-2">
                          <EditableText
                            text={opt.text}
                            onBlur={(newText) => handleOptionBlur(q.id, opt.id, newText)}
                            className="mb-0"
                          />
                        </div>
                        <button
                          className="btn btn-sm btn-danger" style={{ minWidth: '100px' }}
                          onClick={() => handleDelete(opt.id, "options")}
                        >
                          Delete option
                        </button>
                      </li>
                    ))}

                    <li
                      className="d-flex justify-content-between align-items-center text-primary fst-italic pt-3"
                      style={{ cursor: "pointer" }}
                    >
                      <span onClick={() => handleAddOption(q.id)}>+ Tambah Pilihan</span>
                      <button
                        className="btn btn-sm btn-danger"
                        style={{ minWidth: '130px' }}
                        onClick={() => handleDelete(q.id, "questions")}
                      >
                        Delete question
                      </button>
                    </li>

                  </ul>
                </div>
              </div>
            ))}
            <div className="text-center">
              <button
                onClick={handleAddQuestion}
                className="btn btn-primary"
              >
                + Tambah Soal
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function EditableText({
  text,
  onBlur,
  className = '',
}: {
  text: string;
  onBlur: (value: string) => void;
  className?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(text);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 10);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (value !== text) onBlur(value);
  };

  return isEditing ? (
    <input
      ref={inputRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleBlur}
      className={`form-control ${className}`}
    />
  ) : (
    <div onClick={handleClick} className={`border-bottom my-3 ${className}`} style={{ cursor: 'pointer' }}>
      {text || '(Klik untuk edit)'}
    </div>
  );
}
