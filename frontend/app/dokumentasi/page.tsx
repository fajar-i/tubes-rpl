import Navbar from "@/components/layout/Navbar";

export const metadata = {
  title: 'Analis - Dokumentasi',
};

export default function Dokumentasi() {
    return (
        <main>
            <Navbar />
            <div className="container mx-auto w-[90%] max-w-[1200px] flex flex-col lg:flex-row gap-10 mt-10">
                <aside className="lg:w-1/4 border-r border-gray-200 pr-5">
                    <h2 className="mb-5 text-xl font-semibold text-[#004b63]">Help Sources</h2>
                    <ul className="list-none p-0">
                        <li className="mb-4">
                            <a href="#install" className="text-[#2aa5a0] font-medium hover:underline">Cara Penginstalan</a>
                        </li>
                        <li className="mb-4">
                            <a href="#panduan" className="text-[#2aa5a0] font-medium hover:underline">Panduan Pemakaian</a>
                        </li>
                        <li className="mb-4">
                            <a href="#faq" className="text-[#2aa5a0] font-medium hover:underline">Bantuan / FAQ</a>
                        </li>
                    </ul>
                </aside>
                <div className="flex-1">
                    <section id="install" className="mb-16">
                        <h3 className="text-[#004b63] mb-4 text-2xl font-semibold">Cara Penginstalan</h3>
                        <p className="mb-3 text-justify">Untuk menginstal aplikasi Analis, ikuti langkah-langkah berikut:</p>

                        <h4 className="text-[#004b63] mb-3 text-xl font-semibold">Persyaratan Sistem</h4>
                        <p className="mb-3 text-justify">Pastikan Anda memiliki perangkat lunak berikut terinstal di komputer Anda:</p>
                        <ul className="list-disc pl-5 mb-6">
                            <li className="mb-2"><strong>Node.js dan npm:</strong> Versi terbaru stabil (disarankan Node.js v18.x atau lebih baru, npm v9.x atau lebih baru).</li>
                            <li className="mb-2"><strong>PHP:</strong> Versi 8.1 atau lebih baru.</li>
                            <li className="mb-2"><strong>Composer:</strong> Manajer dependensi PHP.</li>
                            <li className="mb-2"><strong>MySQL/MariaDB:</strong> Sistem manajemen database.</li>
                            <li className="mb-2"><strong>Git:</strong> Untuk mengunduh source code.</li>
                            <li className="mb-2"><strong>Web Server Lokal:</strong>
                                <ul className="list-circle pl-5 mt-2">
                                    <li className="mb-1"><strong>XAMPP/Laragon/WAMP</strong> (untuk Windows)</li>
                                    <li className="mb-1"><strong>MAMP</strong> (untuk macOS)</li>
                                    <li className="mb-1">Atau konfigurasi server mandiri (Apache/Nginx dengan PHP-FPM)</li>
                                </ul>
                            </li>
                        </ul>

                        <h4 className="text-[#004b63] mb-3 text-xl font-semibold">Langkah-langkah Instalasi Backend (Laravel)</h4>
                        <p className="mb-3 text-justify">1. <strong>Unduh Source Code Backend:</strong></p>
                        <ul className="list-disc pl-5 mb-6">
                            <li className="mb-2">Buka terminal atau Command Prompt Anda.</li>
                            <li className="mb-2">Navigasi ke direktori tempat Anda ingin menyimpan proyek.</li>
                            <li className="mb-2">Unduh source code backend : <a href="https://github.com/fajar-i/tubes-rpl" className="text-[#2aa5a0] hover:underline">https://github.com/fajar-i/tubes-rpl</a>
                                <pre className="bg-gray-100 p-3 rounded-md mt-2 overflow-x-auto"><code>git clone https://github.com/fajar-i/tubes-rpl.git <br />cd ./backend </code></pre>
                            </li>
                        </ul>
                        <p className="mb-3 text-justify">2. <strong>Instal Dependensi PHP:</strong></p>
                        <ul className="list-disc pl-5 mb-6">
                            <li className="mb-2">Setelah masuk ke direktori <code>backend</code>, jalankan perintah berikut untuk menginstal semua library PHP yang dibutuhkan oleh Laravel:
                                <pre className="bg-gray-100 p-3 rounded-md mt-2 overflow-x-auto"><code>composer install</code></pre>
                            </li>
                        </ul>
                        <p className="mb-3 text-justify">3. <strong>Konfigurasi Environment (.env):</strong></p>
                        <ul className="list-disc pl-5 mb-6">
                            <li className="mb-2">Salin file <code>.env.example</code> menjadi <code>.env</code>:
                                <pre className="bg-gray-100 p-3 rounded-md mt-2 overflow-x-auto"><code>cp .env.example .env</code></pre>
                            </li>
                            <li className="mb-2">Buka file <code>.env</code> yang baru dibuat di editor teks Anda.</li>
                            <li className="mb-2">Atur <strong>kunci aplikasi (App Key)</strong>:
                                <pre className="bg-gray-100 p-3 rounded-md mt-2 overflow-x-auto"><code>php artisan key:generate</code></pre>
                            </li>
                            <li className="mb-2">Konfigurasi <strong>koneksi database</strong> (ganti nama database, username, dan password sesuai dengan konfigurasi Anda):
                                <pre className="bg-gray-100 p-3 rounded-md mt-2 overflow-x-auto"><code>DB_CONNECTION=mysql
                                    DB_HOST=127.0.0.1
                                    DB_PORT=3306
                                    DB_DATABASE=nama_database_anda
                                    DB_USERNAME=root
                                    DB_PASSWORD=</code></pre>
                            </li>
                            <li className="mb-2">Pastikan untuk membuat database dengan nama yang sama di MySQL/MariaDB Anda.</li>
                        </ul>
                        <p className="mb-3 text-justify">4. <strong>Jalankan Migrasi Database dan Seeder (Opsional):</strong></p>
                        <ul className="list-disc pl-5 mb-6">
                            <li className="mb-2">Jalankan migrasi untuk membuat tabel-tabel di database Anda:
                                <pre className="bg-gray-100 p-3 rounded-md mt-2 overflow-x-auto"><code>php artisan migrate</code></pre>
                            </li>
                            <li className="mb-2">Jika ada data awal atau dummy yang perlu diisi, jalankan seeder (jika tersedia):
                                <pre className="bg-gray-100 p-3 rounded-md mt-2 overflow-x-auto"><code>php artisan db:seed</code></pre>
                            </li>
                        </ul>
                        <p className="mb-3 text-justify">5. <strong>Jalankan Server Backend (API):</strong></p>
                        <ul className="list-disc pl-5 mb-6">
                            <li className="mb-2">Untuk menjalankan server lokal Laravel, gunakan perintah:
                                <pre className="bg-gray-100 p-3 rounded-md mt-2 overflow-x-auto"><code>php artisan serve</code></pre>
                            </li>
                            <li className="mb-2">API Anda akan berjalan di <code>http://127.0.0.1:8000</code> (atau port lain jika sudah dipakai). Catat URL ini, Anda akan membutuhkannya untuk konfigurasi frontend.</li>
                        </ul>

                        <h4 className="text-[#004b63] mb-3 text-xl font-semibold">Langkah-langkah Instalasi Frontend (Next.js)</h4>
                        <p className="mb-3 text-justify">1. <strong>Unduh Source Code Frontend:</strong></p>
                        <ul className="list-disc pl-5 mb-6">
                            <li className="mb-2">Buka terminal atau Command Prompt baru.</li>
                            <li className="mb-2">dengan kloning backend, anda juga langsung mengkloning frontend. cukup jalankan:
                                <pre className="bg-gray-100 p-3 rounded-md mt-2 overflow-x-auto"><code>
                                    cd ./frontend</code></pre>
                            </li>
                        </ul>
                        <p className="mb-3 text-justify">2. <strong>Instal Dependensi JavaScript:</strong></p>
                        <ul className="list-disc pl-5 mb-6">
                            <li className="mb-2">Setelah masuk ke direktori <code>frontend</code>, jalankan perintah berikut untuk menginstal semua library JavaScript/Node.js yang dibutuhkan:
                                <pre className="bg-gray-100 p-3 rounded-md mt-2 overflow-x-auto"><code>npm install
                                    # atau jika Anda menggunakan yarn:
                                    # yarn install</code></pre>
                            </li>
                        </ul>
                        <p className="mb-3 text-justify">3. <strong>Konfigurasi Environment Frontend (.env.local):</strong></p>
                        <ul className="list-disc pl-5 mb-6">
                            <li className="mb-2">Salin file <code>.env.example</code> (jika ada) menjadi <code>.env.local</code>:
                                <pre className="bg-gray-100 p-3 rounded-md mt-2 overflow-x-auto"><code>cp .env.example .env.local</code></pre>
                            </li>
                            <li className="mb-2">Buka file <code>.env.local</code> di editor teks Anda.</li>
                            <li className="mb-2">Atur URL API backend Anda (sesuai dengan yang Anda catat sebelumnya):
                                <pre className="bg-gray-100 p-3 rounded-md mt-2 overflow-x-auto"><code>NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api</code></pre>
                            </li>
                            <li className="mb-2">Pastikan <code>http://127.0.0.1:8000</code> adalah URL server Laravel Anda, dan tambahkan <code>/api</code> di belakangnya jika semua route API Anda diawali dengan <code>/api</code> di Laravel (misalnya, <code>Route::prefix(&apos;api&apos;)-{">"}group(...)</code>).</li>
                        </ul>
                        <p className="mb-3 text-justify">4. <strong>Jalankan Server Frontend (Next.js):</strong></p>
                        <ul className="list-disc pl-5 mb-6">
                            <li className="mb-2">Untuk menjalankan server pengembangan Next.js, gunakan perintah:
                                <pre className="bg-gray-100 p-3 rounded-md mt-2 overflow-x-auto"><code>npm run dev
                                    # atau jika Anda menggunakan yarn:
                                    # yarn dev</code></pre>
                            </li>
                            <li className="mb-2">Aplikasi frontend Anda akan berjalan di <code>http://localhost:3000</code> (atau port lain jika sudah dipakai).</li>
                        </ul>

                        <h4 className="text-[#004b63] mb-3 text-xl font-semibold">Verifikasi Instalasi</h4>
                        <ul className="list-disc pl-5 mb-6">
                            <li className="mb-2">Buka browser Anda dan akses <code>http://localhost:3000</code>. Anda seharusnya melihat halaman utama aplikasi Analis.</li>
                            <li className="mb-2">Pastikan server Laravel (<code>php artisan serve</code>) dan server Next.js (<code>npm run dev</code>) keduanya berjalan di terminal masing-masing.</li>
                            <li className="mb-2">Coba fungsionalitas aplikasi yang membutuhkan koneksi ke database dan API (misalnya, login, mengunggah file) untuk memastikan semuanya terhubung dengan benar.</li>
                        </ul>
                    </section>

                    <section id="panduan" className="mb-16">
                        <h3 className="text-[#004b63] mb-4 text-2xl font-semibold">Panduan Pemakaian</h3>
                        <p className="mb-3 text-justify">Setelah aplikasi terbuka dan Anda telah login, lakukan langkah-langkah berikut:</p>
                        <p className="mb-3 text-justify">1. <strong>Autentikasi pengguna:</strong></p>
                        <ul className="list-disc pl-5 mb-6">
                            <li className="mb-2">Login/register.</li>
                        </ul>
                        <p className="mb-3 text-justify">2. <strong>Unggah Data Ujian:</strong></p>
                        <ul className="list-disc pl-5 mb-6">
                            <li className="mb-2">setelah login, anda bisa membuka laman projek saya.</li>
                            <li className="mb-2">buat project baru untuk memulai</li>
                            <li className="mb-2">anda bisa mulai memasukkan soal ujian anda</li>
                        </ul>
                        <p className="mb-3 text-justify">3. <strong>Lihat dan Edit Data:</strong></p>
                        <ul className="list-disc pl-5 mb-6">
                            <li className="mb-2">Anda dapat melihat jawaban setiap peserta untuk setiap soal.</li>
                            <li className="mb-2"><strong>Mengedit Jawaban:</strong> Jika diperlukan, Anda dapat langsung mengedit jawaban di sel spreadsheet.</li>
                            <li className="mb-2"><strong>Menambahkan Peserta Baru:</strong> Jika Anda menambahkan baris baru di spreadsheet dan mengisi jawaban, sistem akan secara otomatis menggenerasi &quot;Kode Peserta&quot; baru (misalnya, Peserta_11, Peserta_12, dst.) untuk baris tersebut.</li>
                            <li className="mb-2"><strong>Menghapus Peserta:</strong> Jika Anda mengosongkan seluruh baris di spreadsheet (membuat semua sel menjadi kosong/null), data peserta tersebut akan dihapus dari sistem saat disimpan. Jika seluruh spreadsheet dikosongkan, semua data jawaban untuk proyek tersebut akan dihapus.</li>
                        </ul>
                        <p className="mb-3 text-justify">4. <strong>Simpan Data:</strong></p>
                        <ul className="list-disc pl-5 mb-6">
                            <li className="mb-2">Klik tombol &quot;Simpan&quot; di bawah spreadsheet.</li>
                            <li className="mb-2">Sistem akan menyimpan semua perubahan yang Anda buat di spreadsheet ke database.</li>
                        </ul>
                        <p className="mb-3 text-justify">5. <strong>Lihat Hasil Analisis Butir Soal:</strong></p>
                        <ul className="list-disc pl-5 mb-6">
                            <li className="mb-2">Setelah data disimpan, atau jika data sudah ada, klik tombol <strong>&quot;Hitung Analisis Soal&quot;</strong>.</li>
                            <li className="mb-2">Sistem akan menampilkan hasil analisis komprehensif, meliputi:
                                <ul className="list-circle pl-5 mt-2">
                                    <li className="mb-1"><strong>Validitas Soal (Item-Total Correlation):</strong> Menunjukkan seberapa baik setiap soal mengukur hal yang sama dengan tes keseluruhan. Nilai mendekati 1 (positif) bagus, nilai mendekati 0 buruk, nilai negatif (misal -0.X) sangat buruk.</li>
                                    <li className="mb-1"><strong>Reliabilitas Tes (Cronbach&apos;s Alpha):</strong> Menunjukkan konsistensi internal seluruh tes. Nilai di atas 0.70 umumnya dianggap baik.</li>
                                    <li className="mb-1"><strong>Tingkat Kesukaran (Difficulty Level):</strong> Proporsi siswa yang menjawab benar setiap soal (0.0 = sangat sukar, 1.0 = sangat mudah).</li>
                                    <li className="mb-1"><strong>Daya Beda (Discrimination Index):</strong> Kemampuan soal untuk membedakan siswa pintar dan kurang pintar. Nilai di atas 0.40 sangat baik.</li>
                                    <li className="mb-1"><strong>Kualitas Pengecoh (Distractor Analysis):</strong> Analisis detail untuk setiap pilihan jawaban (terutama untuk soal pilihan ganda). Ini menunjukkan seberapa efektif pilihan jawaban yang salah menarik siswa yang kurang pintar, dan seberapa baik kunci jawaban dipilih oleh siswa pintar.</li>
                                </ul>
                            </li>
                        </ul>
                    </section>

                    <section id="faq" className="mb-16">
                        <h3 className="text-[#004b63] mb-4 text-2xl font-semibold">Bantuan / FAQ</h3>
                        <p className="mb-3 text-justify"><strong>Q: Apakah harus online untuk mengakses Analis?</strong></p>
                        <p className="mb-3 text-justify">A: Ya dan Tidak. Untuk menjalankan aplikasi ini di komputer Anda, Anda tidak perlu koneksi internet setelah source code dan dependensi diunduh. Namun, Anda harus memiliki <strong>server lokal</strong> (seperti yang dijelaskan di atas) yang berjalan untuk bagian backend (Laravel) dan frontend (Next.js).</p>

                        <p className="mb-3 text-justify"><strong>Q: Apa yang harus saya lakukan jika mendapatkan error &quot;Gagal memuat pertanyaan&quot; atau &quot;Gagal memuat hasil analisis&quot;?</strong></p>
                        <p className="mb-3 text-justify">A: Ini sering terjadi karena koneksi antara frontend Next.js dan backend Laravel tidak terjalin.</p>
                        <ul className="list-disc pl-5 mb-6">
                            <li className="mb-2">Pastikan kedua server (Laravel: <code>php artisan serve</code> dan Next.js: <code>npm run dev</code>) sedang berjalan di terminal masing-masing.</li>
                            <li className="mb-2">Periksa konfigurasi <code>NEXT_PUBLIC_API_URL</code> di file <code>.env.local</code> pada proyek frontend Anda. Pastikan URL tersebut <strong>tepat</strong> mengarah ke server Laravel Anda (contoh: <code>http://127.0.0.1:8000/api</code>).</li>
                            <li className="mb-2">Periksa log server Laravel di terminal untuk melihat apakah ada error di sana.</li>
                            <li className="mb-2">Periksa konsol browser Anda (F12) untuk melihat pesan error jaringan atau JavaScript.</li>
                        </ul>

                        <p className="mb-3 text-justify"><strong>Q: Bagaimana jika hasil validitas/reliabilitas saya adalah &apos;null&apos; atau &apos;Tidak dapat dihitung&apos;?</strong></p>
                        <p className="mb-3 text-justify">A: Ini biasanya terjadi karena <strong>tidak ada variasi yang cukup dalam data ujian Anda</strong>.</p>
                        <ul className="list-disc pl-5 mb-6">
                            <li className="mb-2"><strong>Reliabilitas:</strong> Membutuhkan minimal 2 soal. Jika semua peserta menjawab sama persis (semua benar atau semua salah) pada semua soal, atau jika semua peserta memiliki skor total yang sama, reliabilitas tidak dapat dihitung.</li>
                            <li className="mb-2"><strong>Validitas:</strong> Membutuhkan variasi pada skor soal itu sendiri DAN variasi pada skor total peserta. Jika semua peserta menjawab sama pada soal tertentu, atau semua peserta memiliki skor total yang sama, validitas soal tersebut tidak dapat dihitung.</li>
                            <li className="mb-2"><strong>Solusi:</strong> Pastikan data ujian Anda memiliki variasi yang cukup, di mana ada peserta yang menjawab benar dan salah, serta skor total yang bervariasi antar peserta.</li>
                        </ul>
                    </section>
                </div>
            </div>
        </main>
    );
}
