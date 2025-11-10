import React from 'react';
import InterpretationPopover from './InterpretationPopover';

interface ReliabilityCardProps {
  reliabilityScore: number;
  pdfMode?: boolean;
}

const ReliabilityCard: React.FC<ReliabilityCardProps> = ({ reliabilityScore, pdfMode = false }) => {
  return (
    <div className="reliability-card bg-white shadow-sm border border-gray-200 rounded-lg p-4 mt-4">
      <h5 className="text-xl font-semibold mb-2">Reliabilitas Tes (Cronbach&apos;s Alpha)</h5>
      <div className="flex items-center gap-3">
        <p className="text-2xl font-bold">
          &alpha; = {reliabilityScore.toFixed(3)}
        </p>
        <InterpretationPopover
          value={reliabilityScore}
          type="reliabilitas"
          pdfMode={pdfMode}
        />
      </div>
      <p className="text-gray-500 mt-3">
        *Nilai &alpha; yang baik biasanya {'>'} 0.7, {'>'} 0.9 lebih baik lagi.
      </p>
    </div>
  );
};

export default ReliabilityCard;