# Analis - Aplikasi Analisis Butir Soal Otomatis

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/fajar-i/tubes-rpl/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/fajar-i/tubes-rpl.svg?style=social)](https://github.com/fajar-i/tubes-rpl/stargazers)

Analis adalah aplikasi web yang membantu guru atau pengembang tes untuk menganalisis kualitas butir soal secara otomatis. Aplikasi ini menyediakan perhitungan metrik-metrik psikometrik penting seperti Validitas Soal, Reliabilitas Tes, Tingkat Kesukaran, Daya Beda, dan Kualitas Pengecoh.

---

## Fitur Utama

* **Manajemen Soal & Opsi:** Buat dan kelola soal ujian beserta pilihan jawabannya.
* **Input Data Jawaban Interaktif:** Masukkan atau edit jawaban peserta melalui antarmuka spreadsheet (Jspreadsheet) yang intuitif.
* **Analisis Butir Soal Komprehensif:**
    * **Validitas Soal (Item-Total Correlation):** Mengukur seberapa baik setiap soal berkorelasi dengan skor total tes.
    * **Reliabilitas Tes (Cronbach's Alpha):** Mengukur konsistensi internal seluruh tes.
    * **Tingkat Kesukaran (Difficulty Level):** Proporsi siswa yang menjawab benar setiap soal.
    * **Daya Beda (Discrimination Index):** Kemampuan soal untuk membedakan siswa berprestasi tinggi dan rendah.
    * **Kualitas Pengecoh (Distractor Analysis):** Analisis efektivitas setiap pilihan jawaban (pengecoh) dalam tes pilihan ganda.
* **Penyimpanan Data Otomatis:** Perubahan pada spreadsheet akan disimpan secara dinamis ke database.
* **Pengelolaan Proyek:** Atur analisis dalam proyek-proyek terpisah.

---

## Arsitektur Aplikasi

Aplikasi Analis dibangun dengan arsitektur modern yang memisahkan **Backend (API)** dan **Frontend (Web)**:

* **Backend:** Dibangun menggunakan **Laravel** (PHP), menyediakan API untuk pengelolaan data soal, jawaban, dan semua perhitungan analisis.
* **Frontend:** Dibangun menggunakan **Next.js** (React.js), menyediakan antarmuka pengguna yang interaktif untuk memasukkan data dan melihat hasil analisis.

---

## Cara Penginstalan

Untuk menginstal dan menjalankan aplikasi Analis, Anda perlu menginstal dan mengkonfigurasi bagian Backend (Laravel) dan Frontend (Next.js) secara terpisah.

### Persyaratan Sistem

Pastikan Anda memiliki perangkat lunak berikut terinstal di komputer Anda:

* **Node.js dan npm:** Versi terbaru stabil (disarankan Node.js v18.x atau lebih baru, npm v9.x atau lebih baru).
* **PHP:** Versi 8.1 atau lebih baru.
* **Composer:** Manajer dependensi PHP.
* **MySQL/MariaDB:** Sistem manajemen database.
* **Git:** Untuk mengunduh source code.
* **Web Server Lokal:**
    * **XAMPP/Laragon/WAMP** (untuk Windows)
    * **MAMP** (untuk macOS)
    * Atau konfigurasi server mandiri (Apache/Nginx dengan PHP-FPM)

### Langkah-langkah Instalasi Backend (Laravel)

1.  **Unduh Source Code Backend:**
    * Buka terminal atau Command Prompt Anda.
    * Navigasi ke direktori tempat Anda ingin menyimpan proyek.
    * Unduh source code backend dari repositori GitHub:
        
        ```bash
        git clone [https://github.com/fajar-i/tubes-rpl.git](https://github.com/fajar-i/tubes-rpl.git)
        cd tubes-rpl/backend
        ```

2.  **Instal Dependensi PHP:**
    * Setelah masuk ke direktori `backend`, jalankan perintah berikut untuk menginstal semua library PHP yang dibutuhkan oleh Laravel:
        
        ```bash
        composer install
        ```

3.  **Konfigurasi Environment (.env):**
    * Salin file `.env.example` menjadi `.env`:
        
        ```bash
        cp .env.example .env
        ```
    * Buka file `.env` yang baru dibuat di editor teks Anda.
    * Atur **kunci aplikasi (App Key)**:
        
        ```bash
        php artisan key:generate
        ```
    * Konfigurasi **koneksi database** (ganti `nama_database_anda`, `root`, dan `password_anda` sesuai dengan konfigurasi database Anda):
        ```dotenv
        DB_CONNECTION=mysql
        DB_HOST=127.0.0.1
        DB_PORT=3306
        DB_DATABASE=nama_database_anda
        DB_USERNAME=root
        DB_PASSWORD=password_anda
        ```
    * Pastikan untuk membuat database dengan nama yang sama (`nama_database_anda`) di MySQL/MariaDB Anda.

4.  **Jalankan Migrasi Database dan Seeder (Opsional):**
    * Jalankan migrasi untuk membuat tabel-tabel di database Anda:
        
        ```bash
        php artisan migrate
        ```
    * Jika ada data awal atau dummy yang perlu diisi, jalankan seeder (jika tersedia):
        
        ```bash
        php artisan db:seed
        ```

5.  **Jalankan Server Backend (API):**
    * Untuk menjalankan server lokal Laravel, gunakan perintah:
        
        ```bash
        php artisan serve
        ```
    * API Anda akan berjalan di `http://127.0.0.1:8000` (atau port lain jika sudah dipakai). Catat URL ini, Anda akan membutuhkannya untuk konfigurasi frontend.

### Langkah-langkah Instalasi Frontend (Next.js)

1.  **Navigasi ke Direktori Frontend:**
    * Asumsikan Anda sudah mengkloning repositori utama (`tubes-rpl`). Cukup navigasi ke direktori `frontend`:
        
        ```bash
        cd ../frontend
        ```

2.  **Instal Dependensi JavaScript:**
    * Setelah masuk ke direktori `frontend`, jalankan perintah berikut untuk menginstal semua library JavaScript/Node.js yang dibutuhkan:
        
        ```bash
        npm install
        # atau jika Anda menggunakan yarn:
        # yarn install
        ```

3.  **Konfigurasi Environment Frontend (.env.local):**
    * Salin file `.env.example` (jika ada) menjadi `.env.local`:
        
        ```bash
        cp .env.example .env.local
        ```
    * Buka file `.env.local` di editor teks Anda.
    * Atur URL API backend Anda (sesuai dengan yang Anda catat sebelumnya):
        ```dotenv
        NEXT_PUBLIC_API_URL=[http://127.0.0.1:8000/api](http://127.0.0.1:8000/api)
        ```
    * Pastikan `http://127.0.0.1:8000` adalah URL server Laravel Anda, dan tambahkan `/api` di belakangnya jika semua route API Anda diawali dengan `/api` di Laravel (misalnya, `Route::prefix('api')->group(...)`).

4.  **Jalankan Server Frontend (Next.js):**
    * Untuk menjalankan server pengembangan Next.js, gunakan perintah:
        
        ```bash
        npm run dev
        # atau jika Anda menggunakan yarn:
        # yarn dev
        ```
    * Aplikasi frontend Anda akan berjalan di `http://localhost:3000` (atau port lain jika sudah dipakai).

### Verifikasi Instalasi

* Buka browser Anda dan akses `http://localhost:3000`. Anda seharusnya melihat halaman utama aplikasi Analis.
* Pastikan server Laravel (`php artisan serve`) dan server Next.js (`npm run dev`) keduanya berjalan di terminal masing-masing.
* Coba fungsionalitas aplikasi yang membutuhkan koneksi ke database dan API (misalnya, login, membuat proyek baru, memasukkan soal, mengedit jawaban) untuk memastikan semuanya terhubung dengan benar.

---

## Panduan Pemakaian

Setelah aplikasi terbuka dan Anda telah login, lakukan langkah-langkah berikut:

1.  **Autentikasi Pengguna:**
    * Lakukan proses login atau registrasi untuk mengakses fitur-fitur aplikasi.

2.  **Kelola Proyek dan Soal Ujian:**
    * Setelah login, Anda bisa membuka halaman proyek Anda.
    * Buat proyek baru untuk memulai analisis.
    * Di dalam proyek, Anda dapat mulai memasukkan soal ujian Anda.

3.  **Lihat dan Edit Data Jawaban:**
    * Anda dapat melihat jawaban setiap peserta untuk setiap soal dalam antarmuka spreadsheet interaktif (Jspreadsheet).
    * **Mengedit Jawaban:** Jika diperlukan, Anda dapat langsung mengedit jawaban di sel spreadsheet.
    * **Menambahkan Peserta Baru:** Jika Anda menambahkan baris baru di spreadsheet dan mengisi jawaban, sistem akan secara otomatis menggenerasi "Kode Peserta" baru (misalnya, Peserta\_11, Peserta\_12, dst.) untuk baris tersebut.
    * **Menghapus Peserta:** Jika Anda mengosongkan seluruh baris di spreadsheet (membuat semua sel menjadi kosong/null), data peserta tersebut akan dihapus dari sistem saat disimpan. Jika seluruh spreadsheet dikosongkan, semua data jawaban untuk proyek tersebut akan dihapus.

4.  **Simpan Data:**
    * Klik tombol **"Simpan"** (biasanya di bawah spreadsheet).
    * Sistem akan mengirim semua perubahan yang Anda buat di spreadsheet ke database.

5.  **Lihat Hasil Analisis Butir Soal:**
    * Setelah data disimpan, atau jika data sudah ada, klik tombol **"Hitung Analisis Soal"**.
    * Sistem akan menampilkan hasil analisis komprehensif, meliputi:
        * **Validitas Soal (Item-Total Correlation):** Menunjukkan seberapa baik setiap soal mengukur hal yang sama dengan tes keseluruhan. Nilai mendekati 1 (positif) bagus, nilai mendekati 0 buruk, nilai negatif (misal -0.X) sangat buruk.
        * **Reliabilitas Tes (Cronbach's Alpha):** Menunjukkan konsistensi internal seluruh tes. Nilai di atas 0.70 umumnya dianggap baik.
        * **Tingkat Kesukaran (Difficulty Level):** Proporsi siswa yang menjawab benar setiap soal (0.0 = sangat sukar, 1.0 = sangat mudah).
        * **Daya Beda (Discrimination Index):** Kemampuan soal untuk membedakan siswa pintar dan kurang pintar. Nilai di atas 0.40 sangat baik.
        * **Kualitas Pengecoh (Distractor Analysis):** Analisis detail untuk setiap pilihan jawaban (terutama untuk soal pilihan ganda). Ini menunjukkan seberapa efektif pilihan jawaban yang salah menarik siswa yang kurang pintar, dan seberapa baik kunci jawaban dipilih oleh siswa pintar.

---

## Bantuan / FAQ

**Q: Apakah harus online untuk mengakses Analis?**

A: Ya dan Tidak. Untuk menjalankan aplikasi ini di komputer Anda, Anda tidak perlu koneksi internet setelah source code dan dependensi diunduh. Namun, Anda harus memiliki **server lokal** (seperti yang dijelaskan di atas) yang berjalan untuk bagian backend (Laravel) dan frontend (Next.js).

**Q: Format file seperti apa yang bisa digunakan untuk data ujian?**

A: Hanya file dengan format `.xlsx` (Excel) yang didukung saat ini. Pastikan format kolom data ujian Anda sesuai dengan kebutuhan sistem (misalnya, setiap baris adalah peserta, setiap kolom adalah soal).

**Q: Apa yang harus saya lakukan jika mendapatkan error "Gagal memuat pertanyaan" atau "Gagal memuat hasil analisis"?**

A: Ini sering terjadi karena koneksi antara frontend Next.js dan backend Laravel tidak terjalin.
* Pastikan kedua server (Laravel: `php artisan serve` dan Next.js: `npm run dev`) sedang berjalan di terminal masing-masing.
* Periksa konfigurasi `NEXT_PUBLIC_API_URL` di file `.env.local` pada proyek frontend Anda. Pastikan URL tersebut **tepat** mengarah ke server Laravel Anda (contoh: `http://127.0.0.1:8000/api`).
* Periksa log server Laravel di terminal untuk melihat apakah ada error di sana.
* Periksa konsol browser Anda (F12) untuk melihat pesan error jaringan atau JavaScript.

**Q: Bagaimana jika hasil validitas/reliabilitas saya adalah 'null' atau 'Tidak dapat dihitung'?**

A: Ini biasanya terjadi karena **tidak ada variasi yang cukup dalam data ujian Anda**.
* **Reliabilitas:** Membutuhkan minimal 2 soal. Jika semua peserta menjawab sama persis (semua benar atau semua salah) pada semua soal, atau jika semua peserta memiliki skor total yang sama, reliabilitas tidak dapat dihitung.
* **Validitas:** Membutuhkan variasi pada skor soal itu sendiri DAN variasi pada skor total peserta. Jika semua peserta menjawab sama pada soal tertentu, atau semua peserta memiliki skor total yang sama, validitas soal tersebut tidak dapat dihitung.
* **Solusi:** Pastikan data ujian Anda memiliki variasi yang cukup, di mana ada peserta yang menjawab benar dan salah, serta skor total yang bervariasi antar peserta.