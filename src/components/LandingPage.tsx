import { useState, useEffect } from 'react';
import {
  TextInput,
  Button,
} from '@carbon/react';
import { IconButton } from '@carbon/react';
import {
  Send,
  Attachment,
  Code,
  LogoGithub,
} from '@carbon/icons-react';
import { Send as SendIcon, Link as LinkIcon, Sparkle as SparkleIcon, HelpCircle as HelpIcon } from 'lucide-react';

interface LandingPageProps {
  onStartChat: (initialMessage: string) => void;
}

const LandingPage = ({ onStartChat }: LandingPageProps) => {
  const [inputValue, setInputValue] = useState('');

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

  return (
    <div className="min-h-screen flex items-center justify-center relative space-bg">
      <div className="w-full max-w-2xl px-6 text-center relative z-10">
        <h1 className="text-5xl font-bold text-white mb-4 text-glow">
          What should we build today?
        </h1>
        <p className="text-xl text-white/80 mb-12">
          Create stunning apps & websites by chatting with AI.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="max-w-4xl mx-auto w-full border border-white/20 rounded-lg p-3 bg-white/10 backdrop-blur-sm shadow-lg relative min-h-[120px]">
            <textarea
              id="main-input"
              placeholder="Type your idea and we'll build it together..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full h-full !bg-transparent !text-white !border-none focus:!ring-0 focus:!border-none focus:outline-none resize-none overflow-hidden pl-2 pr-12 pt-2 pb-8 placeholder-white/60"
              rows={1}
            />
            
            <IconButton
              onClick={handleSubmit}
              disabled={!inputValue.trim()}
              renderIcon={SendIcon}
              tooltipPosition="none"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0 w-12 h-8 flex items-center justify-center rounded-full z-10"
              style={{backgroundColor: '#0f62fe', color: '#ffffff'}}
            />
            
            <div className="flex items-center space-x-3 absolute bottom-2 left-3">
              <button
                className="text-white/60 hover:text-white hover:bg-white/20 p-0 w-6 h-6 flex items-center justify-center rounded-full"
              >
                <LinkIcon size={16} />
              </button>
              <button
                className="text-white/60 hover:text-white hover:bg-white/20 p-0 w-6 h-6 flex items-center justify-center rounded-full"
              >
                <SparkleIcon size={16} />
              </button>
              <button
                className="text-white/60 hover:text-white hover:bg-white/20 p-0 w-6 h-6 flex items-center justify-center rounded-full"
              >
                <HelpIcon size={16} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LandingPage;