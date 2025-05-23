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
                    <p>1. Unduh source code dari GitHub atau sumber resmi lainnya.</p>
                    <p>2. Pastikan Anda memiliki web server lokal seperti XAMPP atau Live Server di VS Code.</p>
                    <p>3. Ekstrak file ZIP ke dalam folder server lokal Anda (misal `htdocs` jika menggunakan XAMPP).</p>
                    <p>4. Jalankan file `index.html` melalui browser menggunakan server lokal.</p>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed tristique luctus sapien nec vulputate. Nullam eget ligula at leo imperdiet commodo. Curabitur posuere magna et nunc sagittis, ac gravida nisl viverra. Suspendisse at arcu dapibus, tincidunt tortor nec, tincidunt metus. Donec imperdiet quam ac tellus cursus, nec elementum sapien tristique. Integer vitae elit risus.</p>
                </section>

                <section id="panduan">
                    <h3>Panduan Pemakaian</h3>
                    <p>Setelah aplikasi terbuka, lakukan langkah-langkah berikut:</p>
                    <p>1. Klik tombol "Coba Sekarang" di halaman utama.</p>
                    <p>2. Unggah file excel (xlsx) berisi data hasil ujian.</p>
                    <p>3. Sistem akan menampilkan hasil analisis butir soal seperti reliabilitas (Cronbach's Alpha), tingkat kesukaran, dan daya beda.</p>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer hendrerit arcu id dolor gravida, in tincidunt enim blandit. Sed vitae turpis vel nisl consequat commodo. Aliquam erat volutpat. Etiam lacinia est in pulvinar bibendum. Fusce ut sem nec ipsum sollicitudin ultricies.</p>
                </section>

                <section id="faq">
                    <h3>Bantuan / FAQ</h3>
                    <p><strong>Q: Apakah harus online untuk mengakses Analis?</strong></p>
                    <p>A: Tidak, Anda bisa menjalankannya secara offline selama file lokal tersedia dan Anda memiliki server lokal.</p>

                    <p><strong>Q: Format file seperti apa yang bisa digunakan?</strong></p>
                    <p>A: Hanya file dengan format `.xlsx` (Excel) yang didukung saat ini.</p>

                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vitae lorem varius, efficitur nisl eget, pharetra neque. Nam mollis fermentum augue, in efficitur nisl finibus nec. Sed at eros ut sem vehicula mattis.</p>
                </section>
            </div>
        </main>
    </>
}