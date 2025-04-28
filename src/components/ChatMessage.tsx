import React from 'react';
import { Bot, User, ArrowRight, X, HelpCircle, LineChart } from 'lucide-react';
import { categorizeDecision } from '../res'; // Import the function

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  showDecisionOptions?: boolean;
  isQuestion?: boolean;
  decisionOptions?: string[];
  optionsCount?: number;
  onContinue?: () => void;
  onCancel?: () => void;
  onShowDecision?: () => void;
  updateqLists?: (result: string[]) => void; // Add this prop
  updateopLists?: (result: string[][]) => void;
  handleNextOption?: () => void; // Add this prop
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  role, 
  content, 
  showDecisionOptions,
  decisionOptions,
  isQuestion = false,
  optionsCount = decisionOptions ? decisionOptions.length : 0,
  onContinue,
  onCancel,
  onShowDecision,
  updateqLists, 
  updateopLists,
  handleNextOption
}) => {
  const handleContinue = async () => {
    if (onContinue) {
      await onContinue(); // Call the passed onContinue function
    }

    try {
      const result = await categorizeDecision(content); // Call categorizeDecision
      console.log('Categorize Decision Result:', result);

      if (updateqLists) {
        updateqLists(result['questions']);
      }
      if (updateopLists) {
        updateopLists(result['options']);
      }

      // Call handleNextOption to push the next message
      if (handleNextOption) {
        handleNextOption();
      }
    } catch (error) {
      console.error('Error categorizing decision:', error);
    }
  };

  if (role === 'assistant' && showDecisionOptions && decisionOptions) {
    return (
      <div className="flex gap-4 bg-white p-4 rounded-lg">
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#e3a66a] text-white">
          <Bot className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="space-y-6 animate-slideIn">
            <div className="space-y-4">
              <div className="prose max-w-none">
                <p className="text-[#a48363] text-xl">{"Would you like to choose between:"}</p></div>
              {Array.from({ length: optionsCount }).map((_, index) => (
                <React.Fragment key={index}>
                  <div className="space-y-2 border-l-4 border-[#e3a66a] pl-4">
                    <h3 className="text-2xl font-semibold text-[#a48363]">{decisionOptions[index]}</h3>
                  </div>
                  {index < optionsCount - 1 && (
                    <div className="flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-[#eed8a4] bg-opacity-20 flex items-center justify-center">
                        <span className="text-[#a48363] font-bold text-xl">OR</span>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={onCancel}
                className="flex-1 border-2 border-[#a48363] text-[#a48363] py-2 px-4 rounded-lg hover:bg-[#a48363] hover:text-white transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleContinue} // Use the new handler
                className="flex-1 bg-[#e3a66a] text-white py-2 px-4 rounded-lg hover:bg-[#a48363] transition-colors duration-200 flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-4 ${role === 'assistant' ? 'bg-white' : ''} p-4 rounded-lg`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        role === 'assistant' 
          ? isQuestion 
            ? 'bg-[#DCC367]' 
            : 'bg-[#e3a66a]'
          : 'bg-[#a48363]'
      } text-white`}>
        {role === 'assistant' 
          ? isQuestion 
            ? <HelpCircle className="w-5 h-5" />
            : <Bot className="w-5 h-5" />
          : <User className="w-5 h-5" />}
      </div>
      <div className="flex-1">
        <div className="prose max-w-none">
          <p className="text-[#a48363]">{content}</p>
          {role === 'assistant' && onShowDecision && (
            <button
              onClick={onShowDecision}
              className="mt-2 flex items-center gap-2 text-[#e3a66a] hover:text-[#a48363] transition-colors duration-200"
            >
              <LineChart className="w-4 h-4" />
              View Decision Reason
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;