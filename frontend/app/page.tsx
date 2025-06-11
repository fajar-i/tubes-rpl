"use client"
import { myAppHook } from "@/context/AppProvider"
export default function Home() {
    const { logout, authToken } = myAppHook();
    return <>
        <main>
            <div className="container hero">
                <div className="hero-text">
                    <h1>Analisis Butir Soal</h1>
                    <p className="subtitle">
                        Evaluasi pembelajaran dengan mudah, cepat, dan empiris
                    </p>
                    <br />
                    <p className="description">
                        Proses analisis empiris dari soal ujianmu secara instan!<br />
                        Pastikan soal yang kamu gunakan telah memenuhi standar evaluasi
                        seperti Cronbach's Alpha, nilai korelasi, dan indikator lainnya.
                    </p>
                </div>
                {
                    authToken ? (
                        <>
                            <div className="hero-image">
                                <img src="/lambang2.png" alt="Ilustrasi Analisis" />
                                <br />
                                <br />
                                <br />
                                <br />
                                <div className="cta-wrapper">
                                    <a href="/dokumentasi" className="cta-button">Dokumentasi</a>
                                    <a href='http://github.com/fajar-i/tubes-rpl' target="_blank" rel="noopener noreferrer" className="cta-button" style={{ marginLeft: 'auto' }}>Source Code</a>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="hero-image">
                                <img src="/lambang2.png" alt="Ilustrasi Analisis" />
                                <div className="cta-wrapper">
                                    <a href="/auth" className="cta-button " style={{ marginLeft: 'auto' }}>Coba Sekarang</a>
                                </div>
                            </div>
                        </>
                    )
                }
            </div>
        </main >
    </>
}

