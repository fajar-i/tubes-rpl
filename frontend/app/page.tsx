"use client"
import Navbar from "@/components/Navbar";
import Image from "next/image";
export default function Home() {
    return <>
        <main>
            <Navbar />
            <div className="container mx-auto w-[90%] max-w-[1200px] flex flex-wrap items-center justify-between pt-10">
                <div className="flex-1 min-w-[300px] pr-10">
                    <h1 className="text-5xl mb-10 text-gray-900 font-medium">Evaluasi Pembelajaran dengan <span className="font-bold">Mudah, Cepat, </span>dan <span className="font-bold">Empiris</span></h1>
                    <p className="text-lg text-gray-700 mb-8">
                        Proses analisis empiris dari soal ujianmu secara instan! Pastikan soal yang kamu gunakan telah memenuhi standar evaluasi seperti Cronbach&apos;s Alpha, nilai korelasi, dan indikator lainnya.
                    </p>
                    <a href="/auth" className="inline-flex py-3.5 px-7 bg-[#2aa5a0] text-white no-underline rounded-lg font-semibold transition-all duration-300 hover:bg-[#238f8b] hover:scale-105">Coba sekarang</a>
                </div>
                <div className="flex-1 min-w-[300px] flex justify-end">
                    <Image src="/ilust-landing.svg" alt="Ilustrasi Analisis" width={600} height={400} className="max-w-full h-auto" />
                </div>
            </div>
        </main>
    </>
}
