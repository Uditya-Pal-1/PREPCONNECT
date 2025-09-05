import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { MessageCircle, Search, Star, MapPin, DollarSign, Users } from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface Mentor {
  id: string
  name: string
  company?: string
  experience?: string
  expertise?: string
  charges?: string
  profileImage?: string
  bio?: string
}

interface MentorListProps {
  onOpenChat: (recipientId: string) => void
}

export function MentorList({ onOpenChat }: MentorListProps) {
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [filteredMentors, setFilteredMentors] = useState<Mentor[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null)
  const [connectionMessage, setConnectionMessage] = useState('')
  const [sendingRequest, setSendingRequest] = useState(false)

  useEffect(() => {
    fetchMentors()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredMentors(mentors)
    } else {
      const filtered = mentors.filter(mentor =>
        mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.expertise?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredMentors(filtered)
    }
  }, [searchTerm, mentors])

  const fetchMentors = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-78cb9030/mentors`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        }
      })

      if (response.ok) {
        const { mentors } = await response.json()
        setMentors(mentors || [])
        setFilteredMentors(mentors || [])
      }
    } catch (error) {
      console.log('Error fetching mentors:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendConnectionRequest = async (mentorId: string) => {
    try {
      setSendingRequest(true)
      const accessToken = localStorage.getItem('prepconnect_access_token')
      
      if (!accessToken) {
        toast.error('Please log in again')
        return
      }

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-78cb9030/connection-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          mentorId,
          message: connectionMessage
        })
      })

      if (response.ok) {
        toast.success('Connection request sent successfully!')
        setConnectionMessage('')
        setSelectedMentor(null)
      } else {
        const errorData = await response.json()
        toast.error(`Failed to send request: ${errorData.error}`)
      }
    } catch (error) {
      console.log('Error sending connection request:', error)
      toast.error('Failed to send connection request')
    } finally {
      setSendingRequest(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Find Mentors</h2>
        <p className="text-gray-600">
          Connect with experienced professionals for guidance and interview preparation
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search mentors by name, company, or expertise..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Mentors Grid */}
      {filteredMentors.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No mentors found</p>
          <p className="text-sm text-gray-400">
            {searchTerm ? 'Try adjusting your search terms' : 'Check back later for new mentors'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map((mentor) => (
            <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                      {mentor.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{mentor.name}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      {mentor.company && (
                        <span className="flex items-center text-sm">
                          <MapPin className="w-3 h-3 mr-1" />
                          {mentor.company}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {mentor.experience && (
                    <Badge variant="secondary" className="text-xs">
                      {mentor.experience} exp
                    </Badge>
                  )}
                  {mentor.expertise && (
                    <Badge variant="outline" className="text-xs">
                      {mentor.expertise}
                    </Badge>
                  )}
                </div>

                {mentor.bio && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {mentor.bio}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2">
                  {mentor.charges && (
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="w-3 h-3 mr-1" />
                      ₹{mentor.charges}/hr
                    </div>
                  )}
                  <div className="flex items-center text-yellow-500">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-xs ml-1">4.8</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => onOpenChat(mentor.id)}
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Message
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setSelectedMentor(mentor)}
                      >
                        Connect
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Connect with {mentor.name}</DialogTitle>
                        <DialogDescription>
                          Send a connection request to start your mentoring journey
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <Avatar>
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {mentor.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{mentor.name}</p>
                            <p className="text-sm text-gray-600">{mentor.company}</p>
                            <div className="flex gap-1 mt-1">
                              {mentor.experience && (
                                <Badge variant="secondary" className="text-xs">
                                  {mentor.experience}
                                </Badge>
                              )}
                              {mentor.expertise && (
                                <Badge variant="outline" className="text-xs">
                                  {mentor.expertise}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Introduction Message (Optional)
                          </label>
                          <Textarea
                            placeholder="Hi! I'm interested in your mentorship for interview preparation. I'd love to connect and learn from your experience..."
                            value={connectionMessage}
                            onChange={(e) => setConnectionMessage(e.target.value)}
                            rows={4}
                          />
                        </div>

                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedMentor(null)
                              setConnectionMessage('')
                            }}
                            disabled={sendingRequest}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => sendConnectionRequest(mentor.id)}
                            disabled={sendingRequest}
                          >
                            {sendingRequest ? 'Sending...' : 'Send Request'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}