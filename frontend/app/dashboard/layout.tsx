"use client";

import React, { useEffect } from "react";
import { useMyAppHook } from "@/context/AppProvider";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

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
    <div className="flex">
      <Sidebar />
      <div className="flex-1"> {/* Adjust margin-left to match sidebar width */}
        <Header userEmail={user?.email || "user@example.com"} userRole={user?.role || "Guru"} /> {/* Pass user data */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
