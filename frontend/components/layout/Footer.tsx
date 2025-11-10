import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white text-white py-12 border-t border-gray-300">
      <div className="container mx-auto w-[90%] max-w-[1200px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="text-2xl font-istok mr-8">
              <span className="text-[#00A1A9] font-semibold">Analis</span>
            </Link>
            <p className="text-gray-400">
              Platform analisis empiris soal untuk meningkatkan kualitas
              evaluasi pembelajaran.
            </p>
          </div>
          <div>
            <h3 className="text-xl text-black font-bold mb-4">Tautan</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/auth"
                  className="text-gray-400 hover:text-[#00A19A] transition-colors"
                >
                  Masuk
                </a>
              </li>
              <li>
                <a
                  href="/dokumentasi"
                  className="text-gray-400 hover:text-[#00A19A] transition-colors"
                >
                  Dokumentasi
                </a>
              </li>
              <li>
                <Link
                  href="/#faq"
                  className="text-gray-400 hover:text-[#00A19A] transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl text-black font-bold mb-4">Kontak</h3>
            <p className="text-gray-400">Email: support@analisissoal.com</p>
            <p className="text-gray-400">Telp: (021) 1234-5678</p>
          </div>
        </div>
        <div className="mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Analis. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
