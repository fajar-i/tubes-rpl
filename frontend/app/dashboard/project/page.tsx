"use client";

import React, { useEffect, useState } from "react";
import { useMyAppHook } from "@/context/AppProvider";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { AxiosInstance } from "@/lib/axios";
import Loader from "@/components/Loader";
import { Project } from "@/types";

const ProjectPage: React.FC = () => {
  const router = useRouter();
  const { authToken } = useMyAppHook();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project>();

  useEffect(() => {
    setLoading(true);
    if (!authToken) {
      router.push("/auth");
      return;
    }
    fetchAllProjects().finally(() => {
      setLoading(false);
    });
  }, [authToken, router]);

  const fetchAllProjects = async () => {
    try {
      const response = await AxiosInstance.get(`/projects`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      setProjects(response.data.projects);
    } catch (error) {
      console.log("fetch all projects error : " + error);
      toast.error("Failed to fetch projects.");
    }
  };

  const handleAddProject = async () => {
    const newProject: Project = {
      "public_id": "temp_id_" + Date.now(), // Temporary ID for optimistic update
      "nama_ujian": "Ujian baru",
      "mata_pelajaran": "Mata pelajaran ujian",
      "kelas": "Kelas saya",
      "semester": "Semester Ganjil/Genap",
    };

    try {
      const response = await AxiosInstance.post(`/projects/`, newProject, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${authToken}`
        }
      });
      if (response.data.status) {
        setProjects((prev) => [...prev, response.data.project]);
        toast.success(response.data.message);
      } else {
        toast.error("Failed to add project.");
      }
    } catch (error) {
      console.log("Add project error: " + error);
      toast.error("Failed to add project.");
    }
  };

  const handleOpenProject = (p: Project) => {
    router.push(`/dashboard/project/${p.public_id}/form`);
  };

  const handleOpenModal = async (p: Project) => {
    setSelectedProject(p);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProject(undefined);
  };

  const handleSaveProject = async (p: Project) => {
    try {
      const response = await AxiosInstance.post(
        `/projects/${p.public_id}`, {
        "nama_ujian": p.nama_ujian,
        "mata_pelajaran": p.mata_pelajaran,
        "kelas": p.kelas,
        "semester": p.semester,
        _method: "PUT"
      },
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      if (response.data.status) {
        toast.success("Project saved successfully");
        setProjects((prev) =>
          prev.map((thisP) => (thisP.public_id === p.public_id ? p : thisP))
        );
      } else {
        toast.error("Failed to save project.");
      }
    } catch (e) {
      toast.error("Failed to save project.");
      console.error(e);
      fetchAllProjects(); // Re-fetch to ensure data consistency
    }
    handleCloseModal();
  };

  const handleDelete = async (id: string) => {
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
          const response = await AxiosInstance.delete(`/projects/${id}`, {
            headers: {
              Authorization: `Bearer ${authToken}`
            }
          });
          if (response.data.status) {
            toast.success(response.data.message);
            fetchAllProjects();
          } else {
            toast.error("Failed to delete project.");
          }
        } catch (error) {
          console.log(error);
          toast.error("Failed to delete project.");
        } finally {
          handleCloseModal();
        }
      }
    });
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="container mx-auto py-4">
       <h1 className="text-3xl font-bold mb-3">Proyek</h1>
      {selectedProject && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 ${showModal ? "block" : "hidden"
            }`}
        >
          <div className="relative w-full max-w-md mx-auto rounded-lg shadow-lg bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h5 className="text-xl font-semibold text-gray-900 dark:text-white">
                Edit Proyek
              </h5>
              <button
                type="button"
                className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-700 dark:hover:text-white"
                onClick={handleCloseModal}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </button>
            </div>
            <div className="p-4 flex flex-wrap gap-3 justify-center">
              <input
                type="text"
                className={`w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white ${selectedProject.nama_ujian ? "" : "border-red-500"
                  }`}
                value={selectedProject.nama_ujian}
                placeholder="Nama ujian harus diisi"
                onChange={(e) =>
                  setSelectedProject({ ...selectedProject, nama_ujian: e.target.value })
                }
                required
              />
              <input
                type="text"
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                value={selectedProject.mata_pelajaran || ""}
                placeholder="Mata pelajaran"
                onChange={(e) =>
                  setSelectedProject({ ...selectedProject, mata_pelajaran: e.target.value })
                }
              />
              <input
                type="text"
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                value={selectedProject.kelas || ""}
                placeholder="Kelas"
                onChange={(e) =>
                  setSelectedProject({ ...selectedProject, kelas: e.target.value })
                }
              />
              <input
                type="text"
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                value={selectedProject.semester || ""}
                placeholder="Semester"
                onChange={(e) =>
                  setSelectedProject({ ...selectedProject, semester: e.target.value })
                }
              />
            </div>
            <div className="flex items-center p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
                onClick={handleCloseModal}
              >
                Batal
              </button>
              <button
                className="ml-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                onClick={
                  selectedProject.nama_ujian
                    ? () => handleSaveProject(selectedProject)
                    : undefined
                }
                disabled={!selectedProject.nama_ujian}
              >
                Simpan
              </button>
              <button
                className="ml-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                onClick={() => handleDelete(selectedProject.public_id)}
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <div className="w-full">
          <div className="flex flex-wrap gap-3 justify-center">
            {projects.map((p) => (
              <div
                key={p.public_id}
                className="flex-1 basis-72 max-w-full rounded-lg shadow-md bg-white dark:bg-gray-800 p-4"
              >
                <div className="mb-3">
                  <p className="text-lg font-semibold mb-0 mx-2">
                    {p.nama_ujian}
                  </p>
                  {p.mata_pelajaran ? (
                    <p className="text-lg font-semibold mb-0 mx-2">
                      {p.mata_pelajaran}
                    </p>
                  ) : (
                    <br className="text-lg font-semibold mb-0 mx-2" />
                  )}
                  {p.kelas ? (
                    <p className="text-lg font-semibold mb-0 mx-2">
                      {p.kelas}
                    </p>
                  ) : (
                    <br className="text-lg font-semibold mb-0 mx-2" />
                  )}
                  {p.semester ? (
                    <p className="text-lg font-semibold mb-0 mx-2">
                      {p.semester}
                    </p>
                  ) : (
                    <br className="text-lg font-semibold mb-0 mx-2" />
                  )}
                </div>
                <div className="flex flex-wrap gap-3 justify-between">
                  <button
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 min-w-[130px]"
                    onClick={() => handleOpenProject(p)}
                  >
                    Buka Project
                  </button>
                  <button
                    className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-600 min-w-[130px]"
                    onClick={() => handleOpenModal(p)}
                  >
                    Edit Project
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-4">
            <button
              onClick={handleAddProject}
              className="px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              + Tambah Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;
