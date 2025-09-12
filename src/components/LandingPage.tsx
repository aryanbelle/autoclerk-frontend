import { useState, useEffect } from 'react';
import { IconButton } from '@carbon/react';
import { ChevronDown, Paperclip, Send } from 'lucide-react';

interface LandingPageProps {
  onStartChat: (initialMessage: string) => void;
}

const LandingPage = ({ onStartChat }: LandingPageProps) => {
  const [inputValue, setInputValue] = useState('');
  const [charCount, setCharCount] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onStartChat(inputValue);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setCharCount(value.length);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative bg-[#000000]">
      {/* Radial glow effect */}
      <div className="absolute inset-0 bg-gradient-radial from-[#111111] to-transparent w-full h-full scale-[2]"></div>
      
      {/* Status indicator */}
      <div className="relative z-10 mb-12">
        <div className="px-3 py-1 bg-[#1C1C1C] border border-gray-700/50 rounded-full flex items-center gap-2 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-[#00FF5F] animate-pulse"></div>
          <span className="text-xs text-[#E0E0E0] font-medium tracking-wider">READY</span>
        </div>
      </div>
      
      <div className="w-full max-w-2xl px-6 text-center relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-[#FFFFFF] mb-4 tracking-tight">
          What can I help you with today?
        </h1>
        <p className="text-base text-[#A3A3A3] mb-12">
          Select a mode and describe what you'd like to automate. I'll handle the rest with precision.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="max-w-4xl mx-auto w-full border border-[#2A2A2A] rounded-3xl bg-[#1A1A1A] shadow-lg shadow-[rgba(0,0,0,0.5)] backdrop-blur-sm relative overflow-hidden glow-container">
            {/* Subtle inner glow effect */}
            <div className="absolute inset-0 opacity-70 pointer-events-none"></div>
            {/* Document type selector */}
            <div className="flex items-center border-b border-[#2A2A2A] bg-[#1d1d1d]">
              <div className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#E0E0E0] hover:bg-[#1F1F1F] cursor-pointer transition-colors">
                <span className="font-medium">Document Analysis</span>
                <ChevronDown size={14} className="text-[#888888]" />
              </div>
            </div>
            
            {/* Input area */}
            <div className="relative bg-[#1d1d1d]">
              <textarea
                id="main-input"
                placeholder="Describe your document analysis needs..."
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                className="w-full h-full bg-transparent text-[#E5E5E5] border-none focus:ring-0 focus:outline-none resize-none overflow-hidden p-4 placeholder-[#6B6B6B]"
                rows={2}
              />
              
              {/* Action buttons */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                <button className="p-2 text-[#A0A0A0] hover:text-[#FFFFFF] transition-colors duration-200">
                  <Paperclip size={18} />
                </button>
                <button
                  type="submit"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-[hsl(215,100%,50%)] text-white shadow-lg shadow-[rgba(42,42,42,0.3)] hover:bg-[hsl(215,100%,45%)] hover:shadow-[rgba(42,42,42,0.5)] transition-all duration-300 ease-in-out"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
            
            {/* Helper text and character count */}
            <div className="flex justify-between bg-[#1d1d1d] items-center px-4 py-2 text-xs text-[#7A7A7A]">
              <span className="italic">Press Enter to send, Shift+Enter for new line</span>
              <span>{charCount}/2000</span>
            </div>
          </div>
          
          {/* Suggestion buttons */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <button 
              onClick={() => onStartChat("Analyze this contract for risks")} 
              className="px-4 py-1.5 bg-[#161616] border border-[#2A2A2A] rounded-full text-[#E0E0E0] text-xs font-medium transition-all duration-300 ease-in-out hover:bg-[#222222]"
            >
              Analyze this contract for risks
            </button>
            <button 
              onClick={() => onStartChat("Extract key data from invoices")}
              className="px-4 py-1.5 bg-[#161616] border border-[#2A2A2A] rounded-full text-[#E0E0E0] text-xs font-medium transition-all duration-300 ease-in-out hover:bg-[#222222]"
            >
              Extract key data from invoices
            </button>
            <button 
              onClick={() => onStartChat("Summarize quarterly reports")}
              className="px-4 py-1.5 bg-[#161616] border border-[#2A2A2A] rounded-full text-[#E0E0E0] text-xs font-medium transition-all duration-300 ease-in-out hover:bg-[#222222]"
            >
              Summarize quarterly reports
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LandingPage;