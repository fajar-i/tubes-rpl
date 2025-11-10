"use client";

import Loader from "@/components/ui/Loader";
import React, { useEffect, useRef, useState } from "react";
import { useMyAppHook } from "@/context/AppProvider";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AnalysisResults, QuestionResult } from "@/types";
import { AxiosInstance } from "@/lib/axios";
import { DocumentIcon } from "@heroicons/react/24/outline";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";

import QuestionCard from "@/components/ui/QuestionCard";
import ReliabilityCard from "@/components/ui/ReliabilityCard";
import useTitle from "@/hooks/useTitle";

export default function ResultPage() {
  useTitle('Analis - Hasil', 'Hasil dari Analis');
  const router = useRouter();
  const { authToken } = useMyAppHook();
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [questions, setQuestions] = useState<QuestionResult[]>([]);
  const params = useParams<{ id: string; tag: string; item: string }>();
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);

    const fetchData = async () => {
      try {
        // Get questions, analysis results, and project details in parallel
        const [questionsResponse, analysisResponse] = await Promise.all([
          AxiosInstance.get(`/projects/${params.id}/questions`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }),
          AxiosInstance.get(`/projects/${params.id}/result`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }),
        ]);

        // Set all states
        setQuestions(questionsResponse.data.questions);
        setAnalysisResults(analysisResponse.data.analisis);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Gagal memuat data. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authToken, params.id, router]);

  if (loading) {
    return <Loader />;
  }

  if (loading === false && !analysisResults) {
    return (
      <div
        className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative text-center mt-4"
        role="alert"
      >
        Tidak ada hasil analisis yang dapat ditampilkan. Pastikan data jawaban
        sudah tersedia.
      </div>
    );
  }

  const handleExportPDF = async () => {
    if (!contentRef.current) return;

    setExportLoading(true);
    
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margins = { top: 40, bottom: 10, left: 20, right: 20 }; // Increased margins
      const contentWidth = pdfWidth - margins.left - margins.right;

      // Add header with project details
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.text("Hasil Analisis Butir Soal", pdfWidth / 2, 20, { align: "center" });
      
      // Add project details
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      const details = [
        `Tanggal: ${new Date().toLocaleDateString("id-ID")}`
      ];

      details.forEach((detail, index) => {
        pdf.text(detail, margins.left, 35 + (index * 6));
      });
      
      let yOffset = margins.top;

      // Process each question card separately
      const questionElements = Array.from(
        contentRef.current.querySelectorAll(".question-card")
      );

      // Process cards one by one to ensure proper rendering
      for (const element of questionElements) {
        // Wait a bit before capturing each element
        await new Promise(resolve => setTimeout(resolve, 100));

        const canvas = await html2canvas(element as HTMLElement, {
          scale: 1.5, // Increased scale for better quality
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          removeContainer: true,
          allowTaint: false,
          foreignObjectRendering: false
        });

        const imgHeight = (canvas.height * contentWidth) / canvas.width;

        // Check if we need a new page
        if (yOffset + imgHeight > pdfHeight - margins.bottom) {
          pdf.addPage();
          yOffset = margins.top;
        }

        // Convert canvas to PNG for better quality
        const imgData = canvas.toDataURL("image/png", 0.75);

        // Add the image to PDF
        pdf.addImage(
          imgData,
          "PNG",
          margins.left,
          yOffset,
          contentWidth,
          imgHeight
        );

        yOffset += imgHeight + 5; // 5mm spacing between cards
      }

      // Add reliability card if it exists
      const reliabilityElement =
        contentRef.current.querySelector(".reliability-card");
      if (reliabilityElement) {
        // Wait a bit before capturing reliability card
        await new Promise(resolve => setTimeout(resolve, 100));

        const canvas = await html2canvas(reliabilityElement as HTMLElement, {
          scale: 1.5,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          removeContainer: true,
          allowTaint: false,
          foreignObjectRendering: false
        });

        const imgHeight = (canvas.height * contentWidth) / canvas.width;

        // Check if we need a new page
        if (yOffset + imgHeight > pdfHeight - margins.bottom) {
          pdf.addPage();
          yOffset = margins.top;
        }

        // Add the reliability card with PNG format
        pdf.addImage(
          canvas.toDataURL("image/png", 0.75),
          "PNG",
          margins.left,
          yOffset,
          contentWidth,
          imgHeight
        );
      }

      // Generate filename from project details
      const timestamp = new Date().toLocaleDateString("id-ID").replace(/\//g, '-');
      pdf.save(`Hasil Analisis_${timestamp}.pdf`);
      toast.success("PDF berhasil diunduh");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Gagal mengekspor PDF");
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <>
      <div className="flex-shrink-0">
        <button
          onClick={handleExportPDF}
          disabled={exportLoading}
          className={`flex items-center px-4 py-2 rounded-md text-base font-medium text-white ${
            exportLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600 cursor-pointer"
          }`}
        >
          <DocumentIcon className="h-6 w-6 mr-3" />
          {exportLoading ? "Mengekspor..." : "Ekspor ke PDF"}
        </button>
      </div>
      <div className="flex justify-center">
        <div
          ref={contentRef}
          className="w-full max-w-3xl bg-white p-4 rounded-lg"
        >
          {questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              analysisResults={analysisResults}
              index={index}
              pdfMode={exportLoading}
            />
          ))}

          {analysisResults?.reliabilitas_tes !== null &&
            analysisResults?.reliabilitas_tes !== undefined && (
              <ReliabilityCard
                reliabilityScore={analysisResults.reliabilitas_tes}
                pdfMode={exportLoading}
              />
            )}
        </div>
      </div>
    </>
  );
}
