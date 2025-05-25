'use client';

import Loader from "@/components/Loader";
import React, { useEffect, useState } from 'react';
import { myAppHook } from "@/context/AppProvider";
import { useRouter } from "next/navigation";
import axios from 'axios';
import toast from 'react-hot-toast';
import Swal from "sweetalert2";
type Project = {
  nama_ujian: string,
  mata_pelajaran?: string,
  kelas?: string,
  semester?: string,
  public_id: string,
};

export default function EditorPage() {
  const router = useRouter();
  const { authToken } = myAppHook();
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
      console.log(projects)
    });

  }, [authToken])

  const fetchAllProjects = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      })
      setProjects(response.data.projects)
      console.log(response.data.projects)

    } catch (error) {
      console.log("fetch all projects error : " + error);
    }
  }

  const handleAddProject = async () => {
    const newProject: Project = {
      "public_id": "1234567",
      "nama_ujian": "Ujian baru",
      "mata_pelajaran": "Mata pelajaran ujian",
      "kelas": "Kelas saya",
      "semester": "Semester Ganjil/Genap",
    };

    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/projects/`, newProject, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${authToken}`
      }
    });
    setProjects((prev) => [...prev, response.data.project]);

    toast.success(response.data.message);
  };

  const handleOpenProject = (p: Project) => {
    router.push(`/project/${p.public_id}/form`);
  }

  const handleOpenModal = async (p: Project) => {
    setSelectedProject(undefined);
    setSelectedProject(p);
    setShowModal(true);
  }

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProject(undefined);
  };

  const handleSaveProject = async (p: Project) => {
    const item = JSON.stringify(p);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${p.public_id}`, {
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
      toast.success("Soal tersimpan");

      setProjects((prev) =>
        prev.map((thisP) => (thisP.public_id === p.public_id ? p : thisP))
      );
    } catch (e) {
      toast.error("Gagal menyimpan soal");
      console.error(e);
      fetchAllProjects();
    }
    console.log({ project: item });
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
          const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`, {
            headers: {
              Authorization: `Bearer ${authToken}`
            }
          })
          handleCloseModal();
          if (response.data.status) {
            toast.success(response.data.message)
            fetchAllProjects();
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
        {
          selectedProject && (
            <div
              className={`modal fade ${showModal ? "show d-block" : ""}`}
              tabIndex={-1}
              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            >
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Edit Project</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={handleCloseModal}
                    ></button>
                  </div>
                  <div className="modal-body d-flex flex-wrap gap-3 justify-content-center">
                    <input
                      type="text"
                      className={`form-control ${selectedProject.nama_ujian ? '' : 'is-invalid'}`}
                      defaultValue={selectedProject.nama_ujian}
                      placeholder="Nama ujian harus diisi"
                      onChange={(e) =>
                        setSelectedProject({ ...selectedProject, nama_ujian: e.target.value })
                      }
                      required
                    />
                    <input
                      type="text"
                      className="form-control"
                      defaultValue={selectedProject.mata_pelajaran}
                      placeholder="Mata pelajaran"
                      onChange={(e) =>
                        setSelectedProject({ ...selectedProject, mata_pelajaran: e.target.value })
                      }
                    />
                    <input
                      type="text"
                      className="form-control"
                      defaultValue={selectedProject.kelas}
                      placeholder="Kelas"
                      onChange={(e) =>
                        setSelectedProject({ ...selectedProject, kelas: e.target.value })
                      }
                    />
                    <input
                      type="text"
                      className="form-control"
                      defaultValue={selectedProject.semester}
                      placeholder="Semester"
                      onChange={(e) =>
                        setSelectedProject({ ...selectedProject, semester: e.target.value })
                      }
                    />
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={handleCloseModal}>
                      Batal
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={selectedProject.nama_ujian ? (() => handleSaveProject(selectedProject)) : undefined}
                    >
                      Simpan
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(selectedProject.public_id)}
                    >
                      Delete Project
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        }
        <div className="row justify-content-center">
          <div className="col-12">
            {/* Wrapper flexbox untuk semua card */}
            <div className="d-flex flex-wrap gap-3 justify-content-center">
              {projects.map((p) => (
                <div
                  key={p.public_id}
                  className="card"
                  style={{
                    flex: "1 1 300px", // grow, shrink, basis
                    maxWidth: "100%",  // agar tidak overflow
                  }}
                >
                  <div className="card-body">
                    <div className="mb-3">
                      <p className="h5 mb-0 m-2">{p.nama_ujian}</p>
                      {p.mata_pelajaran ? (
                        <p className="h5 mb-0 m-2">{p.mata_pelajaran}</p>
                      ) : <br className="h5 mb-0 m-2" />}
                      {p.kelas ? (
                        <p className="h5 mb-0 m-2">{p.kelas}</p>
                      ) : <br className="h5 mb-0 m-2" />}
                      {p.semester ? (
                        <p className="h5 mb-0 m-2">{p.semester}</p>
                      ) : <br className="h5 mb-0 m-2" />}
                    </div>
                    <div className="d-flex flex-wrap gap-3 justify-content-between">
                      <button
                        className="btn btn-primary gap-3 "
                        style={{ minWidth: "130px" }}
                        onClick={() => handleOpenProject(p)}
                      >
                        Buka Project
                      </button>
                      <button
                        className="btn btn-warning gap-3"
                        style={{ minWidth: "130px" }}
                        onClick={() => handleOpenModal(p)}
                      >
                        Edit Project
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-4">
              <button onClick={handleAddProject} className="btn btn-primary">
                + Tambah Project
              </button>
            </div>
          </div>
        </div>

      </div>


    );


  }
}
