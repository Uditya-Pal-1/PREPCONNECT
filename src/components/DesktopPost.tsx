import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { 
  ThumbsUp, 
  MessageCircle, 
  Share, 
  Bookmark, 
  Send,
  Building,
  Calendar,
  MoreVertical
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'student' | 'mentor';
}

interface Post {
  id: string;
  authorId: string;
  title: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  author?: {
    name: string;
    company?: string;
    experience?: string;
    userType: string;
  };
}

interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: string;
  likes: number;
}

interface DesktopPostProps {
  user: User;
  postId: string;
  onNavigate: (view: string, data?: any) => void;
}

export function DesktopPost({ user, postId, onNavigate }: DesktopPostProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [postId]);

  const fetchPost = async () => {
    try {
      // Create sample post for MVP
      const samplePost: Post = {
        id: postId,
        authorId: 'mentor-1',
        title: 'Data Science: The Fuel of Modern Decision Making',
        content: `Data Science is transforming the way businesses, governments, and organizations operate. It involves collecting, cleaning, analyzing, and interpreting vast amounts of data to uncover patterns and make smarter decisions.

Whether it's predicting customer behavior, optimizing supply chains, or detecting fraud, data science brings clarity to complexity. The field combines statistics, programming, and domain expertise to extract meaningful insights from data.

In today's digital age, every click, purchase, and interaction generates data. Companies that can harness this information effectively gain a significant competitive advantage. From Netflix's recommendation algorithms to Google's search results, data science powers the technologies we use daily.

Key areas where data science is making an impact:

1. **Healthcare**: Predictive modeling for disease diagnosis and treatment optimization
2. **Finance**: Risk assessment, fraud detection, and algorithmic trading
3. **Marketing**: Customer segmentation, personalization, and campaign optimization
4. **Transportation**: Route optimization, autonomous vehicles, and traffic management
5. **E-commerce**: Recommendation systems, inventory management, and pricing strategies

The future of data science looks incredibly promising. With advances in machine learning, artificial intelligence, and cloud computing, we're only beginning to scratch the surface of what's possible.

For those interested in entering this field, I recommend starting with Python or R, learning statistics fundamentals, and working on real-world projects. The journey is challenging but incredibly rewarding.

What are your thoughts on the future of data science? Have you worked on any interesting data projects recently? I'd love to hear your experiences in the comments below!`,
        imageUrl: '/api/placeholder/800/400',
        likes: 1234,
        comments: 89,
        shares: 45,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        author: {
          name: 'Sarah Johnson',
          company: 'Google',
          experience: '5+ years',
          userType: 'mentor'
        }
      };
      
      setPost(samplePost);
    } catch (error) {
      console.log('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      // Create sample comments for MVP
      const sampleComments: Comment[] = [
        {
          id: 'comment-1',
          authorId: 'student-1',
          authorName: 'Alex Kumar',
          content: 'This is incredibly insightful! I\'m just starting my journey in data science and this post has given me a clear roadmap. Thank you for sharing your expertise!',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          likes: 12
        },
        {
          id: 'comment-2',
          authorId: 'mentor-2',
          authorName: 'David Chen',
          content: 'Great overview, Sarah! I\'d add that understanding the business context is crucial for any data science project. Technical skills are important, but being able to translate insights into actionable business recommendations is what separates good data scientists from great ones.',
          timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
          likes: 8
        },
        {
          id: 'comment-3',
          authorId: 'student-2',
          authorName: 'Priya Sharma',
          content: 'I\'ve been working on a customer segmentation project for my portfolio. Would love to get your feedback on it sometime!',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          likes: 5
        },
        {
          id: 'comment-4',
          authorId: 'student-3',
          authorName: 'Michael Rodriguez',
          content: 'The healthcare applications you mentioned are fascinating. I\'m particularly interested in the diagnostic modeling aspect. Do you have any recommended resources for getting started in healthcare data science?',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          likes: 3
        }
      ];
      
      setComments(sampleComments);
    } catch (error) {
      console.log('Error fetching comments:', error);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (post) {
      setPost({
        ...post,
        likes: isLiked ? post.likes - 1 : post.likes + 1
      });
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      authorId: user.id,
      authorName: user.name,
      content: newComment.trim(),
      timestamp: new Date().toISOString(),
      likes: 0
    };

    setComments(prev => [...prev, comment]);
    setNewComment('');

    if (post) {
      setPost({
        ...post,
        comments: post.comments + 1
      });
    }
  };

  const handleMentorClick = (authorId: string) => {
    onNavigate('mentor-profile', { mentorId: authorId });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Post not found</p>
        <Button onClick={() => onNavigate('home')} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Main Post */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Post Header */}
          <div className="p-6 pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <Avatar 
                  className="w-12 h-12 cursor-pointer"
                  onClick={() => handleMentorClick(post.authorId)}
                >
                  <AvatarFallback className="bg-gray-700 text-white">
                    {post.author?.name.charAt(0).toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 
                      className="font-medium text-gray-900 cursor-pointer hover:underline"
                      onClick={() => handleMentorClick(post.authorId)}
                    >
                      {post.author?.name || 'Unknown'}
                    </h4>
                    <span className="text-lg">🇮🇳</span>
                  </div>
                  <div className="flex items-center space-x-3 mt-1">
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
                  <p className="text-sm text-gray-500 mt-1 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatTime(post.createdAt)}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Post Content */}
          <div className="px-6 pb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
              {post.title}
            </h1>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {post.content}
              </p>
            </div>
          </div>

          {/* Post Image */}
          {post.imageUrl && (
            <div className="mx-6 mb-4 rounded-lg overflow-hidden">
              <ImageWithFallback
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-80 object-cover"
              />
            </div>
          )}

          {/* Post Actions */}
          <div className="px-6 py-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex items-center space-x-2 ${
                  isLiked ? 'text-blue-600' : 'text-gray-600'
                } hover:text-blue-600`}
                onClick={handleLike}
              >
                <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                <span className="font-medium">{formatNumber(post.likes)}</span>
              </Button>
              
              <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-gray-600 hover:text-green-600">
                <MessageCircle className="w-4 h-4" />
                <span className="font-medium">{formatNumber(post.comments)}</span>
              </Button>
              
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-orange-600">
                <Share className="w-4 h-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className={`${
                  isBookmarked ? 'text-purple-600' : 'text-gray-600'
                } hover:text-purple-600`}
                onClick={handleBookmark}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Comments ({comments.length})</h3>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Comment */}
          <form onSubmit={handleAddComment} className="space-y-4">
            <div className="flex items-start space-x-3">
              <Avatar className="w-10 h-10 bg-blue-600">
                <AvatarFallback className="bg-blue-600 text-white">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <Textarea
                  placeholder="Share your thoughts..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={!newComment.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Post Comment
                  </Button>
                </div>
              </div>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="flex items-start space-x-3">
                <Avatar className="w-10 h-10 bg-gray-600">
                  <AvatarFallback className="bg-gray-600 text-white">
                    {comment.authorName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <h5 className="font-medium text-gray-900">
                        {comment.authorName}
                      </h5>
                      <span className="text-sm text-gray-500">
                        {formatTime(comment.timestamp)}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4 mt-2 ml-4">
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
                      <ThumbsUp className="w-3 h-3 mr-1" />
                      {comment.likes > 0 && <span className="text-xs">{comment.likes}</span>}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-green-600">
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}