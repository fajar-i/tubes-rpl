"use client";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import Faq from "@/components/Faq";
import {
  ChartBarIcon,
  CursorArrowRaysIcon,
  DocumentMagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { useEffect } from "react";
import { useMyAppHook } from "@/context/AppProvider";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { authToken, isLoading } = useMyAppHook();

  useEffect(() => {
    if (!isLoading && authToken) {
      router.replace("/dashboard");
    }
  }, [authToken, router, isLoading]);

  if (isLoading) {
    return null;
  }

  return (
    <main>
      <Navbar />
      {/* Hero Section */}
      <div className="container mx-auto w-[90%] max-w-[1200px] flex flex-wrap items-center justify-between pt-10">
        <div className="flex-1 min-w-[300px] pr-10">
          <h1 className="text-5xl mb-10 text-gray-900 font-medium">
            Analisis Butir Soal dengan{" "}
            <span className="font-bold">Tepat, Cepat, </span>dan{" "}
            <span className="font-bold">Akurat</span>
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            Platform analisis butir soal otomatis untuk meningkatkan kualitas evaluasi pembelajaran. 
            Dapatkan hasil analisis validitas, reliabilitas, tingkat kesukaran, dan daya pembeda soal 
            secara instan dengan metode yang terstandar.
          </p>
          <a
            href="/auth"
            className="inline-flex py-3.5 px-7 bg-[#2aa5a0] text-white no-underline rounded-lg font-semibold transition-all duration-300 hover:bg-[#238f8b] hover:scale-105"
          >
            Coba sekarang
          </a>
        </div>
        <div className="flex-1 min-w-[300px] flex justify-end">
          <Image
            src="/ilust-landing.svg"
            alt="Ilustrasi Analisis"
            width={600}
            height={400}
            className="max-w-full h-auto"
          />
        </div>
      </div>

      {/* Fitur Section */}
      <div className="bg-gray-50 py-20 mt-20" id="fitur">
        <div className="container mx-auto w-[90%] max-w-[1200px]">
          <h2 className="text-4xl font-bold text-center mb-12">
            Fitur Unggulan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-[#3cbdb8] rounded-lg flex items-center justify-center mb-4">
                <ChartBarIcon width={30} height={30} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Analisis Komprehensif</h3>
              <p className="text-gray-600">
                Analisis butir soal mencakup validitas, reliabilitas, tingkat kesukaran,
                dan daya pembeda dengan metode yang terstandar.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-[#3cbdb8] rounded-lg flex items-center justify-center mb-4">
                <CursorArrowRaysIcon width={30} height={30} />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Input Data Mudah
              </h3>
              <p className="text-gray-600">
                Input jawaban peserta yang mudah melalui spreadsheet interaktif 
                dengan validasi format otomatis.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-[#3cbdb8] rounded-lg flex items-center justify-center mb-4">
                <DocumentMagnifyingGlassIcon width={30} height={30} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Analisis AI</h3>
              <p className="text-gray-600">
                Validasi kualitas soal menggunakan AI untuk memastikan kejelasan perumusan
                dan kesesuaian dengan tujuan pembelajaran.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <Faq />

      {/* Footer */}
      <Footer />
    </main>
  );
}
