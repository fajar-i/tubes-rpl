"use client";

import React, { useEffect, useState } from "react";
import { useMyAppHook } from "@/context/AppProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import Loader from "./ui/Loader";
import { Project } from "@/types";
import { AxiosInstance } from "@/lib/axios";

const ProjectList: React.FC = () => {
  const router = useRouter();
  const { authToken } = useMyAppHook();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
 
  useEffect(() => {
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

    setLoading(true);
    if (!authToken) {
      router.push("/auth");
      return;
    }
    
    fetchAllProjects().finally(() => {
      setLoading(false);
    });
  }, [authToken, router]);

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[200px] bg-gray-50 rounded-lg p-8">
          <h3 className="text-xl text-gray-600 mb-4">Belum ada Proyek yang dibuat</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div
              key={p.public_id}
              className="bg-[#20B2AA] text-white p-6 rounded-lg shadow-md"
            >
              <h3 className="text-xl font-semibold mb-2">{p.nama_ujian}</h3>
              <p className="text-sm mb-4">{p.semester}</p>
              <Link
                href={`/dashboard/project/${p.public_id}/form`}
                className="bg-white text-[#20B2AA] px-4 py-2 rounded-md hover:bg-gray-100 transition-colors duration-300"
              >
                Buka
              </Link>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default ProjectList;
