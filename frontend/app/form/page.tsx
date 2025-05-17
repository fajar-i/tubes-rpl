'use client';

import { useState, useRef } from 'react';
// import { updateQuestion, updateOption } from '@/lib/api';

type Option = { id: number; text: string };
type Question = {
  id: number;
  text: string;
  options: Option[];
};

let tempId = 9999; // ID sementara untuk soal baru

export default function EditorPage() {
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      text: "Apa ibukota Indonesia?",
      options: [
        { id: 101, text: "Jakarta" },
        { id: 102, text: "Bandung" },
        { id: 103, text: "Surabaya" },
      ],
    },
  ]);

  const handleAddQuestion = () => {
    const newId = tempId++;
    const newQuestion: Question = {
      id: newId,
      text: "Soal baru...",
      options: [
        { id: tempId++, text: "Pilihan A" },
        { id: tempId++, text: "Pilihan B" },
        { id: tempId++, text: "Pilihan C" },
      ],
    };
    setQuestions((prev) => [...prev, newQuestion]);
  };

  const handleQuestionBlur = async (qId: number, newText: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, text: newText } : q))
    );
    if (qId < 9999) {
      try {
        // await updateQuestion(qId, newText);
        console.log(qId, newText);
      } catch (e) {
        console.error(e);
        alert("Gagal menyimpan soal");
      }
    }
  };

  const handleOptionBlur = async (qId: number, oId: number, newText: string) => {
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
    if (oId < 9999) {
      try {
        // await updateOption(oId, newText);
        console.log(oId, newText);
      } catch (e) {
        console.error(e);
        alert("Gagal menyimpan opsi");
      }
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      {questions.map((q) => (
        <div key={q.id} className="mb-6 border p-3 rounded shadow-sm">
          <EditableText
            text={q.text}
            onBlur={(newText) => handleQuestionBlur(q.id, newText)}
            className="text-lg font-semibold mb-2"
          />
          <ul className="pl-5 list-disc">
            {q.options.map((opt) => (
              <li key={opt.id}>
                <EditableText
                  text={opt.text}
                  onBlur={(newText) => handleOptionBlur(q.id, opt.id, newText)}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}

      <button
        onClick={handleAddQuestion}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        + Tambah Soal
      </button>
    </div>
  );
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
    if (value !== text) {
      onBlur(value);
    }
  };

  return isEditing ? (
    <input
      ref={inputRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleBlur}
      className={`border px-2 py-1 w-full ${className}`}
    />
  ) : (
    <div onClick={handleClick} className={`cursor-pointer hover:bg-gray-100 ${className}`}>
      {text || '(Klik untuk edit)'}
    </div>
  );
}
