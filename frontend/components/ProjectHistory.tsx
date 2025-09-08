import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ClockIcon } from "@heroicons/react/24/outline";
import { Project } from "@/types";
import { AxiosInstance } from "@/lib/axios";
import { useMyAppHook } from "@/context/AppProvider";

const ProjectHistory = () => {
    const [recentProjects, setRecentProjects] = useState<Project[]>([]);
    const { authToken } = useMyAppHook();

    useEffect(() => {
        const fetchRecentProjects = async () => {
            try {
                const response = await AxiosInstance.get(`/projects`, {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                });
                setRecentProjects(response.data.projects);
            } catch (error) {
                console.error("Failed to fetch recent projects:", error);
            }
        };

        if (authToken) {
            fetchRecentProjects();
        }
    }, [authToken]);

    if (recentProjects.length === 0) return null;

    return (
        <div className="mt-6">
            <ul className="space-y-2">
                {recentProjects.map((project) => (
                    <li key={project.public_id}>
                        <Link
                            href={`/dashboard/project/${project.public_id}/form`}
                            className="flex items-center p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md group"
                        >
                            <ClockIcon className="h-6 w-6 mr-3 text-gray-400 group-hover:text-[#00A1A9]" />
                            <span className="truncate">{project.nama_ujian}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProjectHistory;
