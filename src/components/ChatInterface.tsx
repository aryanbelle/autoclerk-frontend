import { useState, useEffect, useRef } from 'react';
import {
  TextArea,
  Button,
  Loading,
  Tile,
} from '@carbon/react';
import { IconButton } from '@carbon/react'; // Import IconButton
import {
  Send,
  Attachment,
  Microphone,
  Bot,
  User,
} from '@carbon/icons-react';
import { Send as SendIcon, Link as LinkIcon, Sparkle as SparkleIcon, HelpCircle as HelpIcon, ThumbsUp, ThumbsDown, Copy, RotateCcw, MoreHorizontal, ChevronDown, X, FileText } from 'lucide-react';
import { chatAPI, type ChatMessage as ApiChatMessage } from '@/services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChatSession, Message } from '@/contexts/ChatSessionContext';

interface ChatInterfaceProps {
  sessionId: string;
}

const ChatInterface = ({ sessionId }: ChatInterfaceProps) => {
  const { getCurrentSession, addMessageToSession } = useChatSession();
  const currentSession = getCurrentSession();
  const messages = currentSession?.messages || [];
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typingMessage, setTypingMessage] = useState<{id: string, content: string, fullContent: string} | null>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll when messages change or typing occurs
  useEffect(() => {
    scrollToBottom();
  }, [messages, typingMessage]);

  // Auto-process initial message from landing page
  useEffect(() => {
    const processInitialMessage = async () => {
      // Check if we have exactly 1 message (the initial user message) and no loading/typing
      if (messages.length === 1 && 
          messages[0].sender === 'user' && 
          !isLoading && 
          !typingMessage) {
        
        const initialMessage = messages[0];
        setIsLoading(true);
        
        try {
          const messageId = Date.now().toString();
          const fullContent = await getAIResponse(initialMessage.content);
          startTypingEffect(messageId, fullContent);
        } catch (error) {
          console.error('Error getting AI response for initial message:', error);
          setIsLoading(false);
          
          // Add error message
          const errorMessage: Message = {
            id: Date.now().toString(),
            content: "I'm sorry, I'm having trouble connecting to my AI service right now. Please try again in a moment.",
            sender: 'ai',
            timestamp: new Date(),
          };
          addMessageToSession(sessionId, errorMessage);
        }
      }
    };

    // Small delay to ensure the session is fully loaded
    const timeoutId = setTimeout(processInitialMessage, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, isLoading, typingMessage, sessionId, addMessageToSession]);

  // Convert our messages to the API format
  const convertToApiHistory = (messages: Message[]): ApiChatMessage[] => {
    return messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));
  };

  // Get AI response from backend
  const getAIResponse = async (userMessage: string): Promise<string> => {
    try {
      const history = convertToApiHistory(messages);
      const response = await chatAPI.sendMessage(userMessage, history);
      return response;
    } catch (error) {
      console.error('Failed to get AI response:', error);
      return "I'm sorry, I'm having trouble connecting to my AI service right now. Please try again in a moment.";
    }
  };

  // Typing effect function
  const startTypingEffect = (messageId: string, fullContent: string) => {
    setTypingMessage({ id: messageId, content: '', fullContent });
    
    // Improved typing effect with chunk-based rendering
    // This significantly speeds up the typing effect while still maintaining a visual indication
    const chunkSize = 20; // Process 20 characters at once
    const minDelay = 20; // Minimum delay in ms
    const maxDelay = 30; // Maximum delay in ms
    let currentIndex = 0;
    
    const typeNextChunk = () => {
      if (currentIndex < fullContent.length) {
        // Calculate next position, ensuring we don't exceed the content length
        const nextIndex = Math.min(currentIndex + chunkSize, fullContent.length);
        
        setTypingMessage(prev => prev ? {
          ...prev,
          content: fullContent.substring(0, nextIndex)
        } : null);
        
        currentIndex = nextIndex;
        
        // Vary the typing speed slightly for a more natural effect
        // Shorter delay for longer content to improve responsiveness
        const dynamicDelay = fullContent.length > 500 ? minDelay : 
                            Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
        
        setTimeout(typeNextChunk, dynamicDelay);
      } else {
        // Typing complete, add the full message to the messages array
        const aiMessage: Message = {
          id: messageId,
          content: fullContent,
          sender: 'ai',
          timestamp: new Date(),
        };
        addMessageToSession(sessionId, aiMessage);
        setTypingMessage(null);
        setIsLoading(false);
      }
    };
    
    typeNextChunk();
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() && !attachedFile) return;

    const currentInput = inputValue;
    const currentFile = attachedFile;
    
    // Create user message with document info if present
    let messageContent = currentInput;
    if (currentFile) {
      messageContent = `${currentInput}\n\n📎 Attached: ${currentFile.name} (${(currentFile.size / 1024).toFixed(1)} KB)`;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      sender: 'user',
      timestamp: new Date(),
    };

    addMessageToSession(sessionId, userMessage);
    setInputValue('');
    setAttachedFile(null);
    setIsLoading(true);

    try {
      const messageId = (Date.now() + 1).toString();
      let fullContent: string;
      
      if (currentFile) {
        // Use document analysis API
        const history = convertToApiHistory(messages);
        fullContent = await chatAPI.analyzeDocumentWithPrompt(currentFile, currentInput || "Please analyze this document", history);
      } else {
        // Use regular chat API
        fullContent = await getAIResponse(currentInput);
      }
      
      startTypingEffect(messageId, fullContent);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setIsLoading(false);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: "I'm sorry, I'm having trouble connecting to my AI service right now. Please try again in a moment.",
        sender: 'ai',
        timestamp: new Date(),
      };
      addMessageToSession(sessionId, errorMessage);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a text (.txt), PDF (.pdf), or Word (.docx) file.');
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('File size must be less than 10MB.');
      return;
    }

    setAttachedFile(file);
    // Clear the input so the same file can be selected again if needed
    event.target.value = '';
  };

  const removeAttachedFile = () => {
    setAttachedFile(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full text-[#E0E0E0] rounded-lg chat-interface-override bg-[#111111]">
      {/* Header */}
      
      <div className="flex flex-col h-full">
        {/* Messages Area */}
        <div className="h-[calc(100vh-200px)] overflow-y-auto space-y-4 p-6 relative bg-[#111111]">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.sender === 'ai' 
                  ? 'bg-[#1C1C1C] text-[#E0E0E0] border border-[#2A2A2A]' 
                  : 'bg-[#1C1C1C] text-[#E0E0E0] border border-[#2A2A2A]'
              }`}>
                {message.sender === 'ai' ? <Bot size={18} /> : <User size={18} />}
              </div>
              
              {message.sender === 'user' ? (
                <div className="max-w-2xl p-4 rounded-xl rounded-br-sm shadow-md border border-[#2A2A2A] bg-primary text-primary-foreground">
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              ) : (
                <div className="max-w-2xl">
                  <div className="p-4 prose prose-invert border border-[#2A2A2A] rounded-lg shadow-md">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                  </div>
                  <div className="flex items-center space-x-2 mt-2 ml-4">
                    <button className="text-[#7A7A7A] hover:text-[#E0E0E0] p-1 rounded hover:bg-[#222222] transition-all duration-300">
                      <ThumbsUp size={16} />
                    </button>
                    <button className="text-[#7A7A7A] hover:text-[#E0E0E0] p-1 rounded hover:bg-[#222222] transition-all duration-300">
                      <ThumbsDown size={16} />
                    </button>
                    <button className="text-[#7A7A7A] hover:text-[#E0E0E0] p-1 rounded hover:bg-[#222222] transition-all duration-300">
                      <Copy size={16} />
                    </button>
                    <button className="text-[#7A7A7A] hover:text-[#E0E0E0] p-1 rounded hover:bg-[#222222] transition-all duration-300">
                      <RotateCcw size={16} />
                    </button>
                    <button className="text-[#7A7A7A] hover:text-[#E0E0E0] p-1 rounded hover:bg-[#222222] transition-all duration-300">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {/* Typing Effect */}
          {typingMessage && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1C1C1C] text-[#E0E0E0] border border-[#2A2A2A] flex items-center justify-center">
                <Bot size={18} />
              </div>
              <div className="max-w-2xl">
                <div className="p-4 prose prose-invert bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg shadow-md">
                  <ReactMarkdown>{typingMessage.content}</ReactMarkdown>
                  <span className="animate-pulse">|</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Loading indicator at the bottom */}
          {isLoading && !typingMessage && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1C1C1C] text-[#E0E0E0] border border-[#2A2A2A] flex items-center justify-center">
                <Bot size={18} />
              </div>
              <div className="max-w-2xl">
                <div className="p-4 flex items-center bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg shadow-md">
                  <Loading withOverlay={false} small />
                  <span className="ml-2 text-sm text-[#A3A3A3]">Generating response...</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Invisible element to scroll to */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 mt-4 px-8 pb-6">
          <div className="max-w-4xl mx-auto w-full border border-[#2A2A2A] rounded-3xl bg-[#1A1A1A] shadow-lg shadow-[rgba(0,0,0,0.5)] backdrop-blur-sm relative overflow-hidden glow-container">
            {/* Subtle inner glow effect */}
            <div className="absolute inset-0 opacity-70 pointer-events-none"></div>
            {/* Input area */}
            <div className="relative bg-[#1d1d1d]">
              {/* Document type selector */}
            <div className="flex items-center border-b border-[#2A2A2A] bg-[#1d1d1d]">
              <div className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#E0E0E0] hover:bg-[#1F1F1F] cursor-pointer transition-colors">
                <span className="font-medium">Document Analysis</span>
                <ChevronDown size={14} className="text-[#888888]" />
              </div>
            </div>
            {/* Input area */}
            <div className="relative bg-[#1d1d1d]">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileChange}
                accept=".txt,.pdf,.docx"
              />
              
              {/* Attached file display */}
              {attachedFile && (
                <div className="flex items-center gap-2 p-3 bg-[#2A2A2A] border-b border-[#333333]">
                  <FileText size={16} className="text-[#00FF5F]" />
                  <span className="text-sm text-[#E0E0E0] flex-1">
                    {attachedFile.name} ({(attachedFile.size / 1024).toFixed(1)} KB)
                  </span>
                  <button
                    onClick={removeAttachedFile}
                    className="p-1 hover:bg-[#333333] rounded transition-colors"
                  >
                    <X size={14} className="text-[#888888] hover:text-[#E0E0E0]" />
                  </button>
                </div>
              )}
              
              <textarea
                id="chat-input"
                placeholder={attachedFile ? "Ask me anything about this document..." : "Type your idea and we'll build it together..."}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full h-full bg-transparent text-[#E5E5E5] border-none focus:ring-0 focus:outline-none resize-none overflow-hidden p-4 placeholder-[#6B6B6B]"
                rows={2}
              />
              
              {/* Action buttons */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                <button
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1A1A1A] text-[#E0E0E0] border border-[#2A2A2A] shadow-lg shadow-[rgba(42,42,42,0.3)] hover:bg-[#2A2A2A] hover:shadow-[rgba(42,42,42,0.5)] transition-all duration-300 ease-in-out"
                >
                  <Attachment size={18} />
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={(!inputValue.trim() && !attachedFile) || isLoading}
                  className={`flex items-center justify-center w-10 h-10 rounded-full text-white shadow-lg shadow-[rgba(42,42,42,0.3)] hover:shadow-[rgba(42,42,42,0.5)] transition-all duration-300 ease-in-out ${
                    (!inputValue.trim() && !attachedFile) || isLoading 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : 'bg-[hsl(215,100%,50%)] hover:bg-[hsl(215,100%,45%)]'
                  }`}
                >
                  <SendIcon size={18} />
                </button>
              </div>
            </div>
            
            {/* Helper text and character count */}
            <div className="flex justify-between bg-[#1d1d1d] items-center px-4 py-2 text-xs text-[#7A7A7A]">
              <span className="italic">Press Enter to send, Shift+Enter for new line</span>
              <span>{inputValue.length}/2000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default ChatInterface;