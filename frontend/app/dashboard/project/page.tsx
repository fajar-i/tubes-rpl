"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Project } from "@/types";
import Loader from "@/components/ui/Loader";
import ProjectEditModal from "@/components/ProjectEditModal";
import { useProjects, ProjectProvider } from "@/context/ProjectContext";
import ProjectAddModal from "@/components/ProjectAddModal";
import { EyeIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

const ProjectPageContent: React.FC = () => {
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span>{p.mata_pelajaran}</span>
                    </div>
                  )}
                  {p.kelas && (
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>{p.kelas}</span>
                    </div>
                  )}
                  {p.semester && (
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{p.semester}</span>
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
    </div>
  );
};

const ProjectPage: React.FC = () => {
  return (
    <ProjectProvider>
      <ProjectPageContent />
    </ProjectProvider>
  );
};

export default ProjectPage;
