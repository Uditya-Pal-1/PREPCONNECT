import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { ImageIcon, FileText, Link, Tag, Send } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId } from '../utils/supabase/info';

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'student' | 'mentor';
}

interface DesktopCreateProps {
  user: User;
  onNavigate: (view: string, data?: any) => void;
}

export function DesktopCreate({ user, onNavigate }: DesktopCreateProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in both title and content');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const accessToken = localStorage.getItem('prepconnect_access_token');
      if (!accessToken) {
        toast.error('Please log in to create a post');
        return;
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
      });

      if (response.ok) {
        toast.success('Post created successfully!');
        
        // Reset form
        setTitle('');
        setContent('');
        setTags('');
        setImageUrl('');
        
        // Navigate back to home
        onNavigate('home');
      } else {
        const { error } = await response.json();
        toast.error(error || 'Failed to create post');
      }
    } catch (error) {
      console.log('Error creating post:', error);
      toast.error('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
  ];

  const useTemplate = (template: typeof postTemplates[0]) => {
    setTitle(template.title);
    setContent(template.content);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Create Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Create New Post</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Author Info */}
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <Avatar className="w-12 h-12 bg-blue-600">
                  <AvatarFallback className="bg-blue-600 text-white">
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

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Post Title *
                  </label>
                  <Input
                    placeholder="Write an engaging title for your post..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-lg"
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500">
                    {title.length}/100 characters
                  </p>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Content *
                  </label>
                  <Textarea
                    placeholder="Share your insights, experiences, or knowledge with the community..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[200px] resize-none"
                    maxLength={2000}
                  />
                  <p className="text-xs text-gray-500">
                    {content.length}/2000 characters
                  </p>
                </div>

                {/* Optional Fields */}
                <div className="space-y-4">
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
                </div>

                {/* Preview */}
                {(title || content) && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Preview</h4>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
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
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onNavigate('home')}
                  >
                    Cancel
                  </Button>
                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isSubmitting}
                    >
                      Save Draft
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || !title.trim() || !content.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Publish Post
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {postTemplates.map((template, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left h-auto p-3"
                  onClick={() => useTemplate(template)}
                >
                  <div>
                    <p className="font-medium text-sm">{template.title}</p>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {template.content}
                    </p>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Writing Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Writing Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 font-medium">•</span>
                  <p className="text-gray-700">Write a clear, engaging title that summarizes your post</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 font-medium">•</span>
                  <p className="text-gray-700">Share personal experiences and practical insights</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 font-medium">•</span>
                  <p className="text-gray-700">Use relevant tags to help others find your content</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 font-medium">•</span>
                  <p className="text-gray-700">Include actionable advice when possible</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 font-medium">•</span>
                  <p className="text-gray-700">Proofread before publishing</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Community Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Community Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600 space-y-2">
                <p>• Be respectful and professional</p>
                <p>• Share genuine experiences</p>
                <p>• Avoid spam or self-promotion</p>
                <p>• Help others learn and grow</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}