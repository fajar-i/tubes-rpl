"use client";

import React, { useState } from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, DocumentTextIcon, ArrowLeftStartOnRectangleIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { useMyAppHook } from "@/context/AppProvider"; // Import useMyAppHook

const Sidebar = () => {
  const pathname = usePathname();
  const { logout } = useMyAppHook(); // Use logout from context
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
    { name: "Proyek", href: "/dashboard/project", icon: DocumentTextIcon },
  ];

  return (
    <>
      {/* Hamburger menu for small screens */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button onClick={toggleSidebar} className="p-2 text-gray-700 bg-white rounded-md shadow-md">
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>

      {/* Overlay for small screens when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-40 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 p-6 flex flex-col z-50
          transform ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 transition-transform duration-300 ease-in-out lg:static lg:shadow-none`}
      >
        {/* Logo */}
        <div className="mb-10">
          <Link href="/" className="text-2xl font-istok">
            <span className="text-[#00A1A9] font-semibold">Analis</span>
          </Link>
        </div>

      {/* Navigation Links */}
      <nav className="flex-grow">
        <ul className="space-y-4">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className={`flex items-center p-2 rounded-md text-base font-medium ${
                    isActive ? "bg-[#E0F7FA] text-[#00A1A9]" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Link */}
      <div className="mt-auto">
        <button
          onClick={logout} // Call logout function
          className="flex items-center p-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 w-full cursor-pointer"
        >
          <ArrowLeftStartOnRectangleIcon className="h-5 w-5 mr-3" />
          Logout
        </button>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
