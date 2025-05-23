import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css"
import {Istok_Web } from "next/font/google";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";
import { AppProvider } from "@/context/AppProvider";
import "./styles.css";

const istok_Web = Istok_Web({
  weight:['400','700'],
  subsets:['latin'],
  variable:'--font-istok_Web',
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
    <html lang="en" className={istok_Web.variable}>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Material+Icons" />
      </head>
      <body className={istok_Web.variable}>
        <AppProvider>
        <Toaster />
        <Navbar />
        {children}
        </AppProvider>
      </body>
    </html>
  );
}
