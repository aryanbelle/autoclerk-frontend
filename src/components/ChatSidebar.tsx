import {
  SideNav,
  SideNavItems,
  SideNavLink,
  SideNavMenu,
  SideNavMenuItem,
  Button,
  OverflowMenu,
  OverflowMenuItem,
  Modal,
  TextInput,
} from '@carbon/react';
import {
  Chat,
  Add,
  Time,
  Settings,
  User,
  Home,
  Folder,
  Close,
  TrashCan,
  OverflowMenuVertical,
  Edit,
} from '@carbon/icons-react';
import { useChatSession } from '@/contexts/ChatSessionContext';
import { useState } from 'react';

interface ChatSidebarProps {
  onNewChat: () => void;
  onClose: () => void;
  onSelectSession: (sessionId: string) => void;
  currentSessionId: string | null;
}

const ChatSidebar = ({ onNewChat, onClose, onSelectSession, currentSessionId }: ChatSidebarProps) => {
  const { sessions, deleteSession, renameSession } = useChatSession();
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [sessionToRename, setSessionToRename] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');

  // Handle chat deletion
  const handleDeleteChat = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the chat selection
    deleteSession(sessionId);
  };
  
  // Open rename modal
  const handleRenameChat = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the chat selection
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setNewTitle(session.title);
      setSessionToRename(sessionId);
      setIsRenameModalOpen(true);
    }
  };
  
  // Submit rename
  const handleRenameSubmit = () => {
    if (sessionToRename && newTitle.trim()) {
      renameSession(sessionToRename, newTitle.trim());
      setIsRenameModalOpen(false);
      setSessionToRename(null);
      setNewTitle('');
    }
  };
  
  // Cancel rename
  const handleRenameCancel = () => {
    setIsRenameModalOpen(false);
    setSessionToRename(null);
    setNewTitle('');
  };

  // Sort sessions by last updated timestamp (newest first)
  const sortedSessions = [...sessions].sort((a, b) => 
    b.updatedAt.getTime() - a.updatedAt.getTime()
  );

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-sidebar-background text-sidebar-foreground border-r border-sidebar-border z-50 flex flex-col">      
      {/* Rename Modal */}
      <Modal
        open={isRenameModalOpen}
        modalHeading="Rename Chat"
        primaryButtonText="Rename"
        secondaryButtonText="Cancel"
        onRequestSubmit={handleRenameSubmit}
        onRequestClose={handleRenameCancel}
        size="sm"
      >
        <TextInput
          id="rename-chat-input"
          labelText="Chat name"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Enter a new name for this chat"
          autoFocus
        />
      </Modal>
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-sidebar-border flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-sidebar-primary flex items-center justify-center">
            <Chat size={20} className="text-sidebar-primary-foreground" />
          </div>
          <h1 className="text-lg font-semibold text-glow">CarbonChat</h1>
        </div>
        <Button
          kind="ghost"
          size="sm"
          hasIconOnly
          renderIcon={Close}
          iconDescription="Close sidebar"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        />
      </div>

      <SideNav isFixedNav expanded aria-label="Chat Navigation" className="flex-1 overflow-y-auto bg-sidebar-background">
        <SideNavItems>
          {/* New Chat */}
          <div className="p-3">
            <Button
              onClick={onNewChat}
              renderIcon={Add}
              className="w-full justify-start"
              style={{backgroundColor: '#0f62fe', color: '#ffffff'}}
            >
              New Chat
            </Button>
          </div>

          {/* Navigation Links */}
          <SideNavLink renderIcon={Home} href="#" className="text-sidebar-foreground hover:bg-sidebar-accent !bg-sidebar-background">
            Home
          </SideNavLink>
          
          <SideNavMenu renderIcon={Time} title="Recent Chats" className="text-sidebar-foreground !bg-sidebar-background">
            {sortedSessions.length > 0 ? (
              sortedSessions.map((session) => (
                <SideNavMenuItem 
                  key={session.id} 
                  href="#"
                  className={`text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent !bg-sidebar-background group ${currentSessionId === session.id ? 'bg-sidebar-accent' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectSession(session.id);
                  }}
                >
                  <div className="flex items-center w-full">
                    <span className="truncate mr-auto">{session.title || 'New Chat'}</span>
                    <div className="ml-2 invisible group-hover:visible">
                      <OverflowMenu 
                        flipped 
                        size="sm" 
                        renderIcon={OverflowMenuVertical}
                        iconDescription="Chat options"
                        onClick={(e) => e.stopPropagation()}
                        className="text-sidebar-muted hover:text-sidebar-foreground"
                      >
                        <OverflowMenuItem 
                          itemText="Rename"
                          onClick={(e) => handleRenameChat(session.id, e as unknown as React.MouseEvent)}
                          hasDivider={false}
                          renderIcon={Edit}
                        />
                        <OverflowMenuItem 
                          itemText="Delete"
                          onClick={(e) => handleDeleteChat(session.id, e as unknown as React.MouseEvent)}
                          hasDivider={true}
                          isDelete
                          renderIcon={TrashCan}
                        />
                      </OverflowMenu>
                    </div>
                  </div>
                </SideNavMenuItem>
              ))
            ) : (
              <div className="px-4 py-2 text-sidebar-muted text-sm">No recent chats</div>
            )}
          </SideNavMenu>

          <SideNavMenu renderIcon={Folder} title="Workspaces" className="text-sidebar-foreground !bg-sidebar-background">
            <SideNavMenuItem href="#" className="text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent !bg-sidebar-background">
              Frontend Development
            </SideNavMenuItem>
            <SideNavMenuItem href="#" className="text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent !bg-sidebar-background">
              AI & Machine Learning
            </SideNavMenuItem>
            <SideNavMenuItem href="#" className="text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent !bg-sidebar-background">
              Design & UX
            </SideNavMenuItem>
          </SideNavMenu>

          <SideNavLink renderIcon={Settings} href="#" className="text-sidebar-foreground hover:bg-sidebar-accent !bg-sidebar-background">
            Settings
          </SideNavLink>
          
          <SideNavLink renderIcon={User} href="#" className="text-sidebar-foreground hover:bg-sidebar-accent !bg-sidebar-background">
            Profile
          </SideNavLink>
        </SideNavItems>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border bg-sidebar-background">
          <div className="flex items-center space-x-3 text-sm text-sidebar-foreground">
            <div className="w-6 h-6 rounded-full bg-sidebar-accent"></div>
            <span>AI Assistant</span>
          </div>
        </div>
      </SideNav>
    </div>
  );
};

export default ChatSidebar;