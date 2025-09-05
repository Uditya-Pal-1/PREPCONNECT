import React, { useState, useEffect } from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Send, Phone, Video, MoreVertical, MessageCircle } from 'lucide-react'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface User {
  id: string
  email: string
  name: string
  userType: 'student' | 'mentor'
}

interface Message {
  id: string
  senderId: string
  recipientId: string
  content: string
  timestamp: string
  read: boolean
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
}

interface MobileChatProps {
  user: User
  recipientId?: string
  onNavigate: (view: string, data?: any) => void
}

export function MobileChat({ user, recipientId, onNavigate }: MobileChatProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [recipientProfile, setRecipientProfile] = useState<Profile | null>(null)
  const [profiles, setProfiles] = useState<{[key: string]: Profile}>({})
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (recipientId) {
      fetchRecipientProfile()
      fetchMessages()
    } else {
      fetchConversations()
    }
  }, [recipientId])

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
    } finally {
      setLoading(false)
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

  const fetchRecipientProfile = async () => {
    if (!recipientId) return
    
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-78cb9030/profile/${recipientId}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        }
      })

      if (response.ok) {
        const { profile } = await response.json()
        setRecipientProfile(profile)
      }
    } catch (error) {
      console.log('Error fetching recipient profile:', error)
    }
  }

  const fetchMessages = async () => {
    if (!recipientId) return
    
    try {
      const accessToken = localStorage.getItem('prepconnect_access_token')
      if (!accessToken) return

      const conversationId = [user.id, recipientId].sort().join(':')
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-78cb9030/messages/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      })

      if (response.ok) {
        const { messages } = await response.json()
        setMessages(messages || [])
      }
    } catch (error) {
      console.log('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || !recipientId || sending) return

    setSending(true)
    try {
      const accessToken = localStorage.getItem('prepconnect_access_token')
      
      if (!accessToken) {
        alert('Please log in again')
        return
      }

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-78cb9030/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          recipientId,
          content: newMessage.trim()
        })
      })

      if (response.ok) {
        setNewMessage('')
        fetchMessages()
      } else {
        alert('Failed to send message')
      }
    } catch (error) {
      console.log('Error sending message:', error)
      alert('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(id => id !== user.id)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Chat list view
  if (!recipientId) {
    return (
      <div className="p-4 space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Your conversations with mentors and students</p>
        </div>

        {conversations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No conversations yet</p>
              <p className="text-sm text-gray-400">
                {user.userType === 'student' 
                  ? 'Start by connecting with a mentor'
                  : 'Students will message you soon'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {conversations.map((conversation) => {
              const otherParticipant = getOtherParticipant(conversation)
              const profile = profiles[otherParticipant || '']
              
              return (
                <Card 
                  key={conversation.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onNavigate('chat', { chatId: otherParticipant })}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {profile?.name?.charAt(0)?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 truncate">
                            {profile?.name || 'Unknown User'}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {formatTime(conversation.lastMessage.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.lastMessage.content}
                        </p>
                        {profile?.company && (
                          <p className="text-xs text-gray-400">{profile.company}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // Individual chat view
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback>
                {recipientProfile?.name?.charAt(0)?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-gray-900">
                {recipientProfile?.name || 'Unknown User'}
              </h3>
              <p className="text-sm text-gray-500">
                {recipientProfile?.company || recipientProfile?.college || 'Online'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" disabled>
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" disabled>
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No messages yet</p>
            <p className="text-sm text-gray-400">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  message.senderId === user.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.senderId === user.id ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={sendMessage} className="flex space-x-3">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            disabled={sending}
          />
          <Button 
            type="submit" 
            size="sm"
            disabled={!newMessage.trim() || sending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}