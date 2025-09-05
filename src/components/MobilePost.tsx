import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Avatar, AvatarFallback } from './ui/avatar'
import { ThumbsUp, MessageCircle, Share, Bookmark, MoreVertical } from 'lucide-react'
import { ImageWithFallback } from './figma/ImageWithFallback'

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

interface MobilePostProps {
  user: User
  postId: string
  onNavigate: (view: string, data?: any) => void
}

export function MobilePost({ user, postId, onNavigate }: MobilePostProps) {
  const [post, setPost] = useState<Post | null>(null)
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPost()
  }, [postId])

  const fetchPost = async () => {
    try {
      // For MVP, create sample post based on ID
      const samplePost: Post = {
        id: postId,
        authorId: 'mentor-1',
        title: 'Data Science: The Fuel of Modern Decision Making',
        content: `Data Science is transforming the way businesses, governments, and organizations operate. It involves collecting, cleaning, analyzing, and interpreting vast amounts of data to uncover patterns and make smarter decisions. Whether it's predicting customer behavior, optimizing supply chains, or detecting fraud, data science brings clarity to complexity.

It blends programming, statistics, and domain knowledge to build models that can learn from data. Today, with the rise of AI and big data, data science is no longer optional — it's essential.

Companies that harness the power of data gain a competitive edge, while those who ignore it risk falling behind. In a world overflowing with information, data science helps make sense of it all — and turn it into value read more...`,
        imageUrl: '/api/placeholder/400/300',
        likes: 1000000,
        comments: 200,
        shares: 50,
        createdAt: new Date().toISOString(),
        author: {
          name: 'User Name',
          company: 'TECHNOSCIEN',
          experience: '5+ years',
          userType: 'mentor'
        }
      }

      setPost(samplePost)
    } catch (error) {
      console.log('Error fetching post:', error)
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

  const handleLike = () => {
    setLiked(!liked)
    if (post) {
      setPost({
        ...post,
        likes: liked ? post.likes - 1 : post.likes + 1
      })
    }
  }

  const handleBookmark = () => {
    setBookmarked(!bookmarked)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.content?.substring(0, 100) + '...',
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const handleAuthorClick = () => {
    if (post?.authorId) {
      onNavigate('mentor-profile', { mentorId: post.authorId })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">Post not found</p>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Post Content */}
      <div className="p-6 space-y-6">
        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">
          {post.title}
        </h1>

        {/* Content */}
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {post.content}
          </p>
        </div>

        {/* Post Image */}
        {post.imageUrl && (
          <div className="rounded-lg overflow-hidden">
            <ImageWithFallback
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-64 object-cover"
            />
          </div>
        )}

        {/* Author Info */}
        <div 
          className="flex items-center space-x-3 cursor-pointer"
          onClick={handleAuthorClick}
        >
          <Avatar className="w-12 h-12 bg-gray-700">
            <AvatarFallback className="bg-gray-700 text-white">
              {post.author?.name.charAt(0).toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">
                {post.author?.name || 'Unknown'}
              </h3>
              <span className="text-lg">🇮🇳</span>
            </div>
            <p className="text-sm text-gray-600">Description................</p>
          </div>
        </div>

        {/* Engagement Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <Button
            variant="ghost"
            className={`flex items-center space-x-2 ${liked ? 'text-blue-600' : 'text-gray-600'}`}
            onClick={handleLike}
          >
            <ThumbsUp className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
            <span className="font-semibold">{formatNumber(post.likes)}</span>
          </Button>

          <Button
            variant="ghost"
            className="flex items-center space-x-2 text-gray-600"
            onClick={() => onNavigate('comments', { postId: post.id })}
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-semibold">{formatNumber(post.comments)}</span>
          </Button>

          <Button
            variant="ghost"
            className="text-gray-600"
            onClick={handleShare}
          >
            <Share className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            className={`text-gray-600 ${bookmarked ? 'text-blue-600' : ''}`}
            onClick={handleBookmark}
          >
            <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => onNavigate('chat', { chatId: post.authorId })}
          >
            Message Author
          </Button>
          
          {user.userType === 'student' && post.author?.userType === 'mentor' && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onNavigate('mentor-profile', { mentorId: post.authorId })}
            >
              View Profile
            </Button>
          )}
        </div>

        {/* Related Posts */}
        <div className="pt-8 border-t border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">More from this author</h3>
          
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">
                Frontend Development Best Practices
              </h4>
              <p className="text-sm text-gray-600 line-clamp-2">
                Building modern web applications requires understanding of performance optimization, user experience...
              </p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-500">2 days ago</span>
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  <span>👍 2.5K</span>
                  <span>💬 45</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">
                Technical Interview Preparation Guide
              </h4>
              <p className="text-sm text-gray-600 line-clamp-2">
                Technical interviews can be challenging, but with the right preparation and mindset, you can excel...
              </p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-500">1 week ago</span>
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  <span>👍 1.8K</span>
                  <span>💬 32</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}