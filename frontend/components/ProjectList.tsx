"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useProjects } from "@/context/ProjectContext";

const ProjectList: React.FC = () => {
  const router = useRouter();
  const { projects = [], fetchProjects } = useProjects();

  useEffect(() => {
    if (fetchProjects) {
      fetchProjects();
    }
  }, [router, fetchProjects]);

  return (
    <>
      {!projects || projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[200px] rounded-lg p-8">
          <h3 className="text-lg text-gray-600 mb-4">
            Belum ada Proyek yang dibuat
          </h3>
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
