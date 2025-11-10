import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link'
 
export const metadata: Metadata = {
  title: "404 - Halaman Tidak Ditemukan",
  description: "Tidak ada halaman yang dituju",
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Image src={"/not-found.svg"} alt='not found ilustration' width={350} height={350}/>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">404 - Halaman Tidak Ditemukan</h1>
      <p className="text-lg text-gray-600 mb-8 text-center">
        Halaman yang kamu cari mungkin tidak ada atau berganti nama.
      </p>
      <Link href="/" className="px-6 py-3 bg-[#00A19A] text-white rounded-md hover:bg-[#00948d] transition duration-300">
        Kembali ke Home
      </Link>
    </div>
  )
}