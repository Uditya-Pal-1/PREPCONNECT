import React, { useState } from 'react'
import { Home, FileText, Plus, MessageCircle, Bell, Search, MoreVertical, ArrowLeft } from 'lucide-react'
import { Button } from './ui/button'
import { MobileHome } from './MobileHome'
import { MobileProfile } from './MobileProfile'
import { MobileCreate } from './MobileCreate'
import { MobileChat } from './MobileChat'
import { MobileNotifications } from './MobileNotifications'
import { MobileMentorProfile } from './MobileMentorProfile'
import { MobilePost } from './MobilePost'
import { MobileCreateContent } from './MobileCreateContent'

interface User {
  id: string
  email: string
  name: string
  userType: 'student' | 'mentor'
}

interface MobileAppProps {
  user: User
  onLogout: () => void
}

export function MobileApp({ user, onLogout }: MobileAppProps) {
  const [activeTab, setActiveTab] = useState('home')
  const [viewStack, setViewStack] = useState<string[]>(['home'])
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [createContentType, setCreateContentType] = useState<string | null>(null)

  const navigateTo = (view: string, data?: any) => {
    setViewStack(prev => [...prev, view])
    
    if (view === 'mentor-profile' && data?.mentorId) {
      setSelectedMentorId(data.mentorId)
    } else if (view === 'post' && data?.postId) {
      setSelectedPostId(data.postId)
    } else if (view === 'chat' && data?.chatId) {
      setSelectedChatId(data.chatId)
    } else if (view === 'create-content' && data?.type) {
      setCreateContentType(data.type)
    }
  }

  const goBack = () => {
    if (viewStack.length > 1) {
      const newStack = viewStack.slice(0, -1)
      setViewStack(newStack)
      const previousView = newStack[newStack.length - 1]
      
      // Clean up any selected data when going back
      if (previousView !== 'mentor-profile') setSelectedMentorId(null)
      if (previousView !== 'post') setSelectedPostId(null)
      if (previousView !== 'chat') setSelectedChatId(null)
      if (previousView !== 'create-content') setCreateContentType(null)
    }
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setViewStack([tab])
    setSelectedMentorId(null)
    setSelectedPostId(null)
    setSelectedChatId(null)
    setCreateContentType(null)
  }

  const currentView = viewStack[viewStack.length - 1]
  const canGoBack = viewStack.length > 1

  const renderHeader = () => {
    const isProfileView = currentView === 'profile' || currentView === 'mentor-profile'
    const isPostView = currentView === 'post'
    
    return (
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center">
          {canGoBack ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              className="p-2 -ml-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          ) : (
            <div className="w-9" />
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="p-2">
            <Search className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </header>
    )
  }

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return <MobileHome user={user} onNavigate={navigateTo} />
      case 'posts':
        return <MobileHome user={user} onNavigate={navigateTo} activeFilter="posts" />
      case 'create':
        return <MobileCreate user={user} onNavigate={navigateTo} />
      case 'chat':
        return selectedChatId ? (
          <MobileChat 
            user={user} 
            recipientId={selectedChatId} 
            onNavigate={navigateTo} 
          />
        ) : (
          <MobileChat user={user} onNavigate={navigateTo} />
        )
      case 'notifications':
        return <MobileNotifications user={user} onNavigate={navigateTo} />
      case 'profile':
        return <MobileProfile user={user} onNavigate={navigateTo} onLogout={onLogout} />
      case 'mentor-profile':
        return selectedMentorId ? (
          <MobileMentorProfile 
            user={user} 
            mentorId={selectedMentorId} 
            onNavigate={navigateTo} 
          />
        ) : (
          <MobileHome user={user} onNavigate={navigateTo} />
        )
      case 'post':
        return selectedPostId ? (
          <MobilePost 
            user={user} 
            postId={selectedPostId} 
            onNavigate={navigateTo} 
          />
        ) : (
          <MobileHome user={user} onNavigate={navigateTo} />
        )
      case 'create-content':
        return createContentType ? (
          <MobileCreateContent 
            user={user} 
            contentType={createContentType} 
            onNavigate={navigateTo} 
          />
        ) : (
          <MobileCreate user={user} onNavigate={navigateTo} />
        )
      default:
        return <MobileHome user={user} onNavigate={navigateTo} />
    }
  }

  const renderBottomNav = () => {
    const navItems = [
      { id: 'home', icon: Home, label: 'Home' },
      { id: 'posts', icon: FileText, label: 'Posts' },
      { id: 'create', icon: Plus, label: 'Create' },
      { id: 'chat', icon: MessageCircle, label: 'Chat' },
      { id: 'notifications', icon: Bell, label: 'Alerts' },
    ]

    return (
      <nav className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-around sticky bottom-0 z-50">
        {navItems.map((item) => {
          const isActive = activeTab === item.id
          const Icon = item.icon
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={`flex flex-col items-center p-2 h-auto ${
                isActive ? 'text-blue-600' : 'text-gray-600'
              }`}
              onClick={() => handleTabChange(item.id)}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'fill-current' : ''}`} />
              <span className="text-xs">{item.label}</span>
            </Button>
          )
        })}
      </nav>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto">
      {renderHeader()}
      <main className="flex-1 pb-16">
        {renderContent()}
      </main>
      {renderBottomNav()}
    </div>
  )
}