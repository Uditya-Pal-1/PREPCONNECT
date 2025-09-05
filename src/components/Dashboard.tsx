import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Input } from './ui/input'
import { MessageCircle, Upload, User, Settings, LogOut, Users, FileText, Bell } from 'lucide-react'
import { MentorList } from './MentorList'
import { ProfileSettings } from './ProfileSettings'
import { FileUpload } from './FileUpload'
import { ConnectionRequests } from './ConnectionRequests'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface User {
  id: string
  email: string
  name: string
  userType: 'student' | 'mentor'
}

interface DashboardProps {
  user: User
  onLogout: () => void
  onOpenChat: (recipientId: string) => void
}

interface Conversation {
  id: string
  participants: string[]
  lastMessage: {
    content: string
    timestamp: string
    senderId: string
  }
  updatedAt: string
}

interface Profile {
  id: string
  name: string
  userType: string
  company?: string
  college?: string
  bio?: string
  experience?: string
}

export function Dashboard({ user, onLogout, onOpenChat }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [profiles, setProfiles] = useState<{[key: string]: Profile}>({})
  const [connectionRequests, setConnectionRequests] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchConversations()
    fetchConnectionRequests()
  }, [])

  const fetchConversations = async () => {
    try {
      const accessToken = localStorage.getItem('prepconnect_access_token')
      if (!accessToken) return

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-78cb9030/conversations/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      })

      if (response.ok) {
        const { conversations } = await response.json()
        setConversations(conversations || [])
        
        // Fetch profiles for conversation participants
        const participantIds = conversations?.flatMap((conv: Conversation) => 
          conv.participants.filter((id: string) => id !== user.id)
        ) || []
        
        await fetchProfiles(participantIds)
      }
    } catch (error) {
      console.log('Error fetching conversations:', error)
    }
  }

  const fetchProfiles = async (userIds: string[]) => {
    try {
      const profilePromises = userIds.map(async (id) => {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-78cb9030/profile/${id}`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          }
        })
        
        if (response.ok) {
          const { profile } = await response.json()
          return { [id]: profile }
        }
        return {}
      })

      const profileResults = await Promise.all(profilePromises)
      const profilesMap = profileResults.reduce((acc, profile) => ({ ...acc, ...profile }), {})
      setProfiles(prev => ({ ...prev, ...profilesMap }))
    } catch (error) {
      console.log('Error fetching profiles:', error)
    }
  }

  const fetchConnectionRequests = async () => {
    try {
      const accessToken = localStorage.getItem('prepconnect_access_token')
      if (!accessToken) return

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-78cb9030/connection-requests/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      })

      if (response.ok) {
        const { requests } = await response.json()
        setConnectionRequests(requests || [])
      }
    } catch (error) {
      console.log('Error fetching connection requests:', error)
    }
  }

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(id => id !== user.id)
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">PrepConnect</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-700">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.userType}</p>
                </div>
              </div>
              
              <Button variant="ghost" size="sm" onClick={onLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              <Button
                variant={activeTab === 'overview' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('overview')}
              >
                <User className="w-4 h-4 mr-2" />
                Overview
              </Button>
              
              {user.userType === 'student' && (
                <Button
                  variant={activeTab === 'mentors' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('mentors')}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Find Mentors
                </Button>
              )}
              
              <Button
                variant={activeTab === 'messages' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('messages')}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Messages
              </Button>
              
              {user.userType === 'student' && (
                <Button
                  variant={activeTab === 'files' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('files')}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  My Files
                </Button>
              )}
              
              <Button
                variant={activeTab === 'requests' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('requests')}
              >
                <Bell className="w-4 h-4 mr-2" />
                Requests
              </Button>
              
              <Button
                variant={activeTab === 'profile' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('profile')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Welcome back, {user.name}!
                  </h2>
                  <p className="text-gray-600">
                    {user.userType === 'student' 
                      ? 'Continue your journey to interview success'
                      : 'Help students achieve their career goals'
                    }
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center">
                        <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
                        Messages
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{conversations.length}</p>
                      <p className="text-sm text-gray-600">Active conversations</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center">
                        <Bell className="w-5 h-5 mr-2 text-orange-600" />
                        Requests
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{connectionRequests.length}</p>
                      <p className="text-sm text-gray-600">
                        {user.userType === 'student' ? 'Sent requests' : 'Pending requests'}
                      </p>
                    </CardContent>
                  </Card>

                  {user.userType === 'student' && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                          <FileText className="w-5 h-5 mr-2 text-green-600" />
                          Files
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">0</p>
                        <p className="text-sm text-gray-600">Uploaded files</p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Recent Messages */}
                {conversations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Messages</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {conversations.slice(0, 3).map((conversation) => {
                          const otherParticipant = getOtherParticipant(conversation)
                          const profile = profiles[otherParticipant || '']
                          
                          return (
                            <div
                              key={conversation.id}
                              className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer"
                              onClick={() => onOpenChat(otherParticipant || '')}
                            >
                              <Avatar>
                                <AvatarFallback>
                                  {profile?.name?.charAt(0)?.toUpperCase() || '?'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {profile?.name || 'Unknown User'}
                                </p>
                                <p className="text-sm text-gray-500 truncate">
                                  {conversation.lastMessage.content}
                                </p>
                              </div>
                              <div className="text-xs text-gray-400">
                                {formatTime(conversation.lastMessage.timestamp)}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'mentors' && user.userType === 'student' && (
              <MentorList onOpenChat={onOpenChat} />
            )}

            {activeTab === 'messages' && (
              <Card>
                <CardHeader>
                  <CardTitle>Messages</CardTitle>
                  <CardDescription>Your recent conversations</CardDescription>
                </CardHeader>
                <CardContent>
                  {conversations.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No conversations yet</p>
                      <p className="text-sm text-gray-400">
                        {user.userType === 'student' 
                          ? 'Start by connecting with a mentor'
                          : 'Students will message you soon'
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {conversations.map((conversation) => {
                        const otherParticipant = getOtherParticipant(conversation)
                        const profile = profiles[otherParticipant || '']
                        
                        return (
                          <div
                            key={conversation.id}
                            className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-gray-50 cursor-pointer"
                            onClick={() => onOpenChat(otherParticipant || '')}
                          >
                            <Avatar>
                              <AvatarFallback>
                                {profile?.name?.charAt(0)?.toUpperCase() || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900">
                                  {profile?.name || 'Unknown User'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatTime(conversation.lastMessage.timestamp)}
                                </p>
                              </div>
                              <p className="text-sm text-gray-600 truncate">
                                {conversation.lastMessage.content}
                              </p>
                              {profile?.company && (
                                <p className="text-xs text-gray-400">{profile.company}</p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'files' && user.userType === 'student' && (
              <FileUpload userId={user.id} />
            )}

            {activeTab === 'requests' && (
              <ConnectionRequests 
                user={user} 
                requests={connectionRequests}
                onRequestUpdate={fetchConnectionRequests}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileSettings user={user} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}