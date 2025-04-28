import React from 'react';
import { X } from 'lucide-react';

interface DecisionGraphProps {
  onClose: () => void;
  reason: string | null; // Add a prop for the reason
}

const DecisionGraph: React.FC<DecisionGraphProps> = ({ onClose, reason }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-3/4 h-3/4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-[#a48363]">Decision Process</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#eed8a4] hover:bg-opacity-20 rounded-full transition-colors duration-200"
          >
            <X className="w-6 h-6 text-[#a48363]" />
          </button>
        </div>
        
        <div className="h-full overflow-y-auto">
          <div className="bg-[#eed8a4] bg-opacity-10 rounded-lg p-4 h-full flex items-center justify-center">
            {reason ? (
              <p className="text-[#a48363] text-lg">{reason}</p> // Display the reason
            ) : (
              <p className="text-[#a48363]">Loading decision visualization...</p> // Fallback text
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DecisionGraph;