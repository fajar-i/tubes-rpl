import React, { createContext, useContext, useState, useCallback } from 'react';
import { Project } from '@/types';
import { AxiosInstance } from '@/lib/axios';
import { useMyAppHook } from './AppProvider';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  fetchProjects: () => Promise<void>;
  addProject: (project: Project) => Promise<boolean>;
  updateProject: (project: Project) => Promise<boolean>;
  deleteProject: (id: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const { authToken } = useMyAppHook();

  const fetchProjects = useCallback(async () => {
    if (!authToken) return;
    
    setLoading(true);
    try {
      const response = await AxiosInstance.get('/projects', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setProjects(response.data.projects);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  const addProject = async (project: Project): Promise<boolean> => {
    try {
      const response = await AxiosInstance.post('/projects/', project, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (response.data.status) {
        setProjects(prev => [...prev, response.data.project]);
        toast.success("Berhasil menambahkan proyek!");
        return true;
      }
      return false;
    } catch (error) {
      console.error('Add project error:', error);
      toast.error("Gagal tambah proyek")
      throw error;
    }
  };

  const updateProject = async (project: Project): Promise<boolean> => {
    try {
      const response = await AxiosInstance.post(
        `/projects/${project.public_id}`,
        {
          nama_ujian: project.nama_ujian,
          mata_pelajaran: project.mata_pelajaran,
          kelas: project.kelas,
          semester: project.semester,
          tujuan_pembelajaran: project.tujuan_pembelajaran,
          indikator_ketercapaian_pembelajaran: project.indikator_ketercapaian_pembelajaran,
          _method: 'PUT',
        },
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      if (response.data.status) {
        setProjects(prev =>
          prev.map(p => (p.public_id === project.public_id ? project : p))
        );
        toast.success("Proyek berhasil diupdate!");
        return true;
      }
      return false;
    } catch (error) {
      console.error('Update project error:', error);
      toast.error("Gagal update proyek");
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus Proyek?',
      text: "Anda tidak dapat mengembalikan proyek yang telah dihapus!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const response = await AxiosInstance.delete(`/projects/${id}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        if (response.data.status) {
          setProjects(prev => prev.filter(p => p.public_id !== id));
          Swal.fire(
            'Terhapus!',
            'Proyek telah dihapus.',
            'success'
          );
        }
      } catch (error) {
        console.error('Delete project error:', error);
        Swal.fire(
          'Error!',
          'Gagal menghapus proyek.',
          'error'
        );
        throw error;
      }
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        loading,
        fetchProjects,
        addProject,
        updateProject,
        deleteProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};