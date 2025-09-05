import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Badge } from './ui/badge'
import { ArrowLeft, Send, ImageIcon, Tag } from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { projectId } from '../utils/supabase/info'

interface User {
  id: string
  email: string
  name: string
  userType: 'student' | 'mentor'
}

interface MobileCreateContentProps {
  user: User
  contentType: string
  onNavigate: (view: string, data?: any) => void
}

export function MobileCreateContent({ user, contentType, onNavigate }: MobileCreateContentProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in both title and content')
      return
    }

    setIsSubmitting(true)
    
    try {
      const accessToken = localStorage.getItem('prepconnect_access_token')
      if (!accessToken) {
        toast.error('Please log in to create a post')
        return
      }

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-78cb9030/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          imageUrl: imageUrl.trim() || null,
          tags: tags.trim()
        })
      })

      if (response.ok) {
        toast.success('Post created successfully!')
        
        // Reset form
        setTitle('')
        setContent('')
        setTags('')
        setImageUrl('')
        
        // Navigate back to home
        onNavigate('home')
      } else {
        const { error } = await response.json()
        toast.error(error || 'Failed to create post')
      }
    } catch (error) {
      console.log('Error creating post:', error)
      toast.error('Failed to create post. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const postTemplates = [
    {
      title: 'Interview Experience',
      content: 'Share your recent interview experience and help others prepare better...'
    },
    {
      title: 'Learning Resource',
      content: 'I recently discovered this amazing resource that helped me learn...'
    },
    {
      title: 'Career Advice',
      content: 'Based on my experience in the industry, here are some tips for...'
    },
    {
      title: 'Technical Insight',
      content: 'Let me share some insights about the latest trends in...'
    }
  ]

  const useTemplate = (template: typeof postTemplates[0]) => {
    setTitle(template.title)
    setContent(template.content)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onNavigate('create')}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-semibold text-gray-900">
              Create {contentType === 'post' ? 'Post' : 'Article'}
            </h1>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim() || !content.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
            size="sm"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Publishing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Publish
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Author Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12 bg-orange-500">
                <AvatarFallback className="bg-orange-500 text-white">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-gray-900">{user.name}</p>
                <Badge variant="secondary" className="text-xs capitalize">
                  {user.userType}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Templates */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Templates</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-2">
              {postTemplates.map((template, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-3 text-left justify-start"
                  onClick={() => useTemplate(template)}
                >
                  <div>
                    <p className="font-medium text-xs">{template.title}</p>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Title *
                </label>
                <Input
                  placeholder="Write an engaging title for your post..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-base"
                  maxLength={100}
                />
                <p className="text-xs text-gray-500">
                  {title.length}/100 characters
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Content *
                </label>
                <Textarea
                  placeholder="Share your insights, experiences, or knowledge with the community..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[150px] resize-none text-base"
                  maxLength={2000}
                />
                <p className="text-xs text-gray-500">
                  {content.length}/2000 characters
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Optional Fields */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Image URL (optional)
                </label>
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  type="url"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Tag className="w-4 h-4 mr-2" />
                  Tags (optional)
                </label>
                <Input
                  placeholder="e.g., javascript, career, interview, data-science"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Separate tags with commas
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {(title || content) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  {title && (
                    <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                  )}
                  {content && (
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {content}
                    </p>
                  )}
                  {tags && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {tags.split(',').map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </form>

        {/* Writing Tips */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h4 className="font-medium text-blue-900 mb-2">💡 Writing Tips</h4>
            <div className="space-y-1 text-sm text-blue-800">
              <p>• Write a clear, engaging title</p>
              <p>• Share personal experiences</p>
              <p>• Use relevant tags to help others find your content</p>
              <p>• Include actionable advice when possible</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}