import React, { useState, useEffect } from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Badge } from './ui/badge'
import { MessageCircle, Star, MapPin, Building, DollarSign, Calendar, ThumbsUp, Share, Bookmark } from 'lucide-react'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface User {
  id: string
  email: string
  name: string
  userType: 'student' | 'mentor'
}

interface MentorProfile {
  id: string
  name: string
  email: string
  userType: string
  company?: string
  experience?: string
  expertise?: string
  charges?: string
  bio?: string
}

interface Post {
  id: string
  title: string
  content: string
  likes: number
  comments: number
  timestamp: string
}

interface MobileMentorProfileProps {
  user: User
  mentorId: string
  onNavigate: (view: string, data?: any) => void
}

export function MobileMentorProfile({ user, mentorId, onNavigate }: MobileMentorProfileProps) {
  const [mentor, setMentor] = useState<MentorProfile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [stats, setStats] = useState({
    posts: 0,
    connections: 0,
    rating: 4.8
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMentorProfile()
    generateMentorContent()
  }, [mentorId])

  const fetchMentorProfile = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-78cb9030/profile/${mentorId}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        }
      })

      if (response.ok) {
        const { profile } = await response.json()
        setMentor(profile)
      }
    } catch (error) {
      console.log('Error fetching mentor profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMentorContent = () => {
    // Generate sample stats and posts for MVP
    setStats({
      posts: Math.floor(Math.random() * 100) + 50,
      connections: Math.floor(Math.random() * 1000) + 500,
      rating: 4.5 + Math.random() * 0.5
    })

    const samplePosts: Post[] = [
      {
        id: '1',
        title: 'Data Science: The Fuel of Modern Decision Making',
        content: 'Data Science is transforming the way businesses, governments, and organizations operate. It involves collecting, cleaning, analyzing, and interpreting vast amounts of data to uncover patterns and make smarter decisions...',
        likes: 1000000,
        comments: 200,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        title: 'Frontend Development Best Practices',
        content: 'Building modern web applications requires understanding of performance optimization, user experience, and scalable architecture. Here are my top tips for frontend developers...',
        likes: 2500,
        comments: 45,
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        title: 'Technical Interview Preparation Guide',
        content: 'Technical interviews can be challenging, but with the right preparation and mindset, you can excel. Focus on problem-solving, communicate your thought process...',
        likes: 1800,
        comments: 32,
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]

    setPosts(samplePosts)
  }

  const sendConnectionRequest = async () => {
    try {
      const accessToken = localStorage.getItem('prepconnect_access_token')
      
      if (!accessToken) {
        alert('Please log in again')
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
          message: `Hi ${mentor?.name}! I'm interested in your mentorship for interview preparation. I'd love to connect and learn from your experience.`
        })
      })

      if (response.ok) {
        alert('Connection request sent successfully!')
      } else {
        alert('Failed to send connection request')
      }
    } catch (error) {
      console.log('Error sending connection request:', error)
      alert('Failed to send connection request')
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatTime = (timestamp: string) => {
    const now = new Date()
    const postTime = new Date(timestamp)
    const diffInHours = Math.floor((now.getTime() - postTime.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!mentor) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">Mentor not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Header with Gradient */}
      <div className="relative">
        {/* Gradient Background */}
        <div className="h-32 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-transparent to-pink-100/50"></div>
        </div>
        
        {/* Profile Content */}
        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="flex justify-center -mt-16 mb-4">
            <Avatar className="w-24 h-24 bg-blue-600 border-4 border-white shadow-lg">
              <AvatarFallback className="bg-blue-600 text-white text-2xl font-bold">
                {mentor.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* User Info */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center space-x-2">
              <h1 className="text-xl font-bold text-gray-900">{mentor.name}</h1>
              <span className="text-2xl">🇮🇳</span>
            </div>

            {/* Stats */}
            <div className="flex justify-center space-x-8">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{stats.posts}</p>
                <p className="text-sm text-gray-600">Posts</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{formatNumber(stats.connections)}</p>
                <p className="text-sm text-gray-600">connections</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <p className="text-lg font-bold text-gray-900">{stats.rating}</p>
                </div>
                <p className="text-sm text-gray-600">rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="px-6 space-y-4">
        {/* Professional Info */}
        <div className="space-y-3">
          {mentor.company && (
            <div className="flex items-start space-x-3">
              <Building className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Working: {mentor.company}</p>
                {mentor.experience && (
                  <p className="text-sm text-gray-600">Experience: {mentor.experience}</p>
                )}
              </div>
            </div>
          )}

          {mentor.expertise && (
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
              <p className="font-medium text-gray-900">Position: {mentor.expertise}</p>
            </div>
          )}

          {mentor.charges && (
            <div className="flex items-start space-x-3">
              <DollarSign className="w-5 h-5 text-gray-500 mt-0.5" />
              <p className="font-medium text-gray-900">₹{mentor.charges}/hour</p>
            </div>
          )}
        </div>

        {/* Bio */}
        {mentor.bio && (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-700 leading-relaxed">{mentor.bio}</p>
          </div>
        )}

        {/* Expertise Tags */}
        {mentor.expertise && (
          <div className="flex flex-wrap gap-2">
            {mentor.expertise.split(',').map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill.trim()}
              </Badge>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
            onClick={() => onNavigate('chat', { chatId: mentorId })}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Message
          </Button>
          
          <Button
            variant="outline"
            className="font-medium py-3"
            onClick={sendConnectionRequest}
          >
            Connect
          </Button>
        </div>

        {user.userType === 'student' && (
          <Button
            variant="outline"
            className="w-full font-medium py-3"
            onClick={() => alert('Booking feature coming soon!')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Session
          </Button>
        )}
      </div>

      {/* Posts Section */}
      <div className="px-6 pb-8">
        <h3 className="font-semibold text-gray-900 mb-4">Recent Posts</h3>
        <div className="space-y-4">
          {posts.map((post) => (
            <Card 
              key={post.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onNavigate('post', { postId: post.id })}
            >
              <CardContent className="p-4">
                <h4 className="font-medium text-gray-900 mb-2 leading-tight">
                  {post.title}
                </h4>
                <p className="text-gray-700 text-sm leading-relaxed line-clamp-2 mb-3">
                  {post.content}
                </p>
                
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <ThumbsUp className="w-3 h-3" />
                      <span>{formatNumber(post.likes)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{post.comments}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">{formatTime(post.timestamp)}</span>
                    <Button variant="ghost" size="sm" className="p-1">
                      <Share className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-1">
                      <Bookmark className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}