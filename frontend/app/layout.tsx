import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";
import { Istok_Web } from "next/font/google";
import { AppProvider } from "@/context/AppProvider";
import "bootstrap/dist/css/bootstrap.min.css"
import "./styles.css";
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900']
});

const istok_Web = Istok_Web({
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
    <html lang="en" className={poppins.variable}>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Material+Icons" />
      </head>
      <body className={poppins.variable}>
        <AppProvider>
          <Toaster />
          <Navbar />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
