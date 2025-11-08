import React, { useEffect } from 'react';
import Link from "next/link";
import { ClockIcon } from "@heroicons/react/24/outline";
import { useProjects } from "@/context/ProjectContext";

const ProjectHistory = () => {
    const { projects = [], fetchProjects } = useProjects();

    useEffect(() => {
        if (fetchProjects) {
            fetchProjects();
        }
    }, [fetchProjects]);

    if (!projects || projects.length === 0) return null;

    return (
        <div className="mt-6">
            <ul className="space-y-2">
                {projects.map((project) => (
                    <li key={project.public_id}>
                        <Link
                            href={`/dashboard/project/${project.public_id}/form`}
                            className="flex items-center p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md group"
                        >
                            <ClockIcon className="h-6 w-6 mr-3 group-hover:text-[#00A1A9]" />
                            <span className="truncate group-hover:text-[#00A1A9]">{project.nama_ujian}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProjectHistory;
