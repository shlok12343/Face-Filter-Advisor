import React, { useState, useEffect, useRef } from 'react';
import { Send, PenSquare, MessageSquare, Trash2 } from 'lucide-react';
import ChatMessage from './components/ChatMessage';
import DecisionGraph from './components/DecisionGraph';
import Options from './components/Options';
import { isDecision } from './res';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  showDecisionOptions?: boolean;
  decisionOptions?: string[];
  isQuestion?: boolean;
  optionsCount?: number;
  showOptions?: boolean;
  showDecisionGraph?: boolean;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
}

function App() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [showDecisionGraph, setShowDecisionGraph] = useState(false);
  const [isDecisionPending, setIsDecisionPending] = useState(false);
  const [isOptionsPending, setIsOptionsPending] = useState(false);
  const containsDecisionKeywordRef = useRef(false);
  const [questionList, setquestionList] = useState<string[]>([]);

  


  useEffect(() => {
    if (chats.length === 0) {
      const initialChat: Chat = {
        id: Date.now().toString(),
        title: 'New Chat',
        messages: []
      };
      setChats([initialChat]);
      setCurrentChatId(initialChat.id);
    }
  }, []);

  const currentChat = chats.find(chat => chat.id === currentChatId);
  const messages = currentChat?.messages || [];

  const createNewChat = () => {
    
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: []
    };
    setChats([newChat, ...chats]);
    setCurrentChatId(newChat.id);
    setInput('');
  };

  const deleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedChats = chats.filter(chat => chat.id !== chatId);
    setChats(updatedChats);
    
    if (chatId === currentChatId) {
      setCurrentChatId(updatedChats[0]?.id || null);
    }

    if (updatedChats.length === 0) {
      const newChat: Chat = {
        id: Date.now().toString(),
        title: 'New Chat',
        messages: []
      };
      setChats([newChat]);
      setCurrentChatId(newChat.id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentChatId || isDecisionPending || isOptionsPending) return;

    let decision = '';
    let decisionList: string[] = [];

    try {
      decision = await isDecision(input);
      console.log("Input:", input);
      console.log("Decision result:", decision);
      

      if (decision === "Only help with decisions"){
        containsDecisionKeywordRef.current = false;
      }
      else {
        containsDecisionKeywordRef.current = true; 
        decisionList = decision.split(',').map(item => item.trim());
        console.log("Decision result as list:", decisionList);
        console.log("Contains decision keyword:", containsDecisionKeywordRef.current);
      }
    } catch (error) {
      console.error("Error determining if input is a decision:", error);
      containsDecisionKeywordRef.current = false;
    }

    const containsFinalKeyword = input.toLowerCase().includes('final');
    const containsQuestionKeyword = input.toLowerCase().includes('question');

    const optionsMatch = input.toLowerCase().match(/option\s+(\d+)/);
    const optionsCount = optionsMatch ? parseInt(optionsMatch[1], 10) : null;

    const newMessage: Message = { role: 'user', content: input };
    const messages = [newMessage];

    if (containsDecisionKeywordRef.current) {
      messages.push({
        role: 'assistant',
        content: decision,
        showDecisionOptions: true,
        decisionOptions: decisionList,
        isQuestion: false,
      });
      setIsDecisionPending(true);
    } else if (optionsCount !== null) {
      messages.push({
        role: 'assistant',
        content: '',
        showOptions: true,
        optionsCount,
      });
      setIsOptionsPending(true);
    } else if (containsFinalKeyword) {
      messages.push({
        role: 'assistant',
        content: 'Best choice is...',
        showDecisionGraph: true,
      });
    } else {
      messages.push({
        role: 'assistant',
        content: decision,
        showDecisionOptions: false,
        isQuestion: containsQuestionKeyword,
      }
    );
    }

    const updatedChats = chats.map((chat) => {
      if (chat.id === currentChatId) {
        return {
          ...chat,
          messages: [...chat.messages, ...messages],
          title: chat.messages.length === 0 ? input.slice(0, 30) : chat.title
        };
      }
      return chat;
    });

    setChats(updatedChats);
    setInput('');
  };

  const handleDecisionContinue = () => {
    setIsDecisionPending(false);
    const updatedChats = chats.map(chat => {
      if (chat.id === currentChatId) {
        const updatedMessages = chat.messages.map((msg, index) => {
          if (index === chat.messages.length - 1) {
            return {
              ...msg,
              showDecisionOptions: false,
              content: "Let's help you make a decision."
            };
          }
          return msg;
        });
        return { ...chat, messages: updatedMessages };
      }
      return chat;
    });
    setChats(updatedChats);
  };

  const handleDecisionCancel = () => {
    setIsDecisionPending(false);
    const updatedChats = chats.map(chat => {
      if (chat.id === currentChatId) {
        return {
          ...chat,
          messages: chat.messages.slice(0, -2)
        };
      }
      return chat;
    });
    setChats(updatedChats);
  };

  const handleOptionSelect = (optionNumber: number) => {
    setIsOptionsPending(false);
    const updatedChats = chats.map(chat => {
      if (chat.id === currentChatId) {
        const updatedMessages = chat.messages.map((msg, index) => {
          if (index === chat.messages.length - 1) {
            return {
              ...msg,
              showOptions: false,
              content: `Selected Option ${optionNumber}`
            };
          }
          return msg;
        });
        return { ...chat, messages: updatedMessages };
      }
      return chat;
    });
    setChats(updatedChats);
  };

  return (
    <div className="flex h-screen bg-[#eed8a4] bg-opacity-10">
      <div className="w-64 bg-[#a48363] text-white p-4 flex flex-col">
        <div className="flex items-center gap-3 mb-2">
          <div className="relative">
            <div className="w-10 h-10 bg-[#e3a66a] rounded-full flex items-center justify-center relative">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-8 h-8 text-white"
              >
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
              </svg>
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold">Decision AI</h1>
            <p className="text-sm text-[#eed8a4] italic">Teaching AI to ask the right questions</p>
          </div>
        </div>
        
        <div className="group relative w-10 mt-1 mb-2">
          <button
            onClick={createNewChat}
            className="flex items-center justify-center w-10 h-10 bg-[#e3a66a] hover:bg-[#eed8a4] hover:text-[#a48363] transition-colors duration-200 rounded-lg"
          >
            <PenSquare className="w-5 h-5" />
          </button>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-[#eed8a4] text-[#a48363] rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            New Chat
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {chats.map(chat => (
            <button
              key={chat.id}
              onClick={() => setCurrentChatId(chat.id)}
              className={`w-full text-left p-3 rounded-lg flex items-center gap-2 transition-colors duration-200 border group ${
                currentChatId === chat.id
                  ? 'bg-[#eed8a4] text-[#a48363] border-[#a48363]'
                  : 'border-[#eed8a4] border-opacity-30 hover:bg-[#eed8a4] hover:bg-opacity-20 hover:border-opacity-50'
              }`}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              <span className="truncate flex-1">{chat.title}</span>
              <Trash2 
                className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-red-500 ${
                  currentChatId === chat.id ? 'text-[#a48363]' : 'text-[#eed8a4]'
                }`}
                onClick={(e) => deleteChat(chat.id, e)}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#a48363]">
              <MessageSquare className="w-16 h-16 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Start the Conversation</h2>
              <p>Ask your first question below</p>
            </div>
          ) : (
            messages.map((message, index) => (
              message.showOptions ? (
                <Options
                  key={index}
                  optionsCount={message.optionsCount || 2}
                  onSelectOption={handleOptionSelect}
                />
              ) : (
                <ChatMessage
                  key={index}
                  role={message.role}
                  content={message.content}
                  showDecisionOptions={message.showDecisionOptions}
                  isQuestion={message.isQuestion}
                  decisionOptions={message.decisionOptions}
                  optionsCount={message.optionsCount}
                  onContinue={message.showDecisionOptions ? handleDecisionContinue : undefined}
                  onCancel={message.showDecisionOptions ? handleDecisionCancel : undefined}
                  onShowDecision={message.showDecisionGraph ? () => setShowDecisionGraph(true) : undefined}
                />
              )
            ))
          )}
        </div>

        <div className="border-t border-[#e3a66a] bg-white p-4">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isDecisionPending || isOptionsPending ? "Please make a selection first..." : "Ask a question..."}
              className="flex-1 p-2 border border-[#e3a66a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e3a66a]"
              disabled={isDecisionPending || isOptionsPending}
            />
            <button
              type="submit"
              disabled={isDecisionPending || isOptionsPending}
              className={`text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 ${
                isDecisionPending || isOptionsPending
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-[#e3a66a] hover:bg-[#a48363]'
              }`}
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </form>
        </div>
      </div>

      {showDecisionGraph && (
        <DecisionGraph onClose={() => setShowDecisionGraph(false)} />
      )}
    </div>
  );
}

export default App;