import { useState, useEffect } from 'react';
import LandingPage from './LandingPage';
import ChatInterface from './ChatInterface';
import ChatSidebar from './ChatSidebar';
import { Button, IconButton } from '@carbon/react';
import { Menu } from '@carbon/icons-react';
import { useChatSession } from '../contexts/ChatSessionContext';

const MainInterface = () => {
  const { 
    currentSessionId, 
    createSession, 
    getCurrentSession,
    isNewBrowserSession,
    setCurrentSessionId
  } = useChatSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for sidebar visibility

  // Determine if we should show landing page or chat interface
  const currentView = currentSessionId && !isNewBrowserSession ? 'chat' : 'landing';

  const handleStartChat = (message: string) => {
    createSession(message);
  };

  const handleNewChat = () => {
    createSession();
  };

  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setIsSidebarOpen(false); // Close sidebar on mobile after selection
  };

  if (currentView === 'landing') {
    return <LandingPage onStartChat={handleStartChat} />;
  }
  
  const currentSession = getCurrentSession();

  return (
    <div className="flex h-screen overflow-hidden chat-interface-override bg-[#111111]">
      {isSidebarOpen && (
        <ChatSidebar 
          onNewChat={handleNewChat} 
          onClose={() => setIsSidebarOpen(false)} 
          onSelectSession={handleSelectSession}
          currentSessionId={currentSessionId}
        />
      )}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'} chat-interface-override bg-[#111111]`}>
        {!isSidebarOpen && (
          <IconButton
            kind="ghost"
            size="sm"
            renderIcon={Menu}
            iconDescription="Open sidebar"
            tooltipPosition="right"
            className="absolute top-4 left-4 z-50 text-[#E0E0E0] hover:text-[#FFFFFF] hover:bg-[#222222] transition-colors"
            onClick={() => setIsSidebarOpen(true)}
          />
        )}
        <div className="flex-1 flex flex-col items-center chat-interface-override bg-[#111111] text-[#E0E0E0]">
          <div className="w-full max-w-4xl h-full chat-interface-override bg-[#111111]">
            <ChatInterface sessionId={currentSessionId as string} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainInterface;