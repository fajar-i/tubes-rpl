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

export default function EditorPage() {
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
        // Get questions and analysis results in parallel using Promise.all
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
          })
        ]);

        // Set both states
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
      const margins = { top: 35, bottom: 10, left: 10, right: 10 };
      const contentWidth = pdfWidth - margins.left - margins.right;

      // Add title
      pdf.setFontSize(16);
      pdf.text(`Hasil Analisis - ${Date.now()}`, pdfWidth / 2, 15, {
        align: "center",
      });
      pdf.setFontSize(12);
      pdf.text(new Date().toLocaleDateString("id-ID"), pdfWidth / 2, 25, {
        align: "center",
      });

      let yOffset = margins.top;

      // Process each question card separately
      const questionElements =
        contentRef.current.querySelectorAll(".question-card");

      for (const element of Array.from(questionElements)) {
        const canvas = await html2canvas(element as HTMLElement, {
          scale: 1.5,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
        });

        const imgHeight = (canvas.height * contentWidth) / canvas.width;

        // Check if we need a new page
        if (yOffset + imgHeight > pdfHeight - margins.bottom) {
          pdf.addPage();
          yOffset = margins.top;
        }

        // Add the image to PDF
        pdf.addImage(
          canvas.toDataURL("image/jpeg", 0.95),
          "JPEG",
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
        const canvas = await html2canvas(reliabilityElement as HTMLElement, {
          scale: 1.5,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
        });

        const imgHeight = (canvas.height * contentWidth) / canvas.width;

        // Check if we need a new page
        if (yOffset + imgHeight > pdfHeight - margins.bottom) {
          pdf.addPage();
          yOffset = margins.top;
        }

        pdf.addImage(
          canvas.toDataURL("image/jpeg", 0.95),
          "JPEG",
          margins.left,
          yOffset,
          contentWidth,
          imgHeight
        );
      }

      pdf.save(`hasil-analisis-${Date.now()}.pdf`);
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
            />
          ))}

          {analysisResults?.reliabilitas_tes !== null &&
            analysisResults?.reliabilitas_tes !== undefined && (
              <ReliabilityCard
                reliabilityScore={analysisResults.reliabilitas_tes}
              />
            )}
        </div>
      </div>
    </>
  );
}
