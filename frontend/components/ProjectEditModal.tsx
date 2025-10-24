import React, { useEffect } from "react";
import { Project } from "@/types";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ProjectEditModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Project) => Promise<boolean>;
}

const ProjectEditModal: React.FC<ProjectEditModalProps> = ({
  project,
  isOpen,
  onClose,
  onSave,
}) => {
  const [editedProject, setEditedProject] = React.useState<Project>(project);

  useEffect(() => {
    setEditedProject(project);
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editedProject.nama_ujian.trim()) {
      const success = await onSave(editedProject);
      if (success) {
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Edit Proyek
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
                className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={editedProject.nama_ujian}
                onChange={(e) =>
                  setEditedProject({
                    ...editedProject,
                    nama_ujian: e.target.value,
                  })
                }
                placeholder="Masukkan nama ujian"
                required
              />
              {!editedProject.nama_ujian && (
                <p className="mt-1 text-sm text-red-500">
                  Nama ujian harus diisi
                </p>
              )}
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
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={editedProject.mata_pelajaran || ""}
                onChange={(e) =>
                  setEditedProject({
                    ...editedProject,
                    mata_pelajaran: e.target.value,
                  })
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
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={editedProject.kelas || ""}
                onChange={(e) =>
                  setEditedProject({ ...editedProject, kelas: e.target.value })
                }
                placeholder="Masukkan kelas"
              />
            </div>

            <div>
              <label
                htmlFor="semester"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Semester
              </label>
              <input
                type="text"
                id="semester"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={editedProject.semester || ""}
                onChange={(e) =>
                  setEditedProject({
                    ...editedProject,
                    semester: e.target.value,
                  })
                }
                placeholder="Masukkan semester"
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
              disabled={!editedProject.nama_ujian}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectEditModal;
