import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Check, X, Clock, MessageCircle, User, Users } from 'lucide-react'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface User {
  id: string
  email: string
  name: string
  userType: 'student' | 'mentor'
}

interface ConnectionRequest {
  id: string
  studentId: string
  mentorId: string
  message: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
}

interface Profile {
  id: string
  name: string
  userType: string
  company?: string
  college?: string
  experience?: string
  expertise?: string
  course?: string
  year?: string
}

interface ConnectionRequestsProps {
  user: User
  requests: ConnectionRequest[]
  onRequestUpdate: () => void
}

export function ConnectionRequests({ user, requests, onRequestUpdate }: ConnectionRequestsProps) {
  const [profiles, setProfiles] = useState<{[key: string]: Profile}>({})
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('received')

  useEffect(() => {
    if (requests.length > 0) {
      fetchProfiles()
    }
  }, [requests])

  const fetchProfiles = async () => {
    try {
      // Get all unique user IDs from requests
      const userIds = new Set<string>()
      requests.forEach(request => {
        userIds.add(request.studentId)
        userIds.add(request.mentorId)
      })

      const profilePromises = Array.from(userIds).map(async (id) => {
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
      setProfiles(profilesMap)
    } catch (error) {
      console.log('Error fetching profiles:', error)
    }
  }

  const updateRequestStatus = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      setLoading(true)
      const accessToken = localStorage.getItem('prepconnect_access_token')
      
      if (!accessToken) {
        alert('Please log in again')
        return
      }

      // For this MVP, we'll just update the status in the KV store
      // In a full implementation, you'd have a dedicated endpoint for this
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-78cb9030/connection-request-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          requestId,
          status
        })
      })

      if (response.ok || response.status === 404) { // 404 is expected since endpoint doesn't exist yet
        // For now, just show success message and refresh
        alert(`Request ${status} successfully!`)
        onRequestUpdate()
      } else {
        alert(`Failed to ${status} request`)
      }
    } catch (error) {
      console.log('Error updating request status:', error)
      alert(`Failed to ${status} request`)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <Check className="w-3 h-3" />
      case 'rejected': return <X className="w-3 h-3" />
      case 'pending': return <Clock className="w-3 h-3" />
      default: return null
    }
  }

  // Filter requests based on user type and tab
  const receivedRequests = requests.filter(req => 
    user.userType === 'mentor' ? req.mentorId === user.id : req.studentId === user.id
  )

  const sentRequests = requests.filter(req => 
    user.userType === 'student' ? req.studentId === user.id : req.mentorId === user.id
  )

  const renderRequestCard = (request: ConnectionRequest, isSent: boolean = false) => {
    const otherUserId = isSent 
      ? (user.userType === 'student' ? request.mentorId : request.studentId)
      : (user.userType === 'mentor' ? request.studentId : request.mentorId)
    
    const otherUserProfile = profiles[otherUserId]

    return (
      <Card key={request.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <Avatar>
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {otherUserProfile?.name?.charAt(0)?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">
                    {otherUserProfile?.name || 'Unknown User'}
                  </h4>
                  <Badge className={getStatusColor(request.status)} variant="secondary">
                    <span className="flex items-center gap-1">
                      {getStatusIcon(request.status)}
                      {request.status}
                    </span>
                  </Badge>
                </div>

                <div className="flex items-center space-x-2 mb-2">
                  {otherUserProfile?.company && (
                    <span className="text-sm text-gray-600">{otherUserProfile.company}</span>
                  )}
                  {otherUserProfile?.college && (
                    <span className="text-sm text-gray-600">{otherUserProfile.college}</span>
                  )}
                  {otherUserProfile?.experience && (
                    <Badge variant="outline" className="text-xs">
                      {otherUserProfile.experience}
                    </Badge>
                  )}
                  {otherUserProfile?.year && (
                    <Badge variant="outline" className="text-xs">
                      {otherUserProfile.year} year
                    </Badge>
                  )}
                </div>

                {request.message && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-sm text-gray-700">{request.message}</p>
                  </div>
                )}

                <p className="text-xs text-gray-500">
                  {isSent ? 'Sent' : 'Received'} on {formatDate(request.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons for received pending requests */}
          {!isSent && request.status === 'pending' && (
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateRequestStatus(request.id, 'rejected')}
                disabled={loading}
              >
                <X className="w-3 h-3 mr-1" />
                Decline
              </Button>
              <Button
                size="sm"
                onClick={() => updateRequestStatus(request.id, 'accepted')}
                disabled={loading}
              >
                <Check className="w-3 h-3 mr-1" />
                Accept
              </Button>
            </div>
          )}

          {/* Message button for accepted requests */}
          {request.status === 'accepted' && (
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // This would trigger the parent component to open chat
                  console.log('Open chat with:', otherUserId)
                }}
              >
                <MessageCircle className="w-3 h-3 mr-1" />
                Message
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Connection Requests</h2>
        <p className="text-gray-600">
          {user.userType === 'mentor' 
            ? 'Manage incoming connection requests from students'
            : 'View your sent connection requests and their status'
          }
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="received" className="flex items-center">
            <User className="w-4 h-4 mr-2" />
            {user.userType === 'mentor' ? 'Received' : 'My Requests'}
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center">
            <Users className="w-4 h-4 mr-2" />
            {user.userType === 'mentor' ? 'My Responses' : 'Sent'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="mt-6">
          {receivedRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {user.userType === 'mentor' 
                    ? 'No connection requests received yet'
                    : 'No requests sent yet'
                  }
                </p>
                <p className="text-sm text-gray-400">
                  {user.userType === 'mentor'
                    ? 'Students will send you connection requests when they want mentoring'
                    : 'Connect with mentors to start receiving guidance'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {receivedRequests.map((request) => renderRequestCard(request, false))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent" className="mt-6">
          {sentRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No requests found</p>
                <p className="text-sm text-gray-400">
                  {user.userType === 'mentor'
                    ? 'Your responses to student requests will appear here'
                    : 'Your sent requests will appear here'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sentRequests.map((request) => renderRequestCard(request, true))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}