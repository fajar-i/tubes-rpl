"use client";

import React, { useEffect } from "react";
import { useMyAppHook } from "@/context/AppProvider";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { ProjectProvider } from "@/context/ProjectContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const router = useRouter();
  const { authToken, user } = useMyAppHook();

  useEffect(() => {
    if (!authToken) {
      router.push("/auth");
    }
  }, [authToken, router]);

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
