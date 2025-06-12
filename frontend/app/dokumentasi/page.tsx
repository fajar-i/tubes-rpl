import "./style.css";
export default function Dokumentasi() {
    return <>
        <main className="container doc-wrapper">
            <aside className="sidebar">
                <h2>Help Sources</h2>
                <ul>
                    <li><a href="#install">Cara Penginstalan</a></li>
                    <li><a href="#panduan">Panduan Pemakaian</a></li>
                    <li><a href="#faq">Bantuan / FAQ</a></li>
                </ul>
            </aside>
            <div className="doc-content">
                <section id="install">
                    <h3>Cara Penginstalan</h3>
                    <p>Untuk menginstal aplikasi Analis, ikuti langkah-langkah berikut:</p>

                    <h4>Persyaratan Sistem</h4>
                    <p>Pastikan Anda memiliki perangkat lunak berikut terinstal di komputer Anda:</p>
                    <ul>
                        <li><strong>Node.js dan npm:</strong> Versi terbaru stabil (disarankan Node.js v18.x atau lebih baru, npm v9.x atau lebih baru).</li>
                        <li><strong>PHP:</strong> Versi 8.1 atau lebih baru.</li>
                        <li><strong>Composer:</strong> Manajer dependensi PHP.</li>
                        <li><strong>MySQL/MariaDB:</strong> Sistem manajemen database.</li>
                        <li><strong>Git:</strong> Untuk mengunduh source code.</li>
                        <li><strong>Web Server Lokal:</strong>
                            <ul>
                                <li><strong>XAMPP/Laragon/WAMP</strong> (untuk Windows)</li>
                                <li><strong>MAMP</strong> (untuk macOS)</li>
                                <li>Atau konfigurasi server mandiri (Apache/Nginx dengan PHP-FPM)</li>
                            </ul>
                        </li>
                    </ul>

                    <h4>Langkah-langkah Instalasi Backend (Laravel)</h4>
                    <p>1. <strong>Unduh Source Code Backend:</strong></p>
                    <ul>
                        <li>Buka terminal atau Command Prompt Anda.</li>
                        <li>Navigasi ke direktori tempat Anda ingin menyimpan proyek.</li>
                        <li>Unduh source code backend : <a href="https://github.com/fajar-i/tubes-rpl">https://github.com/fajar-i/tubes-rpl</a>
                            <pre><code>git clone https://github.com/fajar-i/tubes-rpl.git <br />cd ./backend </code></pre>
                        </li>
                    </ul>
                    <p>2. <strong>Instal Dependensi PHP:</strong></p>
                    <ul>
                        <li>Setelah masuk ke direktori <code>backend</code>, jalankan perintah berikut untuk menginstal semua library PHP yang dibutuhkan oleh Laravel:
                            <pre><code>composer install</code></pre>
                        </li>
                    </ul>
                    <p>3. <strong>Konfigurasi Environment (.env):</strong></p>
                    <ul>
                        <li>Salin file <code>.env.example</code> menjadi <code>.env</code>:
                            <pre><code>cp .env.example .env</code></pre>
                        </li>
                        <li>Buka file <code>.env</code> yang baru dibuat di editor teks Anda.</li>
                        <li>Atur <strong>kunci aplikasi (App Key)</strong>:
                            <pre><code>php artisan key:generate</code></pre>
                        </li>
                        <li>Konfigurasi <strong>koneksi database</strong> (ganti nama database, username, dan password sesuai dengan konfigurasi Anda):
                            <pre><code>DB_CONNECTION=mysql
                                DB_HOST=127.0.0.1
                                DB_PORT=3306
                                DB_DATABASE=nama_database_anda
                                DB_USERNAME=root
                                DB_PASSWORD=</code></pre>
                        </li>
                        <li>Pastikan untuk membuat database dengan nama yang sama di MySQL/MariaDB Anda.</li>
                    </ul>
                    <p>4. <strong>Jalankan Migrasi Database dan Seeder (Opsional):</strong></p>
                    <ul>
                        <li>Jalankan migrasi untuk membuat tabel-tabel di database Anda:
                            <pre><code>php artisan migrate</code></pre>
                        </li>
                        <li>Jika ada data awal atau dummy yang perlu diisi, jalankan seeder (jika tersedia):
                            <pre><code>php artisan db:seed</code></pre>
                        </li>
                    </ul>
                    <p>5. <strong>Jalankan Server Backend (API):</strong></p>
                    <ul>
                        <li>Untuk menjalankan server lokal Laravel, gunakan perintah:
                            <pre><code>php artisan serve</code></pre>
                        </li>
                        <li>API Anda akan berjalan di <code>http://127.0.0.1:8000</code> (atau port lain jika sudah dipakai). Catat URL ini, Anda akan membutuhkannya untuk konfigurasi frontend.</li>
                    </ul>

                    <h4>Langkah-langkah Instalasi Frontend (Next.js)</h4>
                    <p>1. <strong>Unduh Source Code Frontend:</strong></p>
                    <ul>
                        <li>Buka terminal atau Command Prompt baru.</li>
                        <li>dengan kloning backend, anda juga langsung mengkloning frontend. cukup jalankan:
                            <pre><code>
                                cd ./frontend</code></pre>
                        </li>
                    </ul>
                    <p>2. <strong>Instal Dependensi JavaScript:</strong></p>
                    <ul>
                        <li>Setelah masuk ke direktori <code>frontend</code>, jalankan perintah berikut untuk menginstal semua library JavaScript/Node.js yang dibutuhkan:
                            <pre><code>npm install
                                # atau jika Anda menggunakan yarn:
                                # yarn install</code></pre>
                        </li>
                    </ul>
                    <p>3. <strong>Konfigurasi Environment Frontend (.env.local):</strong></p>
                    <ul>
                        <li>Salin file <code>.env.example</code> (jika ada) menjadi <code>.env.local</code>:
                            <pre><code>cp .env.example .env.local</code></pre>
                        </li>
                        <li>Buka file <code>.env.local</code> di editor teks Anda.</li>
                        <li>Atur URL API backend Anda (sesuai dengan yang Anda catat sebelumnya):
                            <pre><code>NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api</code></pre>
                        </li>
                        <li>Pastikan <code>http://127.0.0.1:8000</code> adalah URL server Laravel Anda, dan tambahkan <code>/api</code> di belakangnya jika semua route API Anda diawali dengan <code>/api</code> di Laravel (misalnya, <code>Route::prefix('api')->group(...)</code>).</li>
                    </ul>
                    <p>4. <strong>Jalankan Server Frontend (Next.js):</strong></p>
                    <ul>
                        <li>Untuk menjalankan server pengembangan Next.js, gunakan perintah:
                            <pre><code>npm run dev
                                # atau jika Anda menggunakan yarn:
                                # yarn dev</code></pre>
                        </li>
                        <li>Aplikasi frontend Anda akan berjalan di <code>http://localhost:3000</code> (atau port lain jika sudah dipakai).</li>
                    </ul>

                    <h4>Verifikasi Instalasi</h4>
                    <ul>
                        <li>Buka browser Anda dan akses <code>http://localhost:3000</code>. Anda seharusnya melihat halaman utama aplikasi Analis.</li>
                        <li>Pastikan server Laravel (<code>php artisan serve</code>) dan server Next.js (<code>npm run dev</code>) keduanya berjalan di terminal masing-masing.</li>
                        <li>Coba fungsionalitas aplikasi yang membutuhkan koneksi ke database dan API (misalnya, login, mengunggah file) untuk memastikan semuanya terhubung dengan benar.</li>
                    </ul>
                </section>

                <section id="panduan">
                    <h3>Panduan Pemakaian</h3>
                    <p>Setelah aplikasi terbuka dan Anda telah login, lakukan langkah-langkah berikut:</p>
                    <p>1. <strong>Autentikasi pengguna:</strong></p>
                    <ul>
                        <li>Login/register.</li>
                    </ul>
                    <p>2. <strong>Unggah Data Ujian:</strong></p>
                    <ul>
                        <li>setelah login, anda bisa membuka laman projek saya.</li>
                        <li>buat project baru untuk memulai</li>
                        <li>anda bisa mulai memasukkan soal ujian anda</li>
                    </ul>
                    <p>3. <strong>Lihat dan Edit Data:</strong></p>
                    <ul>
                        <li>Anda dapat melihat jawaban setiap peserta untuk setiap soal.</li>
                        <li><strong>Mengedit Jawaban:</strong> Jika diperlukan, Anda dapat langsung mengedit jawaban di sel spreadsheet.</li>
                        <li><strong>Menambahkan Peserta Baru:</strong> Jika Anda menambahkan baris baru di spreadsheet dan mengisi jawaban, sistem akan secara otomatis menggenerasi "Kode Peserta" baru (misalnya, Peserta_11, Peserta_12, dst.) untuk baris tersebut.</li>
                        <li><strong>Menghapus Peserta:</strong> Jika Anda mengosongkan seluruh baris di spreadsheet (membuat semua sel menjadi kosong/null), data peserta tersebut akan dihapus dari sistem saat disimpan. Jika seluruh spreadsheet dikosongkan, semua data jawaban untuk proyek tersebut akan dihapus.</li>
                    </ul>
                    <p>4. <strong>Simpan Data:</strong></p>
                    <ul>
                        <li>Klik tombol "Simpan" di bawah spreadsheet.</li>
                        <li>Sistem akan menyimpan semua perubahan yang Anda buat di spreadsheet ke database.</li>
                    </ul>
                    <p>5. <strong>Lihat Hasil Analisis Butir Soal:</strong></p>
                    <ul>
                        <li>Setelah data disimpan, atau jika data sudah ada, klik tombol <strong>"Hitung Analisis Soal"</strong>.</li>
                        <li>Sistem akan menampilkan hasil analisis komprehensif, meliputi:
                            <ul>
                                <li><strong>Validitas Soal (Item-Total Correlation):</strong> Menunjukkan seberapa baik setiap soal mengukur hal yang sama dengan tes keseluruhan. Nilai mendekati 1 (positif) bagus, nilai mendekati 0 buruk, nilai negatif (misal -0.X) sangat buruk.</li>
                                <li><strong>Reliabilitas Tes (Cronbach's Alpha):</strong> Menunjukkan konsistensi internal seluruh tes. Nilai di atas 0.70 umumnya dianggap baik.</li>
                                <li><strong>Tingkat Kesukaran (Difficulty Level):</strong> Proporsi siswa yang menjawab benar setiap soal (0.0 = sangat sukar, 1.0 = sangat mudah).</li>
                                <li><strong>Daya Beda (Discrimination Index):</strong> Kemampuan soal untuk membedakan siswa pintar dan kurang pintar. Nilai di atas 0.40 sangat baik.</li>
                                <li><strong>Kualitas Pengecoh (Distractor Analysis):</strong> Analisis detail untuk setiap pilihan jawaban (terutama untuk soal pilihan ganda). Ini menunjukkan seberapa efektif pilihan jawaban yang salah menarik siswa yang kurang pintar, dan seberapa baik kunci jawaban dipilih oleh siswa pintar.</li>
                            </ul>
                        </li>
                    </ul>
                </section>

                <section id="faq">
                    <h3>Bantuan / FAQ</h3>
                    <p><strong>Q: Apakah harus online untuk mengakses Analis?</strong></p>
                    <p>A: Ya dan Tidak. Untuk menjalankan aplikasi ini di komputer Anda, Anda tidak perlu koneksi internet setelah source code dan dependensi diunduh. Namun, Anda harus memiliki <strong>server lokal</strong> (seperti yang dijelaskan di atas) yang berjalan untuk bagian backend (Laravel) dan frontend (Next.js).</p>

                    <p><strong>Q: Apa yang harus saya lakukan jika mendapatkan error "Gagal memuat pertanyaan" atau "Gagal memuat hasil analisis"?</strong></p>
                    <p>A: Ini sering terjadi karena koneksi antara frontend Next.js dan backend Laravel tidak terjalin.</p>
                    <ul>
                        <li>Pastikan kedua server (Laravel: <code>php artisan serve</code> dan Next.js: <code>npm run dev</code>) sedang berjalan di terminal masing-masing.</li>
                        <li>Periksa konfigurasi <code>NEXT_PUBLIC_API_URL</code> di file <code>.env.local</code> pada proyek frontend Anda. Pastikan URL tersebut <strong>tepat</strong> mengarah ke server Laravel Anda (contoh: <code>http://127.0.0.1:8000/api</code>).</li>
                        <li>Periksa log server Laravel di terminal untuk melihat apakah ada error di sana.</li>
                        <li>Periksa konsol browser Anda (F12) untuk melihat pesan error jaringan atau JavaScript.</li>
                    </ul>

                    <p><strong>Q: Bagaimana jika hasil validitas/reliabilitas saya adalah 'null' atau 'Tidak dapat dihitung'?</strong></p>
                    <p>A: Ini biasanya terjadi karena <strong>tidak ada variasi yang cukup dalam data ujian Anda</strong>.</p>
                    <ul>
                        <li><strong>Reliabilitas:</strong> Membutuhkan minimal 2 soal. Jika semua peserta menjawab sama persis (semua benar atau semua salah) pada semua soal, atau jika semua peserta memiliki skor total yang sama, reliabilitas tidak dapat dihitung.</li>
                        <li><strong>Validitas:</strong> Membutuhkan variasi pada skor soal itu sendiri DAN variasi pada skor total peserta. Jika semua peserta menjawab sama pada soal tertentu, atau semua peserta memiliki skor total yang sama, validitas soal tersebut tidak dapat dihitung.</li>
                        <li><strong>Solusi:</strong> Pastikan data ujian Anda memiliki variasi yang cukup, di mana ada peserta yang menjawab benar dan salah, serta skor total yang bervariasi antar peserta.</li>
                    </ul>
                </section>
            </div>
        </main>
    </>
}