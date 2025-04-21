import React from 'react';
import { Bot } from 'lucide-react';

interface OptionsProps {
  optionsCount: number;
  onSelectOption: (option: number) => void;
}

const Options: React.FC<OptionsProps> = ({ optionsCount, onSelectOption }) => {
  return (
    <div className="flex gap-4 bg-white p-4 rounded-lg">
      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#e3a66a] text-white">
        <Bot className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="space-y-4 animate-slideIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.from({ length: optionsCount }).map((_, index) => (
              <button
                key={index}
                onClick={() => onSelectOption(index + 1)}
                className="p-4 border-2 border-[#e3a66a] rounded-lg hover:bg-[#e3a66a] hover:text-white transition-colors duration-200 text-[#a48363] font-semibold"
              >
                Option {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Options