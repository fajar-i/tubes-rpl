import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { AppProvider } from "@/context/AppProvider";
import "./globals.css";
import { Geist, Istok_Web } from 'next/font/google';

const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900']
});

const istok_web = Istok_Web({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-istok_Web',
  display: 'swap'
})

export const metadata: Metadata = {
  title: "Analis",
  description: "Analisis butir soal secara otomatis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} ${istok_web.variable}`}>
        <AppProvider>
          <Toaster />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
