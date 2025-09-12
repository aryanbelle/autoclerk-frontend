import { ChevronDown, Paperclip, Send } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative bg-[#111111]">
      {/* Radial glow effect */}
      <div className="absolute inset-0 bg-gradient-radial from-[#1A1A1A] to-transparent w-full h-full scale-[2]"></div>
      
      {/* Status indicator */}
      <div className="relative z-10 mb-12">
        <div className="px-3 py-1 bg-[#1C1C1C] border border-gray-700/50 rounded-full flex items-center gap-2 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-[#00FF5F] animate-pulse"></div>
          <span className="text-xs text-[#E0E0E0] font-medium tracking-wider">READY</span>
        </div>
      </div>
      
      <div className="w-full max-w-2xl px-6 text-center relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-[#FFFFFF] mb-4 tracking-tight">
          Welcome to Your Chat Interface
        </h1>
        <p className="text-base text-[#A3A3A3] mb-12">
          This interface has been updated to match the new design system.
        </p>

        <div className="max-w-4xl mx-auto w-full border border-[#2A2A2A] rounded-3xl bg-[#1A1A1A] shadow-lg shadow-[rgba(0,0,0,0.5)] backdrop-blur-sm relative overflow-hidden">
          {/* Input area */}
          <div className="relative bg-[#1d1d1d] p-6">
            <p className="text-[#E5E5E5] text-center">The chat interface has been updated with the new dark accent color scheme.</p>
          </div>
          
          {/* Helper text */}
          <div className="flex justify-center bg-[#1d1d1d] items-center px-4 py-2 text-xs text-[#7A7A7A]">
            <span className="italic">Navigate to the main chat interface to see the updated design</span>
          </div>
        </div>
        
        {/* Suggestion buttons */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <button 
            className="px-4 py-1.5 bg-[#161616] border border-[#2A2A2A] rounded-full text-[#E0E0E0] text-xs font-medium transition-all duration-300 ease-in-out hover:bg-[#222222]"
          >
            Explore the new design
          </button>
          <button 
            className="px-4 py-1.5 bg-[#161616] border border-[#2A2A2A] rounded-full text-[#E0E0E0] text-xs font-medium transition-all duration-300 ease-in-out hover:bg-[#222222]"
          >
            Start a new chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
