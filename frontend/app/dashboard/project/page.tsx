"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Project } from "@/types";
import Loader from "@/components/ui/Loader";
import ProjectEditModal from "@/components/ui/modal/ProjectEditModal";
import { useProjects } from "@/context/ProjectContext";
import ProjectAddModal from "@/components/ui/modal/ProjectAddModal";
import { AcademicCapIcon, BookOpenIcon, CalendarIcon, DocumentCheckIcon, EyeIcon, PencilSquareIcon, SparklesIcon, TrashIcon } from "@heroicons/react/24/outline";

const ProjectPage: React.FC = () => {
  const router = useRouter();
  const { projects, loading, addProject, updateProject, deleteProject, fetchProjects } = useProjects();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDetailProject = (p: Project) => {
    router.push(`/dashboard/project/${p.public_id}/form`);
  };

  const handleEditProject = async (p: Project) => {
    setSelectedProject(p);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedProject(null);
  };

  const handleOpenAddModal = () => {
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="container mx-auto py-4">
      <div className="flex justify-between text-center my-4">
        <h1 className="text-3xl font-bold mb-3">Proyek</h1>
        <button
          onClick={handleOpenAddModal}
          className="px-6 py-2 text-lg font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          + Tambah Proyek
        </button>
      </div>
      <ProjectAddModal
        isOpen={showAddModal}
        onClose={handleCloseAddModal}
        onAdd={addProject}
      />
      {selectedProject && (
        <ProjectEditModal
          project={selectedProject}
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          onSave={updateProject}
        />
      )}
      {!projects || projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[200px] rounded-lg">
          <h3 className="text-lg text-gray-600 mb-4">
            Belum ada Proyek yang dibuat
          </h3>
        </div>
      ) : (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6">
          {projects.map((p) => (
            <div
              key={p.public_id}
              className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              {/* Card Header with Project Type Badge */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
                    {p.nama_ujian}
                  </h3>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => deleteProject(p.public_id)}
                      className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                      >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Card Body with Project Details */}
              <div className="px-6 py-4 space-y-3">
                <div className="space-y-2">
                  {p.mata_pelajaran && (
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <BookOpenIcon className="h-5 w-5 mr-2"/>
                      <span>{p.mata_pelajaran}</span>
                    </div>
                  )}
                  {p.kelas && (
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <AcademicCapIcon className="h-5 w-5 mr-2"/>
                      <span>{p.kelas}</span>
                    </div>
                  )}
                  {p.semester && (
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <CalendarIcon className="h-5 w-5 mr-2"/>
                      <span>{p.semester}</span>
                    </div>
                  )}
                  {p.tujuan_pembelajaran && (
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <SparklesIcon className="h-10 mr-1"/>
                      <span>{p.tujuan_pembelajaran}</span>
                    </div>
                  )}
                  {p.indikator_ketercapaian_pembelajaran && (
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <DocumentCheckIcon className="h-10 mr-1"/>
                      <span>{p.indikator_ketercapaian_pembelajaran}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer with Actions */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-3 justify-between">
                  <button
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
                    onClick={() => handleDetailProject(p)}
                  >
                    <EyeIcon className="h-4 w-4"/>
                    Lihat Detail
                  </button>
                  <button
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 transition-colors duration-200 flex items-center justify-center gap-2"
                    onClick={() => handleEditProject(p)}
                  >
                   <PencilSquareIcon className="h-4 w-4" />
                    Edit Proyek
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      )}
    </div>
  );
};

export default ProjectPage;
