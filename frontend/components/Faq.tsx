import { Disclosure, DisclosurePanel, Transition, DisclosureButton } from '@headlessui/react'
import { ChevronUpIcon } from '@heroicons/react/24/outline'

interface FaqItem {
    question: string;
    answer: string;
}

const faqList: FaqItem[] = [
    {
        question: "Apa itu analisis butir soal?",
        answer: "Analisis butir soal adalah proses pengkajian kualitas soal untuk menentukan mutu sebuah tes. Analisis mencakup validitas, reliabilitas, tingkat kesukaran, dan daya pembeda soal. Hasil analisis membantu pendidik mengidentifikasi soal yang baik, perlu diperbaiki, atau harus diganti."
    },
    {
        question: "Apa saja parameter yang dianalisis?",
        answer: "Platform kami menganalisis empat parameter utama: 1) Validitas - mengukur ketepatan soal dalam menilai kemampuan, 2) Reliabilitas - konsistensi hasil pengukuran, 3) Tingkat Kesukaran - proporsi siswa yang menjawab benar, dan 4) Daya Pembeda - kemampuan soal membedakan siswa berkemampuan tinggi dan rendah."
    },
    {
        question: "Bagaimana cara menggunakan Analis?",
        answer: "Penggunaan Analis sangat mudah: 1) Buat proyek baru dan masukkan informasi tes, 2) Input soal-soal tes beserta kunci jawaban, 3) Masukkan jawaban peserta menggunakan spreadsheet interaktif, 4) Dapatkan hasil analisis secara instan, dan 5) Gunakan fitur analisis AI untuk validasi tambahan."
    },
    {
        question: "Bagaimana format input jawaban peserta?",
        answer: "Input jawaban menggunakan spreadsheet interaktif yang mudah digunakan. Jawaban diinput dengan huruf kapital (A, B, C, D, atau E) sesuai pilihan jawaban peserta. Sistem akan memvalidasi format secara otomatis untuk menghindari kesalahan input."
    },
    {
        question: "Apa keunggulan fitur analisis AI?",
        answer: "Fitur analisis AI kami menggunakan model bahasa canggih untuk mengevaluasi aspek kualitatif soal, meliputi: kejelasan perumusan, kesesuaian dengan tujuan pembelajaran, kedalaman kognitif, dan validitas konstruk. Hasil analisis AI melengkapi analisis empiris untuk evaluasi soal yang lebih komprehensif."
    }
]

export default function Faq() {
    return (
        <div className="py-20" id="faq">
            <div className="container mx-auto w-[90%] max-w-[1200px]">
                <h2 className="text-4xl font-bold text-center mb-12">Pertanyaan Umum</h2>
                <div className="space-y-4">
                    {faqList.map((faq, index) => (
                        <Disclosure key={index}>
                            {({ open }) => (
                                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                    <DisclosureButton className="flex w-full justify-between items-center px-6 py-4">
                                        <h3 className="text-xl font-semibold text-left">{faq.question}</h3>
                                        <ChevronUpIcon
                                            className={`${
                                                open ? 'rotate-180 transform' : ''
                                            } h-5 w-5 text-gray-500`}
                                        />
                                    </DisclosureButton>
                                    <Transition
                                        enter="transition duration-100 ease-out"
                                        enterFrom="transform scale-95 opacity-0"
                                        enterTo="transform scale-100 opacity-100"
                                        leave="transition duration-75 ease-out"
                                        leaveFrom="transform scale-100 opacity-100"
                                        leaveTo="transform scale-95 opacity-0"
                                    >
                                        <DisclosurePanel className="px-6 pb-4">
                                            <p className="text-gray-600">{faq.answer}</p>
                                        </DisclosurePanel>
                                    </Transition>
                                </div>
                            )}
                        </Disclosure>
                    ))}
                </div>
            </div>
        </div>
    )
}
