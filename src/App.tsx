import React, { useState, useEffect, useRef } from 'react';
import { Send, PenSquare, MessageSquare, Trash2 } from 'lucide-react';
import ChatMessage from './components/ChatMessage';
import DecisionGraph from './components/DecisionGraph';
import Options from './components/Options';
import { isDecision, getAnswer } from './res';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  showDecisionOptions?: boolean;
  decisionOptions?: string[];
  isQuestion?: boolean;
  optionsCount?: number;
  userOptions?: string[];
  userspros?: string[];
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
  const [decisionReason, setDecisionReason] = useState<string | null>(null); // Add state to store the reason
  const containsDecisionKeywordRef = useRef(false);
  const containsFinalKeywordRef = useRef(false);
  const qlist = useRef<string[]>([]);
  const olist = useRef<string[][]>([]);
  let usersanswers = useRef<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null); // Ref for the messages container

  const updateqLists = (result: string[]) => {
    console.log("Update lists called with result:", result);
    qlist.current = result;
    console.log("Updated qlist:", qlist.current);
  };

  const updateopLists = (result: string[][]) => {
    console.log("Update lists called with result:", result);
    olist.current = result;
    console.log("Updated olist:", olist.current);
  };

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

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chats]); // Trigger when chats update

  const currentChat = chats.find(chat => chat.id === currentChatId);
  const messages = currentChat?.messages || [];

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: []
    };

    // reset all useref variables
    containsDecisionKeywordRef.current = false;
    containsFinalKeywordRef.current = false;
    qlist.current = [];
    olist.current = [];
    usersanswers.current = [];
    
    
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

    if (!containsDecisionKeywordRef.current) {
      try {
        decision = await isDecision(input);
        console.log("Input:", input);
        console.log("Decision result:", decision);

        if (decision === "Only help with decisions") {
          containsDecisionKeywordRef.current = false;
        } else {
          usersanswers.current.push(decision);
          containsDecisionKeywordRef.current = true;
          decisionList = decision.split(',').map(item => item.trim());
          console.log("Decision result as list:", decisionList);
          console.log("Contains decision keyword:", containsDecisionKeywordRef.current);
        }
      } catch (error) {
        console.error("Error determining if input is a decision:", error);
        containsDecisionKeywordRef.current = false;
      }
    }

    const containsQuestionKeyword = input.toLowerCase().includes('question');

    const newMessage: Message = { role: 'user', content: input };
    const messages = [newMessage];

    console.log('containsDecisionKeywordRef', containsDecisionKeywordRef.current);
    console.log('olist', olist.current);
    console.log('qlist', qlist.current);
    console.log('decisionList', decisionList);


    if (containsDecisionKeywordRef.current && qlist.current.length == 0 && olist.current.length == 0 && !containsFinalKeywordRef.current) {
      messages.push({
        role: 'assistant',
        content: decision,
        showDecisionOptions: true,
        decisionOptions: decisionList,
        isQuestion: false,
      });
      setIsDecisionPending(true);
    } else if (containsDecisionKeywordRef.current && qlist.current.length > 0) {
      usersanswers.current.push(input);
      console.log("User's answers:", usersanswers.current);
      let nextQuestion = qlist.current.length > 0 ? qlist.current.shift()! : 'All options have been processed.';// Fallback value if qlist is empty
      if (qlist.current.length == 0) {
        containsFinalKeywordRef.current = true;
      }
      usersanswers.current.push(nextQuestion);
      messages.push({
        role: 'assistant',
        content: nextQuestion,
        showOptions: false,
        isQuestion: true,
      });
      setIsOptionsPending(false);
    } else if (containsFinalKeywordRef.current) {
      usersanswers.current.push(input);
      console.log("User's answers:", usersanswers.current);
      let finalDecision = {
        answer: '',
        reasoning: '',
      };
      let answer = '';
      let reason = '';
      try {
        const combinedAnswers = usersanswers.current.join(' ');
        finalDecision = await getAnswer(combinedAnswers);
        answer = finalDecision['answer'];
        reason = finalDecision['reasoning'];
        setDecisionReason(reason); // Store the reason in state
        console.log("Combined answers:", combinedAnswers);
        console.log("Final decision result:", finalDecision);
      } catch (error) {
        console.error("Error getting final decision:", error);
      }
      messages.push({
        role: 'assistant',
        content: answer,
        showDecisionGraph: true,
      });
      containsFinalKeywordRef.current = false;
      containsDecisionKeywordRef.current = false;
      qlist.current = [];
      olist.current = [];
      usersanswers.current = [];
    } else {
      messages.push({
        role: 'assistant',
        content: "We’re here ONLY to help with decisions and choices. Is there a decision or choice you’re currently facing that you’d like to ask us about? Thanks!",
        showDecisionOptions: false,
        isQuestion: containsQuestionKeyword,
      });
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
              content: "Let's help you make a decision .... loading ....",
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

    containsDecisionKeywordRef.current = false;

  };

  const handleOptionSelect = (userChoice: string) => {
    if (!currentChatId) return;

    usersanswers.current.push(userChoice);
    console.log("User's answers:", usersanswers.current);

    // Step 1: Update the last message to show the selected option
    const updatedChats = chats.map(chat => {
      if (chat.id === currentChatId) {
        const updatedMessages = chat.messages.map((msg, index) => {
          if (index === chat.messages.length - 1) {
            return {
              ...msg,
              showOptions: false, // Remove options UI
              content: `Selected Option: ${userChoice}`, // Update content with selected option
            };
          }
          return msg;
        });
        return { ...chat, messages: updatedMessages };
      }
      return chat;
    });

    setChats(updatedChats);

    // Step 3: Add a delay before showing the next set of options
    setTimeout(() => {
      if (olist.current.length > 0) {
        const nextOptions = olist.current[0];
        const optionsCount = nextOptions.length;

        // Remove the first set of options from olist
        olist.current = olist.current.slice(1);

        // Push the next options message
        const nextOptionsMessage: Message = {
          role: 'assistant',
          content: '',
          userOptions: nextOptions,
          showOptions: true,
          optionsCount,
        };

        const updatedChatsWithNextOptions = updatedChats.map(chat => {
          if (chat.id === currentChatId) {
            return {
              ...chat,
              messages: [...chat.messages, nextOptionsMessage],
            };
          }
          return chat;
        });

        setChats(updatedChatsWithNextOptions);
        setIsOptionsPending(true);
      } else {
        let nextQuestion = qlist.current.length > 0 ? qlist.current.shift()!
          : 'All options have been processed.';

        usersanswers.current.push("these are question the users answered");
        usersanswers.current.push(nextQuestion);
        const startQuestions: Message = {
          role: 'assistant',
          content: nextQuestion,
          showOptions: false,
          isQuestion: true,
        };

        const updatedChatsWithstartQuestions = updatedChats.map(chat => {
          if (chat.id === currentChatId) {
            return {
              ...chat,
              messages: [...chat.messages, startQuestions],
            };
          }
          return chat;
        });

        setChats(updatedChatsWithstartQuestions);
        setIsOptionsPending(false);
      }
    }, 50); // Add a 500ms delay before showing the next set of options
  };

  const handleNextOption = (userChoice?: string) => {
    if (!currentChatId) return;

    if (userChoice) {
      console.log(`User selected: ${userChoice}`);
    }

    const updatedChats = chats.map((chat) => {
      if (chat.id === currentChatId) {
        // Remove the last message (options message) from the chat
        const updatedMessages = chat.messages.slice(0, -1);

        if (olist.current.length > 0) {
          const nextOptions = olist.current[0];
          const optionsCount = nextOptions.length;

          // Remove the first set of options from olist
          olist.current = olist.current.slice(1);

          // Push the next options message
          const nextOptionsMessage: Message = {
            role: 'assistant',
            content: '',
            userOptions: nextOptions,
            showOptions: true,
            optionsCount,
          };

          return {
            ...chat,
            messages: [...updatedMessages, nextOptionsMessage],
          };
        } else {
          // If no more options, push a final message
          const startQuestions: Message = {
            role: 'assistant',
            content: 'All options have been processed',
            showOptions: false,
            isQuestion: true,
          };

          return {
            ...chat,
            messages: [...updatedMessages, startQuestions],
          };
        }
      }
      return chat;
    });

    setChats(updatedChats);
    setIsOptionsPending(olist.current.length > 0);
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
            disabled={containsDecisionKeywordRef.current} // Disable button if containsDecisionKeywordRef is true
            className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-200 ${
              containsDecisionKeywordRef.current
                ? 'bg-gray-400 cursor-not-allowed' // Disabled state styling
                : 'bg-[#e3a66a] hover:bg-[#eed8a4] hover:text-[#a48363]' // Enabled state styling
            }`}
          >
            <PenSquare className="w-5 h-5" />
          </button>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-[#eed8a4] text-[#a48363] rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            {containsDecisionKeywordRef.current ? 'Complete current decision first' : 'New Chat'}
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
              <p>Ask us about a decision or choice you want help making</p>
            </div>
          ) : (
            messages.map((message, index) =>
              message.showOptions ? (
                <Options
                  key={index}
                  userOptions={message.userOptions}
                  optionsCount={message.optionsCount || 2}
                  onSelectOption={(userChoice) => {
                    handleOptionSelect(userChoice);
                  }}
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
                  updateqLists={updateqLists}
                  updateopLists={updateopLists}
                  handleNextOption={handleNextOption}
                />
              )
            )
          )}
          {/* Add a div to act as the scroll target */}
          <div ref={messagesEndRef} />
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
        <DecisionGraph
          onClose={() => setShowDecisionGraph(false)}
          reason={decisionReason} // Pass the reason as a prop
        />
      )}
    </div>
  );
}

export default App;