import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatSessionContextType {
  sessions: ChatSession[];
  currentSessionId: string | null;
  createSession: (initialMessage?: string) => string;
  updateSession: (sessionId: string, updates: Partial<ChatSession>) => void;
  deleteSession: (sessionId: string) => void;
  renameSession: (sessionId: string, newTitle: string) => void;
  setCurrentSessionId: (sessionId: string | null) => void;
  getCurrentSession: () => ChatSession | undefined;
  addMessageToSession: (sessionId: string, message: Message) => void;
  clearSessions: () => void;
  isNewBrowserSession: boolean;
}

const ChatSessionContext = createContext<ChatSessionContextType | undefined>(undefined);

export const useChatSession = () => {
  const context = useContext(ChatSessionContext);
  if (!context) {
    throw new Error('useChatSession must be used within a ChatSessionProvider');
  }
  return context;
};

interface ChatSessionProviderProps {
  children: ReactNode;
}

export const ChatSessionProvider = ({ children }: ChatSessionProviderProps) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isNewBrowserSession, setIsNewBrowserSession] = useState<boolean>(true);

  // Load sessions from localStorage on initial render
  useEffect(() => {
    const storedSessions = localStorage.getItem('chatSessions');
    const storedCurrentSessionId = localStorage.getItem('currentSessionId');
    const sessionVisitMarker = sessionStorage.getItem('visitedBefore');
    
    if (storedSessions) {
      try {
        // Parse the stored sessions and convert string dates back to Date objects
        const parsedSessions = JSON.parse(storedSessions).map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        
        setSessions(parsedSessions);
        
        if (storedCurrentSessionId) {
          setCurrentSessionId(storedCurrentSessionId);
          
          // Only set isNewBrowserSession to false if this is not a new browser session
          // sessionStorage is cleared when the browser is closed, so this will be true for new visits
          if (sessionVisitMarker) {
            setIsNewBrowserSession(false);
          }
        }
      } catch (error) {
        console.error('Failed to parse stored sessions:', error);
        // If parsing fails, start fresh
        localStorage.removeItem('chatSessions');
        localStorage.removeItem('currentSessionId');
      }
    }
    
    // Mark that this browser session has visited the site
    sessionStorage.setItem('visitedBefore', 'true');
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('chatSessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  // Save current session ID to localStorage whenever it changes
  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem('currentSessionId', currentSessionId);
    } else {
      localStorage.removeItem('currentSessionId');
    }
  }, [currentSessionId]);

  const createSession = (initialMessage?: string): string => {
    const newMessages: Message[] = [];
    
    if (initialMessage) {
      const userMessage: Message = {
        id: '1',
        content: initialMessage,
        sender: 'user',
        timestamp: new Date(),
      };
      newMessages.push(userMessage);
    }
    
    const sessionId = Date.now().toString();
    const newSession: ChatSession = {
      id: sessionId,
      title: initialMessage ? initialMessage.substring(0, 30) + (initialMessage.length > 30 ? '...' : '') : 'New Chat',
      messages: newMessages,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setSessions(prev => [...prev, newSession]);
    setCurrentSessionId(sessionId);
    setIsNewBrowserSession(false);
    
    return sessionId;
  };

  const updateSession = (sessionId: string, updates: Partial<ChatSession>) => {
    setSessions(prev => prev.map(session => {
      if (session.id === sessionId) {
        return { ...session, ...updates, updatedAt: new Date() };
      }
      return session;
    }));
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
    
    if (currentSessionId === sessionId) {
      const remainingSessions = sessions.filter(session => session.id !== sessionId);
      if (remainingSessions.length > 0) {
        // Set the most recent session as current
        setCurrentSessionId(remainingSessions[remainingSessions.length - 1].id);
      } else {
        setCurrentSessionId(null);
      }
    }
  };

  const getCurrentSession = () => {
    return sessions.find(session => session.id === currentSessionId);
  };

  const addMessageToSession = (sessionId: string, message: Message) => {
    setSessions(prev => prev.map(session => {
      if (session.id === sessionId) {
        // Update session title if it's the first user message
        let title = session.title;
        if (session.messages.length === 1 && message.sender === 'user') {
          title = message.content.substring(0, 30) + (message.content.length > 30 ? '...' : '');
        }
        
        return {
          ...session,
          messages: [...session.messages, message],
          title,
          updatedAt: new Date()
        };
      }
      return session;
    }));
  };

  const clearSessions = () => {
    setSessions([]);
    setCurrentSessionId(null);
    localStorage.removeItem('chatSessions');
    localStorage.removeItem('currentSessionId');
  };

  const renameSession = (sessionId: string, newTitle: string) => {
    setSessions(prev => prev.map(session => {
      if (session.id === sessionId) {
        return { ...session, title: newTitle, updatedAt: new Date() };
      }
      return session;
    }));
  };

  const value = {
    sessions,
    currentSessionId,
    createSession,
    updateSession,
    deleteSession,
    renameSession,
    setCurrentSessionId,
    getCurrentSession,
    addMessageToSession,
    clearSessions,
    isNewBrowserSession
  };

  return (
    <ChatSessionContext.Provider value={value}>
      {children}
    </ChatSessionContext.Provider>
  );
};