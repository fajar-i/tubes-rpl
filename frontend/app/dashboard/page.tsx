"use client";
import React from "react";
import Link from "next/link";
import ProjectListDashboard from "@/components/ProjectList"; // Import ProjectListDashboard

const Dashboard: React.FC = () => {
  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-6">Manage aktivitas kamu.</p>

      {/* "Buat Project Evaluasi Baru" Card */}
      <div className="bg-[#20B2AA] text-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center h-48 mb-8 cursor-pointer hover:bg-[#1a9a93] transition-colors duration-300">
        <Link
          href={"/dashboard/project"}
          className="flex flex-col items-center justify-center h-full w-full"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-12 h-12 mb-2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          <span className="text-xl font-semibold">
            Buat project evaluasi baru
          </span>
        </Link>
      </div>

      {/* "Proyek Saya" Section */}
      <h2 className="text-2xl font-bold mb-4">Proyek Saya</h2>
      <ProjectListDashboard />
    </main>
  );
};

export default Dashboard;
