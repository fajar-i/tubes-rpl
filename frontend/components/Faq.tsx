import { Disclosure, DisclosurePanel, Transition, DisclosureButton } from '@headlessui/react'
import { ChevronUpIcon } from '@heroicons/react/24/outline'

interface FaqItem {
    question: string;
    answer: string;
}

const faqList: FaqItem[] = [
    {
        question: "Apa itu analisis empiris soal?",
        answer: "Analisis empiris soal adalah proses evaluasi kualitas soal berdasarkan data hasil ujian siswa, meliputi validitas, reliabilitas, tingkat kesukaran, dan daya beda soal."
    },
    {
        question: "Bagaimana cara menggunakan platform ini?",
        answer: "Cukup unggah file hasil ujian Anda, dan platform kami akan secara otomatis menganalisis dan memberikan laporan lengkap tentang kualitas soal-soal ujian tersebut."
    },
    {
        question: "Berapa lama proses analisis berlangsung?",
        answer: "Proses analisis berlangsung secara instan dan hasil dapat dilihat langsung melalui dashboard interaktif kami."
    },
    {
        question: "Format file apa yang didukung?",
        answer: "Platform kami mendukung berbagai format file umum seperti Excel (.xlsx, .xls), CSV, dan format khusus lainnya yang dapat disesuaikan dengan kebutuhan Anda."
    },
    {
        question: "Apakah data saya aman?",
        answer: "Ya, kami menerapkan standar keamanan tinggi untuk melindungi data Anda. Semua data dienkripsi dan disimpan dengan aman di server kami."
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
