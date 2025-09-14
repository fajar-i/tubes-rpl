"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Faq from "@/components/Faq";
import {
  ChartBarIcon,
  CursorArrowRaysIcon,
  DocumentMagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

export default function Home() {
  return (
    <main>
      <Navbar />
      {/* Hero Section */}
      <div className="container mx-auto w-[90%] max-w-[1200px] flex flex-wrap items-center justify-between pt-10">
        <div className="flex-1 min-w-[300px] pr-10">
          <h1 className="text-5xl mb-10 text-gray-900 font-medium">
            Evaluasi Pembelajaran dengan{" "}
            <span className="font-bold">Mudah, Cepat, </span>dan{" "}
            <span className="font-bold">Empiris</span>
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            Proses analisis empiris dari soal ujianmu secara instan! Pastikan
            soal yang kamu gunakan telah memenuhi standar evaluasi seperti
            Cronbach&apos;s Alpha, nilai korelasi, dan indikator lainnya.
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
              <h3 className="text-xl font-semibold mb-3">Analisis Empiris</h3>
              <p className="text-gray-600">
                Dapatkan analisis mendalam tentang kualitas soal ujian
                berdasarkan berbagai parameter standar.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-[#3cbdb8] rounded-lg flex items-center justify-center mb-4">
                <CursorArrowRaysIcon width={30} height={30} />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Dashboard Interaktif
              </h3>
              <p className="text-gray-600">
                Visualisasi data yang mudah dipahami melalui dashboard
                interaktif dengan grafik dan tabel.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-[#3cbdb8] rounded-lg flex items-center justify-center mb-4">
                <DocumentMagnifyingGlassIcon width={30} height={30} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Laporan Detail</h3>
              <p className="text-gray-600">
                Generate laporan lengkap yang mencakup semua aspek analisis
                untuk dokumentasi dan evaluasi.
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
