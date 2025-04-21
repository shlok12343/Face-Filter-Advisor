import React from 'react';
import { X } from 'lucide-react';

interface DecisionPopupProps {
  onClose: () => void;
  onContinue: () => void;
}

const DecisionPopup: React.FC<DecisionPopupProps> = ({ onClose, onContinue }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative animate-slideIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-[#a48363]">First Option</h3>
            <p className="text-gray-600">This is the first potential path forward.</p>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-[#a48363]">Second Option</h3>
            <p className="text-gray-600">This is the second potential path forward.</p>
          </div>
          
          <button
            onClick={onContinue}
            className="w-full bg-[#e3a66a] text-white py-2 px-4 rounded-lg hover:bg-[#a48363] transition-colors duration-200"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default DecisionPopup;