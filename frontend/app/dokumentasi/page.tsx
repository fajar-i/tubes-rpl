import Navbar from "@/components/layout/Navbar";

export const metadata = {
  title: 'Analis - Dokumentasi',
};

export default function Dokumentasi() {
    return (
        <main>
            <Navbar />
            <div className="container mx-auto w-[90%] max-w-[1200px] flex flex-col lg:flex-row gap-10 mt-10">
                <aside className="lg:w-1/5 border-r border-gray-200 pr-5 lg:sticky lg:top-5 lg:h-screen">
                    <h2 className="mb-5 text-xl font-semibold text-[#004b63]">Daftar Isi</h2>
                    <ul className="list-none p-0">
                        <li className="mb-4">
                            <a href="#panduan" className="text-[#2aa5a0] font-medium hover:underline">Panduan Penggunaan</a>
                        </li>
                        <li className="mb-4">
                            <a href="#faq" className="text-[#2aa5a0] font-medium hover:underline">FAQ</a>
                        </li>
                    </ul>
                </aside>
                <div className="flex-1">
                    <section id="panduan" className="mb-16">
                        <h3 className="text-[#004b63] mb-4 text-2xl font-semibold">Panduan Penggunaan</h3>
                        <p className="mb-3 text-justify">1. <strong>Membuat Akun dan Login:</strong></p>
                        <ul className="list-disc pl-5 mb-6">
                            <li className="mb-2">Klik tombol <span className="text-[#00A19A]">Daftar</span> untuk membuat akun baru.</li>
                            <li className="mb-2">Masukkan nama, email, dan password.</li>
                            <li className="mb-2">Login menggunakan email dan password.</li>
                        </ul>
                        
                        <p className="mb-3 text-justify">2. <strong>Membuat Proyek Analisis:</strong></p>
                        <ul className="list-disc pl-5 mb-6">
                            <li className="mb-2">Buka menu <span className="text-[#00A19A]">Proyek Saya</span>.</li>
                            <li className="mb-2">Klik <span className="text-[#00A19A]">Buat Proyek</span> dan isi informasi:</li>
                            <ul className="list-decimal pl-5 mt-2">
                                <li className="mb-1 hover:underline hover:text-gray-700 transition-all">Nama Ujian</li>
                                <li className="mb-1 hover:underline hover:text-gray-700 transition-all">Mata Pelajaran</li>
                                <li className="mb-1 hover:underline hover:text-gray-700 transition-all">Kelas</li>
                                <li className="mb-1 hover:underline hover:text-gray-700 transition-all">Semester</li>
                                <li className="mb-1 hover:underline hover:text-gray-700 transition-all">Capaian Pembelajaran</li>
                                <li className="mb-1 hover:underline hover:text-gray-700 transition-all">Indikator Ketercapaian Pembelajaran</li>
                            </ul>
                        </ul>

                        <p className="mb-3 text-justify">3. <strong>Input Soal dan Kunci Jawaban:</strong></p>
                        <ul className="list-disc pl-5 mb-6">
                            <li className="mb-2">Buka tab <span className="text-[#00A19A]">Form Soal</span>.</li>
                            <li className="mb-2">Masukkan teks soal dan opsi jawaban.</li>
                            <li className="mb-2">Tandai kunci jawaban yang benar.</li>
                            <li className="mb-2">Simpan setiap soal yang ditambahkan.</li>
                            <li className="mb-2">Lanjut ke tab <span className="text-[#00A19A]">Analisis AI</span> untuk validasi kualitatif soal.</li>
                        </ul>

                        <p className="mb-3 text-justify">4. <strong>Input Jawaban Peserta:</strong></p>
                        <ul className="list-disc pl-5 mb-6">
                            <li className="mb-2">Buka tab <span className="text-[#00A19A]">Jawaban</span>.</li>
                            <li className="mb-2">Gunakan spreadsheet untuk input jawaban.</li>
                            <li className="mb-2">Gunakan huruf kapital (A, B, C, D, E).</li>
                            <li className="mb-2">Klik <span className="text-[#00A19A]">Simpan</span> setelah selesai.</li>
                        </ul>

                        <p className="mb-3 text-justify">5. <strong>Analisis Hasil:</strong></p>
                        <ul className="list-disc pl-5 mb-6">
                            <li className="mb-2">Buka tab <span className="text-[#00A19A]">Hasil</span> untuk melihat:</li>
                            <ul className="list-decimal pl-5 mt-2">
                                <li className="mb-1 hover:underline hover:text-gray-700 transition-all">Validitas soal</li>
                                <li className="mb-1 hover:underline hover:text-gray-700 transition-all">Reliabilitas tes</li>
                                <li className="mb-1 hover:underline hover:text-gray-700 transition-all">Tingkat kesukaran</li>
                                <li className="mb-1 hover:underline hover:text-gray-700 transition-all">Daya pembeda</li>
                            </ul>
                        </ul>
                    </section>

                    <section id="faq" className="mb-16">
                        <h3 className="text-[#004b63] mb-4 text-2xl font-semibold">FAQ</h3>
                        <div className="space-y-6">
                            <div>
                                <p className="font-semibold mb-2">Q: Bagaimana cara menginterpretasi hasil analisis butir soal?</p>
                                <p className="text-gray-950">A: Hasil analisis dapat diinterpretasikan sebagai berikut:</p>
                                <ul className="list-disc pl-5 mt-2 text-gray-950">
                                    <li className="mb-1"><strong>Validitas:</strong> Nilai {'>'}0.3 menunjukkan soal valid, semakin mendekati 1 semakin baik.</li>
                                    <li className="mb-1"><strong>Reliabilitas:</strong> Nilai {'>'}0.7 menunjukkan tes reliabel.</li>
                                    <li className="mb-1"><strong>Tingkat Kesukaran:</strong> 0.3-0.7 adalah rentang ideal.</li>
                                    <li className="mb-1"><strong>Daya Pembeda:</strong> {'>'}0.3 menunjukkan soal dapat membedakan kemampuan siswa dengan baik.</li>
                                </ul>
                            </div>

                            <div>
                                <p className="font-semibold mb-2">Q: Apa yang harus dilakukan jika hasil validitas/reliabilitas menunjukkan {"Tidak dapat dihitung"}?</p>
                                <p className="text-gray-950">A: Ini biasanya terjadi karena kurangnya variasi dalam data. Pastikan:</p>
                                <ul className="list-disc pl-5 mt-2 text-gray-950">
                                    <li className="mb-1">Ada minimal 2 soal untuk menghitung reliabilitas</li>
                                    <li className="mb-1">Ada variasi jawaban (tidak semua benar/salah)</li>
                                    <li className="mb-1">Ada variasi skor total antar peserta</li>
                                </ul>
                            </div>

                            <div>
                                <p className="font-semibold mb-2">Q: Bagaimana cara mengelola jawaban peserta dalam spreadsheet?</p>
                                <p className="text-gray-950">A: Beberapa tips penting:</p>
                                <ul className="list-disc pl-5 mt-2 text-gray-950">
                                    <li className="mb-1">Gunakan huruf kapital (A, B, C, D, E)</li>
                                    <li className="mb-1">Kosongkan sel untuk jawaban yang tidak diisi</li>
                                    <li className="mb-1">Hapus baris dengan mengosongkan seluruh sel</li>
                                    <li className="mb-1">Klik {"Simpan"} setelah melakukan perubahan</li>
                                </ul>
                            </div>

                            <div>
                                <p className="font-semibold mb-2">Q: Apakah hasil analisis bisa diunduh atau dicetak?</p>
                                <p className="text-gray-950">A: Ya, Anda dapat mengunduh hasil analisis dalam format PDF yang mencakup semua metrik dan visualisasi data. Laporan ini bisa digunakan untuk dokumentasi atau evaluasi lebih lanjut.</p>
                            </div>

                            <div>
                                <p className="font-semibold mb-2">Q: Apa manfaat dari fitur Analisis AI?</p>
                                <p className="text-gray-950">A: Analisis AI membantu dalam:</p>
                                <ul className="list-disc pl-5 mt-2 text-gray-950">
                                    <li className="mb-1">Mengevaluasi kejelasan bahasa soal</li>
                                    <li className="mb-1">Memastikan kesesuaian dengan indikator pembelajaran</li>
                                    <li className="mb-1">Mengidentifikasi potensi bias dalam soal</li>
                                    <li className="mb-1">Memberikan saran perbaikan untuk meningkatkan kualitas soal</li>
                                </ul>
                            </div>

                            <div>
                                <p className="font-semibold mb-2">Q: Berapa jumlah minimal peserta untuk mendapatkan analisis yang akurat?</p>
                                <p className="text-gray-950">A: Untuk hasil yang optimal, disarankan memiliki minimal 30 peserta. Namun, analisis tetap bisa dilakukan dengan jumlah peserta yang lebih sedikit, meskipun hasilnya mungkin kurang representatif.</p>
                            </div>

                            <div>
                                <p className="font-semibold mb-2">Q: Bagaimana cara melihat perkembangan kualitas soal dari waktu ke waktu?</p>
                                <p className="text-gray-950">A: Anda dapat membandingkan hasil analisis dari berbagai project yang telah dibuat. Semua project tersimpan dalam akun Anda dan dapat diakses kembali untuk melihat perbandingan dan tren perkembangan kualitas soal.</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}
