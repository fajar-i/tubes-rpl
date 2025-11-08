import React, { useState } from "react";
import { Project } from "@/types";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ProjectAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (project: Project) => void;
}

const ProjectAddModal: React.FC<ProjectAddModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [newProject, setNewProject] = useState<Project>({
    public_id: "temp_id_" + Date.now(),
    nama_ujian: "",
    mata_pelajaran: "",
    kelas: "",
    semester: "",
    capaian_pembelajaran: "",
    indikator_ketercapaian_pembelajaran: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProject.nama_ujian.trim()) {
      onAdd(newProject);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative w-full max-w-2xl h-9/12 mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Tambah Proyek Baru
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
                htmlFor="nama_ujian"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Nama Ujian
              </label>
              <input
                type="text"
                id="nama_ujian"
                className="w-full p-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 rounded-lg dark:bg-gray-700 dark:text-white"
                value={newProject.nama_ujian}
                onChange={(e) =>
                  setNewProject({ ...newProject, nama_ujian: e.target.value })
                }
                placeholder="Masukkan nama ujian"
                required
              />
            </div>

            <div>
              <label
                htmlFor="mata_pelajaran"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Mata Pelajaran
              </label>
              <input
                type="text"
                id="mata_pelajaran"
                className="w-full p-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                value={newProject.mata_pelajaran}
                onChange={(e) =>
                  setNewProject({ ...newProject, mata_pelajaran: e.target.value })
                }
                placeholder="Masukkan mata pelajaran"
              />
            </div>

            <div>
              <label
                htmlFor="kelas"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Kelas
              </label>
              <input
                type="text"
                id="kelas"
                className="w-full p-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                value={newProject.kelas}
                onChange={(e) =>
                  setNewProject({ ...newProject, kelas: e.target.value })
                }
                placeholder="Masukkan kelas"
              />
            </div>

            <div>
              <label
                htmlFor="semester"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Semester (Genap/Ganjil)
              </label>
              <input
                type="text"
                id="semester"
                className="w-full p-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                value={newProject.semester}
                onChange={(e) =>
                  setNewProject({ ...newProject, semester: e.target.value })
                }
                placeholder="Masukkan semester"
              />
            </div>

            <div>
              <label
                htmlFor="capaian_pembelajaran"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Capaian Pembelajaran
              </label>
              <textarea
                id="capaian_pembelajaran"
                className="w-full p-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                value={newProject.capaian_pembelajaran}
                onChange={(e) =>
                  setNewProject({ ...newProject, capaian_pembelajaran: e.target.value })
                }
                placeholder="Masukkan capaian pembelajaran"
              />
            </div>

            <div>
              <label
                htmlFor="indikator_ketercapaian_pembelajaran"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Indikator Ketercapaian Pembelajaran
              </label>
              <textarea
                id="semester"
                className="w-full p-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                value={newProject.indikator_ketercapaian_pembelajaran}
                onChange={(e) =>
                  setNewProject({ ...newProject, indikator_ketercapaian_pembelajaran: e.target.value })
                }
                placeholder="Masukkan indikator ketercapaian pembelajaran"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!newProject.nama_ujian}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tambah Proyek
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectAddModal;