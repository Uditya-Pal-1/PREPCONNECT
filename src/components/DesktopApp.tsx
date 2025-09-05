import React, { useState } from 'react';
import { 
  Home, 
  FileText, 
  Plus, 
  MessageCircle, 
  Bell, 
  Search, 
  Settings,
  LogOut,
  User,
  Menu
} from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { DesktopHome } from './DesktopHome';
import { DesktopProfile } from './DesktopProfile';
import { DesktopCreate } from './DesktopCreate';
import { DesktopChat } from './DesktopChat';
import { DesktopNotifications } from './DesktopNotifications';
import { DesktopMentorProfile } from './DesktopMentorProfile';
import { DesktopPost } from './DesktopPost';

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'student' | 'mentor';
}

interface DesktopAppProps {
  user: User;
  onLogout: () => void;
}

export function DesktopApp({ user, onLogout }: DesktopAppProps) {
  const [activeView, setActiveView] = useState('home');
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navigateTo = (view: string, data?: any) => {
    setActiveView(view);
    
    if (view === 'mentor-profile' && data?.mentorId) {
      setSelectedMentorId(data.mentorId);
    } else if (view === 'post' && data?.postId) {
      setSelectedPostId(data.postId);
    } else if (view === 'chat' && data?.chatId) {
      setSelectedChatId(data.chatId);
    }
  };

  const sidebarItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'posts', label: 'Posts', icon: FileText },
    { id: 'create', label: 'Create', icon: Plus },
    { id: 'chat', label: 'Messages', icon: MessageCircle },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'home':
        return <DesktopHome user={user} onNavigate={navigateTo} />;
      case 'posts':
        return <DesktopHome user={user} onNavigate={navigateTo} activeFilter="posts" />;
      case 'create':
        return <DesktopCreate user={user} onNavigate={navigateTo} />;
      case 'chat':
        return selectedChatId ? (
          <DesktopChat 
            user={user} 
            recipientId={selectedChatId} 
            onNavigate={navigateTo} 
          />
        ) : (
          <DesktopChat user={user} onNavigate={navigateTo} />
        );
      case 'notifications':
        return <DesktopNotifications user={user} onNavigate={navigateTo} />;
      case 'profile':
        return <DesktopProfile user={user} onNavigate={navigateTo} onLogout={onLogout} />;
      case 'mentor-profile':
        return selectedMentorId ? (
          <DesktopMentorProfile 
            user={user} 
            mentorId={selectedMentorId} 
            onNavigate={navigateTo} 
          />
        ) : (
          <DesktopHome user={user} onNavigate={navigateTo} />
        );
      case 'post':
        return selectedPostId ? (
          <DesktopPost 
            user={user} 
            postId={selectedPostId} 
            onNavigate={navigateTo} 
          />
        ) : (
          <DesktopHome user={user} onNavigate={navigateTo} />
        );
      default:
        return <DesktopHome user={user} onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <h1 className="font-bold text-xl text-gray-900">PrepConnect</h1>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2"
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10 bg-blue-600">
              <AvatarFallback className="bg-blue-600 text-white">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-sm text-gray-500 capitalize">{user.userType}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start ${sidebarCollapsed ? 'px-3' : 'px-4'} ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => navigateTo(item.id)}
              >
                <Icon className={`w-5 h-5 ${sidebarCollapsed ? '' : 'mr-3'}`} />
                {!sidebarCollapsed && item.label}
              </Button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          <Button
            variant="ghost"
            className={`w-full justify-start ${sidebarCollapsed ? 'px-3' : 'px-4'} text-gray-700 hover:bg-gray-100`}
            onClick={() => navigateTo('settings')}
          >
            <Settings className={`w-5 h-5 ${sidebarCollapsed ? '' : 'mr-3'}`} />
            {!sidebarCollapsed && 'Settings'}
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start ${sidebarCollapsed ? 'px-3' : 'px-4'} text-red-600 hover:bg-red-50`}
            onClick={onLogout}
          >
            <LogOut className={`w-5 h-5 ${sidebarCollapsed ? '' : 'mr-3'}`} />
            {!sidebarCollapsed && 'Sign Out'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900 capitalize">
                {activeView === 'mentor-profile' ? 'Mentor Profile' : 
                 activeView === 'post' ? 'Post' : activeView}
              </h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Button variant="ghost" size="sm" className="p-2">
                <Bell className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}