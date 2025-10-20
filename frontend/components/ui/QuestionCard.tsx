import React from 'react';
import { QuestionResult, AnalysisResults, QuestionDistractorAnalysis, OptionAnalysis } from "@/types";

interface QuestionCardProps {
  question: QuestionResult;
  analysisResults: AnalysisResults | null;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, analysisResults }) => {
  return (
    <div className="question-card bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-4">
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
            <div className="mr-4 text-gray-700 dark:text-gray-300">{opt.option_code}</div>
            <div className="text-base">
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
        <div className="flex flex-row p-2 items-center justify-between text-lg mt-3">
          {analysisResults.tingkat_kesukaran && analysisResults.tingkat_kesukaran[question.id] !== undefined && (
            <span className="px-3 py-2 bg-green-500 text-white font-normal rounded-full">
              Kesukaran: <span>{analysisResults.tingkat_kesukaran[question.id]?.toFixed(2)}</span>
            </span>
          )}
          {analysisResults.daya_beda && analysisResults.daya_beda[question.id] !== undefined && (
            <span className="px-3 py-2 bg-green-500 text-white font-normal rounded-full">
              Daya Beda: <span>{analysisResults.daya_beda[question.id]?.toFixed(2)}</span>
            </span>
          )}
          {analysisResults.validitas_soal && analysisResults.validitas_soal[question.id] !== undefined && (
            <span className="px-3 py-2 bg-green-500 text-white font-normal rounded-full">
              Validitas: <span>{analysisResults.validitas_soal[question.id]?.toFixed(2)}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionCard;