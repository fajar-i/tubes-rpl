"use client";
import React from "react";
import Link from "next/link";
import ProjectListDashboard from "@/components/ProjectList"; // Import ProjectListDashboard
import { PlusIcon } from "@heroicons/react/24/outline";

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
          <PlusIcon width={60} height={60}/>
          <span className="text-xl font-semibold">
            Buat proyek evaluasi baru
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
