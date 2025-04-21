import React from 'react';
import { ArrowRight } from 'lucide-react';

interface DecisionOptionsProps {
  onContinue: () => void;
}

const DecisionOptions: React.FC<DecisionOptionsProps> = ({ onContinue }) => {
  return (
    <div className="bg-white rounded-lg p-6 space-y-6 animate-slideIn">
      <div className="space-y-4">
        <div className="space-y-2 border-l-4 border-[#e3a66a] pl-4">
          <h3 className="text-xl font-semibold text-[#a48363]">First Option</h3>
        </div>
        
        <div className="flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-[#eed8a4] bg-opacity-20 flex items-center justify-center">
            <span className="text-[#a48363] font-bold text-xl">OR</span>
          </div>
        </div>
        
        <div className="space-y-2 border-l-4 border-[#a48363] pl-4">
          <h3 className="text-xl font-semibold text-[#a48363]">Second Option</h3>
        </div>
      </div>
      
      <button
        onClick={onContinue}
        className="w-full bg-[#e3a66a] text-white py-2 px-4 rounded-lg hover:bg-[#a48363] transition-colors duration-200 flex items-center justify-center gap-2"
      >
        Continue
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default DecisionOptions;