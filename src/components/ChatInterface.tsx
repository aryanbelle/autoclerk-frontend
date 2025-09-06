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
import { Send as SendIcon, Link as LinkIcon, Sparkle as SparkleIcon, HelpCircle as HelpIcon, ThumbsUp, ThumbsDown, Copy, RotateCcw, MoreHorizontal } from 'lucide-react';
import { chatAPI, type ChatMessage as ApiChatMessage } from '@/services/api';
import ReactMarkdown from 'react-markdown';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll when messages change or typing occurs
  useEffect(() => {
    scrollToBottom();
  }, [messages, typingMessage]);

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
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    const currentInput = inputValue;
    addMessageToSession(sessionId, userMessage);
    setInputValue('');
    setIsLoading(true);

    try {
      // Get AI response from backend
      const messageId = (Date.now() + 1).toString();
      const fullContent = await getAIResponse(currentInput);
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full text-foreground rounded-lg chat-interface-override">
      {/* Header */}
      
      <div className="flex flex-col h-full">
        {/* Messages Area */}
        <div className="h-[calc(100vh-200px)] overflow-y-auto space-y-4 p-6 relative">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.sender === 'ai' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-primary text-primary-foreground'
              }`}>
                {message.sender === 'ai' ? <Bot size={18} /> : <User size={18} />}
              </div>
              
              {message.sender === 'user' ? (
                <div className="max-w-2xl p-4 rounded-lg shadow-md border border-border" style={{backgroundColor: '#0f62fe', color: '#ffffff'}}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              ) : (
                <div className="max-w-2xl">
                  <div className="p-4 prose prose-invert">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                  <div className="flex items-center space-x-2 mt-2 ml-4">
                    <button className="text-muted-foreground hover:text-foreground p-1 rounded">
                      <ThumbsUp size={16} />
                    </button>
                    <button className="text-muted-foreground hover:text-foreground p-1 rounded">
                      <ThumbsDown size={16} />
                    </button>
                    <button className="text-muted-foreground hover:text-foreground p-1 rounded">
                      <Copy size={16} />
                    </button>
                    <button className="text-muted-foreground hover:text-foreground p-1 rounded">
                      <RotateCcw size={16} />
                    </button>
                    <button className="text-muted-foreground hover:text-foreground p-1 rounded">
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
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <Bot size={18} />
              </div>
              <div className="max-w-2xl">
                <div className="p-4 prose prose-invert">
                  <ReactMarkdown>{typingMessage.content}</ReactMarkdown>
                  <span className="animate-pulse">|</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Loading indicator at the bottom */}
          {isLoading && !typingMessage && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <Bot size={18} />
              </div>
              <div className="max-w-2xl">
                <div className="p-4 flex items-center">
                  <Loading withOverlay={false} small />
                  <span className="ml-2 text-sm">Generating response...</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Invisible element to scroll to */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 mt-4 px-8 pb-6">
          <div className="max-w-4xl mx-auto w-full rounded-lg p-4 bg-secondary/20 border-secondary-foreground shadow-lg relative min-h-[120px]">
            <textarea
              id="chat-input"
              placeholder="Type your idea and we'll build it together..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full h-full !bg-transparent !text-foreground !border-none focus:!ring-0 focus:!border-none focus:outline-none resize-none overflow-hidden pl-2 pr-12 pt-2 pb-8"
              rows={1}
            />
            
            <IconButton
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              renderIcon={SendIcon} // Using SendIcon from Lucide React
              // iconDescription="Send message"
              tooltipPosition="none"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0 w-12 h-2 flex items-center justify-center rounded-full z-10"
            />
            
            <div className="flex items-center space-x-3 absolute bottom-2 left-3">
              <button
                className="text-muted-foreground hover:text-foreground hover:bg-secondary/50 p-0 w-6 h-6 flex items-center justify-center rounded-full"
              >
                <LinkIcon size={16} />
              </button>
              <button
                className="text-muted-foreground hover:text-foreground hover:bg-secondary/50 p-0 w-6 h-6 flex items-center justify-center rounded-full"
              >
                <SparkleIcon size={16} />
              </button>
              <button
                className="text-muted-foreground hover:text-foreground hover:bg-secondary/50 p-0 w-6 h-6 flex items-center justify-center rounded-full"
              >
                <HelpIcon size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;