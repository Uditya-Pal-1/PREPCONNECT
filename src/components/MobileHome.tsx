import React, { useState, useEffect } from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Badge } from './ui/badge'
import { ThumbsUp, MessageCircle, Share, Bookmark, MapPin, Building, FileText } from 'lucide-react'
import { ImageWithFallback } from './figma/ImageWithFallback'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface User {
  id: string
  email: string
  name: string
  userType: 'student' | 'mentor'
}

interface Post {
  id: string
  authorId: string
  title: string
  content: string
  imageUrl?: string
  likes: number
  comments: number
  shares: number
  createdAt: string
  author?: {
    name: string
    company?: string
    experience?: string
    userType: string
  }
}

interface MobileHomeProps {
  user: User
  onNavigate: (view: string, data?: any) => void
  activeFilter?: string
}

export function MobileHome({ user, onNavigate, activeFilter = 'home' }: MobileHomeProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [mentors, setMentors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [likingPost, setLikingPost] = useState<string | null>(null)

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      // Fetch mentors for discovery
      const mentorsResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-78cb9030/mentors`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        }
      })

      if (mentorsResponse.ok) {
        const { mentors } = await mentorsResponse.json()
        setMentors(mentors || [])
      }

      // Fetch real posts from the database
      const postsResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-78cb9030/posts?limit=20`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        }
      })

      if (postsResponse.ok) {
        const { posts } = await postsResponse.json()
        setPosts(posts || [])
        
        // Check which posts the user has liked
        if (posts?.length > 0) {
          const accessToken = localStorage.getItem('prepconnect_access_token')
          if (accessToken) {
            const likeChecks = posts.map(async (post: Post) => {
              try {
                const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-78cb9030/posts/${post.id}/likes/${user.id}`, {
                  headers: {
                    'Authorization': `Bearer ${accessToken}`,
                  }
                })
                if (response.ok) {
                  const { liked } = await response.json()
                  return { postId: post.id, liked }
                }
                return null
              } catch (error) {
                return null
              }
            })
            
            const results = await Promise.all(likeChecks)
            const userLikedPosts = new Set<string>()
            results.forEach(result => {
              if (result?.liked) {
                userLikedPosts.add(result.postId)
              }
            })
            setLikedPosts(userLikedPosts)
          }
        }
      }
    } catch (error) {
      console.log('Error fetching content:', error)
    } finally {
      setLoading(false)
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
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  const handlePostClick = (post: Post) => {
    onNavigate('post', { postId: post.id })
  }

  const handleMentorClick = (mentorId: string) => {
    onNavigate('mentor-profile', { mentorId })
  }

  const handleProfileClick = () => {
    onNavigate('profile')
  }

  const handleLike = async (post: Post) => {
    const accessToken = localStorage.getItem('prepconnect_access_token')
    if (!accessToken) return

    setLikingPost(post.id)
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-78cb9030/posts/${post.id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const { liked, likes } = await response.json()
        
        // Update local state
        setPosts(prevPosts => 
          prevPosts.map(p => 
            p.id === post.id ? { ...p, likes } : p
          )
        )

        setLikedPosts(prev => {
          const newSet = new Set(prev)
          if (liked) {
            newSet.add(post.id)
          } else {
            newSet.delete(post.id)
          }
          return newSet
        })
      }
    } catch (error) {
      console.log('Error liking post:', error)
    } finally {
      setLikingPost(null)
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
    <div className="space-y-4 p-4">
      {/* User Quick Access */}
      <Card className="bg-gradient-to-r from-orange-100 via-pink-100 to-green-100 border-none">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3" onClick={handleProfileClick}>
            <Avatar className="w-12 h-12 bg-orange-500 border-2 border-white">
              <AvatarFallback className="bg-orange-500 text-white font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900">{user.name}</h3>
                <span className="text-lg">🇮🇳</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {user.userType === 'student' ? 'Student' : 'Mentor'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Featured Mentors (for students) */}
      {user.userType === 'student' && mentors.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-900 px-1">Featured Mentors</h2>
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {mentors.slice(0, 5).map((mentor) => (
              <div
                key={mentor.id}
                className="flex-shrink-0 w-20 text-center cursor-pointer"
                onClick={() => handleMentorClick(mentor.id)}
              >
                <Avatar className="w-16 h-16 mx-auto bg-blue-100 border-2 border-white shadow-sm">
                  <AvatarFallback className="bg-blue-500 text-white">
                    {mentor.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <p className="text-xs font-medium text-gray-900 mt-1 truncate">
                  {mentor.name.split(' ')[0]}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {mentor.company || 'Mentor'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Posts Feed */}
      <div className="space-y-4">
        {activeFilter === 'home' && (
          <h2 className="font-semibold text-gray-900 px-1">Latest Posts</h2>
        )}
        
        {posts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No posts yet</p>
              <p className="text-sm text-gray-400">Be the first to share insights!</p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Post Header */}
                <div className="p-4 pb-3">
                  <div className="flex items-start space-x-3">
                    <Avatar 
                      className="w-10 h-10 cursor-pointer"
                      onClick={() => handleMentorClick(post.authorId)}
                    >
                      <AvatarFallback className="bg-gray-700 text-white">
                        {post.author?.name.charAt(0).toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 
                          className="font-medium text-gray-900 cursor-pointer hover:underline"
                          onClick={() => handleMentorClick(post.authorId)}
                        >
                          {post.author?.name || 'Unknown'}
                        </h4>
                        <span className="text-lg">🇮🇳</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        {post.author?.company && (
                          <p className="text-sm text-gray-600 flex items-center">
                            <Building className="w-3 h-3 mr-1" />
                            {post.author.company}
                          </p>
                        )}
                        {post.author?.experience && (
                          <Badge variant="outline" className="text-xs">
                            {post.author.experience}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTime(post.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <div 
                  className="px-4 pb-3 cursor-pointer"
                  onClick={() => handlePostClick(post)}
                >
                  <h3 className="font-semibold text-gray-900 mb-2 leading-tight">
                    {post.title}
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                    {post.content}
                  </p>
                  {post.content.length > 150 && (
                    <span className="text-blue-600 text-sm font-medium cursor-pointer">
                      read more...
                    </span>
                  )}
                </div>

                {/* Post Image */}
                {post.imageUrl && (
                  <div className="mx-4 mb-3 rounded-lg overflow-hidden">
                    <ImageWithFallback
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}

                {/* Post Actions */}
                <div className="px-4 py-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`flex items-center space-x-2 ${
                        likedPosts.has(post.id) 
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-gray-600'
                      }`}
                      onClick={() => handleLike(post)}
                      disabled={likingPost === post.id}
                    >
                      {likingPost === post.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                      ) : (
                        <ThumbsUp className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-blue-600' : ''}`} />
                      )}
                      <span className="text-sm font-medium">{formatNumber(post.likes || 0)}</span>
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center space-x-2 text-gray-600"
                      onClick={() => handlePostClick(post)}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">{formatNumber(post.comments || 0)}</span>
                    </Button>
                    
                    <Button variant="ghost" size="sm" className="text-gray-600">
                      <Share className="w-4 h-4" />
                    </Button>
                    
                    <Button variant="ghost" size="sm" className="text-gray-600">
                      <Bookmark className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}