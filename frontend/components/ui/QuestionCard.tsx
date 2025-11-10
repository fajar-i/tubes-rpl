import React from 'react';
import { QuestionResult, AnalysisResults, QuestionDistractorAnalysis, OptionAnalysis } from "@/types";
import InterpretationPopover from './InterpretationPopover';

interface QuestionCardProps {
  question: QuestionResult;
  analysisResults: AnalysisResults | null;
  index: number;
  pdfMode?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, analysisResults, index, pdfMode = false }) => {
  return (
    <div className="question-card bg-white shadow-sm border border-gray-200 rounded-lg p-4 mb-4">
      <h3 className="text-lg text-[#00A1A9] font-bold mb-2">Soal #{index + 1}</h3>
      <div className="flex flex-col mb-3">
        <div className="p-2">
          <p className="text-lg font-semibold">
            {question.text}
          </p>
        </div>
      </div>

      <ul className="list-none pl-3">
        {question.options.map((opt) => (
          <li key={opt.id} className="flex items-center mb-2">
            <div className="mr-4 text-gray-700">{opt.option_code}</div>
            <div className="text-base max-w-md text-justify">
              {opt.text}
              {opt.is_right ? (
                <span className="ml-2 px-2 py-1 text-xs font-semibold text-white bg-blue-600 rounded-full">
                  Kunci jawaban
                </span>
              ) : null}
            </div>
            {analysisResults && analysisResults.kualitas_pengecoh && analysisResults.kualitas_pengecoh[question.id] &&
              'options' in analysisResults.kualitas_pengecoh[question.id] &&
              !Array.isArray(analysisResults.kualitas_pengecoh[question.id].options) &&
              (analysisResults.kualitas_pengecoh[question.id].options as QuestionDistractorAnalysis)[opt.option_code || ''] && (
                <div className="ml-auto text-right">
                  <span className={`inline-block ml-1 px-3 py-2 font-normal text-base rounded-full
                    ${((analysisResults.kualitas_pengecoh[question.id].options as QuestionDistractorAnalysis)[opt.option_code || ''] as OptionAnalysis).quality_rating === 'Sangat Baik'
                      || ((analysisResults.kualitas_pengecoh[question.id].options as QuestionDistractorAnalysis)[opt.option_code || ''] as OptionAnalysis).quality_rating === 'Efektif' ? 'bg-green-500 text-white' :
                      ((analysisResults.kualitas_pengecoh[question.id].options as QuestionDistractorAnalysis)[opt.option_code || ''] as OptionAnalysis).quality_rating === 'Baik'
                        || ((analysisResults.kualitas_pengecoh[question.id].options as QuestionDistractorAnalysis)[opt.option_code || ''] as OptionAnalysis).quality_rating === 'Cukup Efektif' ? 'bg-yellow-400 text-gray-900' :
                        'bg-red-500 text-white'
                    }`}>
                    {(((analysisResults.kualitas_pengecoh[question.id].options as QuestionDistractorAnalysis)[opt.option_code || ''] as OptionAnalysis).effectiveness_score !== null) ? 
                      ((analysisResults.kualitas_pengecoh[question.id].options as QuestionDistractorAnalysis)[opt.option_code || ''] as OptionAnalysis).effectiveness_score!.toFixed(3) : 'N/A'} :&nbsp;
                    {((analysisResults.kualitas_pengecoh[question.id].options as QuestionDistractorAnalysis)[opt.option_code || ''] as OptionAnalysis).quality_rating}
                  </span>
                </div>
            )}
          </li>
        ))}
      </ul>

      {analysisResults && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Validitas:</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {analysisResults.validitas_soal && analysisResults.validitas_soal[question.id] !== undefined
                    ? analysisResults.validitas_soal[question.id]?.toFixed(3)
                    : "N/A"}
                </span>
                <InterpretationPopover
                  value={analysisResults.validitas_soal ? analysisResults.validitas_soal[question.id] : null}
                  type="validitas"
                  pdfMode={pdfMode}
                />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Tingkat Kesukaran:</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {analysisResults.tingkat_kesukaran && analysisResults.tingkat_kesukaran[question.id] !== undefined
                    ? analysisResults.tingkat_kesukaran[question.id]?.toFixed(3)
                    : "N/A"}
                </span>
                <InterpretationPopover
                  value={analysisResults.tingkat_kesukaran ? analysisResults.tingkat_kesukaran[question.id] : null}
                  type="tingkat_kesukaran"
                  pdfMode={pdfMode}
                />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Daya Pembeda:</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {analysisResults.daya_beda && analysisResults.daya_beda[question.id] !== undefined
                    ? analysisResults.daya_beda[question.id]?.toFixed(3)
                    : "N/A"}
                </span>
                <InterpretationPopover
                  value={analysisResults.daya_beda ? analysisResults.daya_beda[question.id] : null}
                  type="daya_pembeda"
                  pdfMode={pdfMode}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;