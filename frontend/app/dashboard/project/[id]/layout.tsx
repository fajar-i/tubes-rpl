"use client";

import Tabs from "@/components/ui/Tabs";
import { useParams, usePathname } from "next/navigation";

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{ id: string }>();
  const pathname = usePathname();

  const getTitle = () => {
    if (pathname.includes('/form')) return 'Form Soal';
    if (pathname.includes('/jawaban')) return 'Jawaban';
    if (pathname.includes('/result')) return 'Hasil';
    if (pathname.includes('/analisis_ai')) return 'Analisis AI';
    return '';
  };

  return (
    <Tabs params={params.id} title={getTitle()}>
      {children}
    </Tabs>
  );
}