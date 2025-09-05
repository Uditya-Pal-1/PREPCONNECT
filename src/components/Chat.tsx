import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Badge } from './ui/badge'
import { ArrowLeft, Send, Users, MoreVertical, Phone, Video } from 'lucide-react'
import { toast } from 'sonner@2.0.3'
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

interface Profile {
  id: string
  name: string
  userType: string
  company?: string
  college?: string
  experience?: string
  expertise?: string
}

interface ChatProps {
  user: User
  recipientId: string
  onGoBack: () => void
  onLogout: () => void
}

export function Chat({ user, recipientId, onGoBack, onLogout }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [recipientProfile, setRecipientProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchRecipientProfile()
    fetchMessages()
    
    // Subscribe to real-time messages
    const conversationId = [user.id, recipientId].sort().join(':')
    
    // Import realtime manager dynamically to avoid circular dependencies
    import('../utils/realtime').then(({ realtimeManager }) => {
      const channel = realtimeManager.subscribeToMessages(conversationId, (newMessages: Message[]) => {
        setMessages(newMessages)
      })
      
      // Store the channel for cleanup
      return () => {
        realtimeManager.unsubscribe(channel)
      }
    })
    
    // Fallback polling for immediate functionality
    const pollInterval = setInterval(fetchMessages, 3000)
    return () => clearInterval(pollInterval)
  }, [recipientId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchRecipientProfile = async () => {
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
    try {
      const accessToken = localStorage.getItem('prepconnect_access_token')
      if (!accessToken) return

      // Create conversation ID (sorted participant IDs)
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
    
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      const accessToken = localStorage.getItem('prepconnect_access_token')
      
      if (!accessToken) {
        toast.error('Please log in again')
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
        // Immediately fetch messages to show the new message
        fetchMessages()
      } else {
        const errorData = await response.json()
        toast.error(`Failed to send message: ${errorData.error}`)
      }
    } catch (error) {
      console.log('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onGoBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {recipientProfile?.name?.charAt(0)?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="font-semibold text-gray-900">
                    {recipientProfile?.name || 'Unknown User'}
                  </h1>
                  <div className="flex items-center space-x-2">
                    {recipientProfile?.company && (
                      <p className="text-sm text-gray-500">{recipientProfile.company}</p>
                    )}
                    {recipientProfile?.college && (
                      <p className="text-sm text-gray-500">{recipientProfile.college}</p>
                    )}
                    {recipientProfile?.experience && (
                      <Badge variant="secondary" className="text-xs">
                        {recipientProfile.experience}
                      </Badge>
                    )}
                  </div>
                </div>
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
      </header>

      {/* Messages */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <Card className="h-[calc(100vh-200px)] flex flex-col">
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No messages yet</p>
                  <p className="text-sm text-gray-400">Start the conversation!</p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
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
                        {formatMessageTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </CardContent>

          {/* Message Input */}
          <div className="p-4 border-t">
            <form onSubmit={sendMessage} className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                disabled={sending}
              />
              <Button type="submit" disabled={!newMessage.trim() || sending}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  )
}