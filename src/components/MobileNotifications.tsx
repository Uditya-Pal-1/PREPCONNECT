import React, { useState, useEffect } from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Badge } from './ui/badge'
import { Bell, MessageCircle, UserPlus, ThumbsUp, Calendar, Check, X } from 'lucide-react'
import { projectId } from '../utils/supabase/info'

interface User {
  id: string
  email: string
  name: string
  userType: 'student' | 'mentor'
}

interface Notification {
  id: string
  type: 'message' | 'connection_request' | 'like' | 'comment' | 'meeting' | 'system'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionData?: any
  fromUser?: {
    id: string
    name: string
    avatar?: string
  }
}

interface MobileNotificationsProps {
  user: User
  onNavigate: (view: string, data?: any) => void
}

export function MobileNotifications({ user, onNavigate }: MobileNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [connectionRequests, setConnectionRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
    fetchConnectionRequests()
  }, [])

  const fetchNotifications = async () => {
    try {
      // Generate sample notifications for MVP
      const sampleNotifications: Notification[] = [
        {
          id: '1',
          type: 'connection_request',
          title: 'New Connection Request',
          message: 'wants to connect with you for mentoring',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read: false,
          fromUser: {
            id: 'student-1',
            name: 'Priya Sharma'
          }
        },
        {
          id: '2',
          type: 'message',
          title: 'New Message',
          message: 'Thank you for the interview tips! They were really helpful.',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          read: false,
          fromUser: {
            id: 'student-2',
            name: 'Rahul Kumar'
          }
        },
        {
          id: '3',
          type: 'like',
          title: 'Post Interaction',
          message: 'and 25 others liked your post about "Data Science Best Practices"',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          read: true,
          fromUser: {
            id: 'student-3',
            name: 'Anjali Gupta'
          }
        },
        {
          id: '4',
          type: 'comment',
          title: 'New Comment',
          message: 'commented on your article about Frontend Development',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          read: true,
          fromUser: {
            id: 'student-4',
            name: 'Vikash Singh'
          }
        },
        {
          id: '5',
          type: 'system',
          title: 'Profile Update',
          message: 'Your profile has been successfully updated with new skills',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          read: true
        }
      ]

      setNotifications(sampleNotifications)
    } catch (error) {
      console.log('Error fetching notifications:', error)
    } finally {
      setLoading(false)
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
        const pendingRequests = requests?.filter((req: any) => 
          req.status === 'pending' && 
          (user.userType === 'mentor' ? req.mentorId === user.id : req.studentId === user.id)
        ) || []
        setConnectionRequests(pendingRequests)
      }
    } catch (error) {
      console.log('Error fetching connection requests:', error)
    }
  }

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    )
  }

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id)
    
    switch (notification.type) {
      case 'message':
        onNavigate('chat', { chatId: notification.fromUser?.id })
        break
      case 'connection_request':
        onNavigate('notifications') // Stay on notifications to handle request
        break
      case 'like':
      case 'comment':
        onNavigate('posts') // Navigate to posts
        break
      default:
        break
    }
  }

  const handleConnectionRequest = async (requestId: string, action: 'accept' | 'decline') => {
    try {
      // For MVP, just show alert and remove from list
      alert(`Request ${action}ed successfully!`)
      setConnectionRequests(prev => prev.filter(req => req.id !== requestId))
      
      // Remove corresponding notification
      setNotifications(prev => 
        prev.filter(notif => 
          !(notif.type === 'connection_request' && notif.actionData?.requestId === requestId)
        )
      )
    } catch (error) {
      console.log('Error handling connection request:', error)
      alert(`Failed to ${action} request`)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="w-5 h-5 text-blue-600" />
      case 'connection_request':
        return <UserPlus className="w-5 h-5 text-green-600" />
      case 'like':
        return <ThumbsUp className="w-5 h-5 text-red-600" />
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-purple-600" />
      case 'meeting':
        return <Calendar className="w-5 h-5 text-orange-600" />
      default:
        return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  const formatTime = (timestamp: string) => {
    const now = new Date()
    const notifTime = new Date(timestamp)
    const diffInHours = Math.floor((now.getTime() - notifTime.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-gray-600">{unreadCount} unread notifications</p>
          )}
        </div>
        
        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
          >
            Mark all read
          </Button>
        )}
      </div>

      {/* Connection Requests (for mentors) */}
      {user.userType === 'mentor' && connectionRequests.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Pending Connection Requests</h3>
          {connectionRequests.map((request) => (
            <Card key={request.id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Avatar>
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      S
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900">New mentoring request</h4>
                    <p className="text-sm text-gray-600 mt-1">{request.message || 'No message provided'}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {formatTime(request.createdAt)}
                    </p>
                    
                    <div className="flex space-x-2 mt-3">
                      <Button
                        size="sm"
                        onClick={() => handleConnectionRequest(request.id, 'accept')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleConnectionRequest(request.id, 'decline')}
                      >
                        <X className="w-3 h-3 mr-1" />
                        Decline
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Regular Notifications */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No notifications yet</p>
              <p className="text-sm text-gray-400">
                You'll see updates about messages, connections, and more here
              </p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card 
              key={notification.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{notification.title}</h4>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                    
                    <div className="mt-1">
                      {notification.fromUser ? (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">{notification.fromUser.name}</span>{' '}
                          {notification.message}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-600">{notification.message}</p>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-2">
                      {formatTime(notification.timestamp)}
                    </p>
                  </div>

                  {notification.fromUser && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">
                        {notification.fromUser.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}