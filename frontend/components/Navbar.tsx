"use client"
import Link from "next/link"
import { useState } from "react"

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="bg-white py-4 border-b border-gray-200">
      <div className="container mx-auto w-[90%] max-w-[1200px] flex justify-between items-center relative">
        {/* Logo and Desktop Nav Links */}
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-istok mr-8">
            <span className="text-[#00A1A9] font-semibold">Analis</span>
          </Link>
          <ul className="hidden lg:flex lg:items-center space-x-8 text-black text-base">
            <li>
              <Link href="#fitur" className="hover:text-gray-600">
                Fitur
              </Link>
            </li>
            <li>
              <Link href="/dokumentasi" className="hover:text-gray-600">
                Dokumentasi
              </Link>
            </li>
            <li>
              <Link href="#faq" className="hover:text-gray-600">
                FAQ
              </Link>
            </li>
          </ul>
        </div>

        {/* Mobile button */}
        <button className="lg:hidden focus:outline-none" onClick={toggleMenu}>
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={
                isMenuOpen
                  ? "M6 18L18 6M6 6l12 12"
                  : "M4 6h16M4 12h16M4 18h16"
              }
            ></path>
          </svg>
        </button>

        {/* Mobile Menu */}
        <div
          className={`${isMenuOpen ? "block" : "hidden"} lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 py-4`}
        >
          <ul className="flex flex-col items-center space-y-4 text-black text-base mb-4">
            <li>
              <Link href="/fitur" className="block w-full text-center py-2 hover:text-gray-600">
                Fitur
              </Link>
            </li>
            <li>
              <Link href="/dokumentasi" className="block w-full text-center py-2 hover:text-gray-600">
                Dokumentasi
              </Link>
            </li>
            <li>
              <Link href="/faq" className="block w-full text-center py-2 hover:text-gray-600">
                FAQ
              </Link>
            </li>
          </ul>
          <div className="flex flex-col items-center space-y-4">
            <Link href="/auth" className="block w-full text-center py-2 hover:text-gray-600">
              Log in
            </Link>
            <Link
              href="/register"
              className="block w-full text-center border border-black px-4 py-2 rounded-md hover:bg-black hover:text-white transition-colors"
            >
              Daftar
            </Link>
          </div>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden lg:flex items-center space-x-4">
          <Link href="/auth" className="hover:text-gray-600">
            Log in
          </Link>
          <Link
            href="/register"
            className="border border-black px-4 py-2 rounded-md hover:bg-black hover:text-white transition-colors"
          >
            Daftar
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
