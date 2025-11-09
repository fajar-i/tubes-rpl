import React from 'react';

interface ReliabilityCardProps {
  reliabilityScore: number;
}

const ReliabilityCard: React.FC<ReliabilityCardProps> = ({ reliabilityScore }) => {
  return (
    <div className="reliability-card bg-white shadow-sm border border-gray-200 rounded-lg p-4 mt-4">
      <h5 className="text-xl font-semibold mb-2">Reliabilitas Tes (Cronbach&apos; Alpha):</h5>
      <p className="text-2xl font-bold">
        &alpha; = {reliabilityScore.toFixed(3)}
      </p>
      <p className="text-gray-500">
        *Nilai &alpha; yang baik biasanya {'>'} 0.7, {'>'} 0.8 lebih baik lagi.
      </p>
    </div>
  );
};

export default ReliabilityCard;