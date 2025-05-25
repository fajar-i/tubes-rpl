'use client';

import Loader from "@/components/Loader";
import React, { useEffect, useState, useRef } from 'react';
import { myAppHook } from "@/context/AppProvider";
import { useParams, useRouter } from "next/navigation";
import axios from 'axios';
import toast from 'react-hot-toast';
import Swal from "sweetalert2";

type Option = {
  id: number;
  text: string;
  is_right?: boolean;
};
type Question = {
  id: number;
  text: string;
  options: Option[];
};
export default function EditorPage() {
  // const id = usePathname().split('/')[2];
  const router = useRouter();
  const { authToken } = myAppHook();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const params = useParams<{ id: any; tag: string; item: string }>()
  const [isRight, setIsRight] = useState<{ [key: string]: number }>({});
  const huruf = (i: number) => { return String.fromCharCode('A'.charCodeAt(0) + i) }
  
  useEffect(() => {
    setLoading(true);
    if (!authToken) {
      router.push("/auth");
      return;
    }
    fetchAllQuestions().finally(() => {
      setLoading(false);
    });
  }, [authToken]);

  useEffect(() => {
    const rightAnswer: { [key: string]: number } = {};
    questions.forEach((q) => {
      const correctOption = q.options.find((o) => o.is_right);
      if (correctOption) { rightAnswer[q.id] = correctOption.id; }
    }
    );
    console.log(isRight)
    setIsRight(rightAnswer);
  }, [questions]);

  const fetchAllQuestions = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/projects/${params.id}/questions`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      })
      setQuestions(response.data.questions)
    } catch (error) {
      console.log("fetch all questions error : " + error);
    }
  };

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

    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/projects/${params.id}/questions/`, newQuestion, {
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
    if (!newText) {
      newText = 'Text harus diisi';
      console.log(newText)
    }
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
    if (!newText) {
      newText = 'Text harus diisi'
    }
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

  const handleSetIsRight = async (qId: string, oId: string) => {
    const parsedQId = parseInt(qId, 10);
    const parsedOId = parseInt(oId, 10);
    setIsRight(prev => ({
      ...prev,
      [parsedQId]: parsedOId
    }));

    setQuestions(prevQuestions =>
      prevQuestions.map(q =>
        q.id === parsedQId
          ? {
            ...q,
            options: q.options.map(opt => ({
              ...opt,
              is_right: opt.id === parsedOId
            }))
          }
          : q
      )
    );

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/rightOption/${parsedOId}`, // <-- Pastikan ini ID opsi yang benar
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

      setIsRight(prev => {
        const newIsRight = { ...prev };
        const originalQuestion = questions.find(q => q.id === parsedQId);
        const originalCorrectOption = originalQuestion?.options.find(o => o.is_right);
        if (originalCorrectOption) {
          newIsRight[parsedQId] = originalCorrectOption.id;
        } else {
          delete newIsRight[parsedQId]; // Hapus jika tidak ada jawaban benar sebelumnya
        }
        return newIsRight;
      });

      setQuestions(prevQuestions =>
        prevQuestions.map(q =>
          q.id === parsedQId
            ? {
              ...q,
              options: q.options.map(opt => ({
                ...opt,
                is_right: opt.id === (questions.find(q => q.id === parsedQId)?.options.find(o => o.is_right)?.id || false)
              }))
            }
            : q
        )
      );
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
              { id: tempId, text: "Pilihan baru", }, // text default
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
                  ? { id: created.id, text: created.text, }  // ← pakai created.id & created.text
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
                    {q.options.map((opt, index) => (

                      <li key={opt.id} className="d-flex justify-content-center align-items-center mb-2">
                        <div className="my-3 mb-0 d-flex flex-row" style={{ marginRight: '30px' }}>{huruf(index)}</div>
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
                      className="d-flex justify-content-between align-items-center pt-3"
                      style={{ cursor: "pointer" }}
                    >
                      <span onClick={() => handleAddOption(q.id)} className="text-primary fst-italic"> + Tambah Pilihan</span>
                      <label htmlFor={`${q.id}`}>Kunci jawaban :</label>

                      <select
                        id={`${q.id}`}
                        value={isRight[q.id]}
                        className="form-select input-small w-25"
                        onChange={(e) => handleSetIsRight(e.target.id, e.target.value)}
                      >
                        {q.options.map((opt, index) => (
                          <option
                            key={opt.id}
                            value={opt.id}
                          >
                            {huruf(index)}. {opt.text}
                          </option>
                        ))}
                      </select>
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
    if (!value) setValue('Text harus diisi')
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
    <div className={`border-bottom my-3 ${className} d-flex flex-row`}>
      {/* {isOption ? (<input type="radio" name={`${name}`} className={`form-check-input me-3`} onClick={() => console.log(value)} />) : undefined} */}
      <div onClick={handleClick} style={{ cursor: 'pointer' }}>
        {text || 'Text harus diisi'}
      </div>
    </div>
  );
}
