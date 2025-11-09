import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface QuestionsAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (count: number) => void;
}

const QuestionsAddModal: React.FC<QuestionsAddModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [questionCount, setQuestionCount] = useState<number>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (questionCount >= 0 && questionCount <= 100) {
      onAdd(questionCount);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative w-full max-w-md mx-auto bg-white rounded-xl shadow-lg">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Tambah Banyak Soal
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="questionCount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Jumlah Soal
              </label>
              <input
                type="text"
                id="questionCount"
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 rounded-lg"
                placeholder="Masukkan jumlah soal (1-100)"
                required
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={questionCount < 1 || questionCount > 100}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tambah Soal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionsAddModal;