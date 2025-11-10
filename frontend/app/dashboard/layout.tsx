"use client";

import React from "react";
import { useMyAppHook } from "@/context/AppProvider";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { ProjectProvider } from "@/context/ProjectContext";
import useTitle from "@/hooks/useTitle";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  useTitle('Analis - Dashboard', 'Dashboard analis');
  const { user } = useMyAppHook();

  return (
    <ProjectProvider>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 lg:ml-64"> {/* Add margin to match sidebar width */}
          <div className="flex flex-col h-full">
            <Header userEmail={user?.email || "user@example.com"} userRole={user?.role || "Guru"} />
            <main className="flex-1 p-6">
              {children}
            </main>
          </div>
        </div>
      </div>
    </ProjectProvider>
  );
};

export default DashboardLayout;
