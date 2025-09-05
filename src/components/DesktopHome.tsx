import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { ThumbsUp, MessageCircle, Share, Bookmark, MapPin, Building, FileText, Users, TrendingUp } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { projectId, publicAnonKey } from '../utils/supabase/info';

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

interface DesktopHomeProps {
  user: User;
  onNavigate: (view: string, data?: any) => void;
  activeFilter?: string;
}

export function DesktopHome({ user, onNavigate, activeFilter = 'home' }: DesktopHomeProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [likingPost, setLikingPost] = useState<string | null>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      // Fetch mentors for discovery
      const mentorsResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-78cb9030/mentors`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        }
      });

      if (mentorsResponse.ok) {
        const { mentors } = await mentorsResponse.json();
        setMentors(mentors || []);
      }

      // Fetch real posts from the database
      const postsResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-78cb9030/posts?limit=20`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        }
      });

      if (postsResponse.ok) {
        const { posts } = await postsResponse.json();
        setPosts(posts || []);
        
        // Check which posts the user has liked
        if (posts?.length > 0) {
          const accessToken = localStorage.getItem('prepconnect_access_token');
          if (accessToken) {
            const likeChecks = posts.map(async (post: Post) => {
              try {
                const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-78cb9030/posts/${post.id}/likes/${user.id}`, {
                  headers: {
                    'Authorization': `Bearer ${accessToken}`,
                  }
                });
                if (response.ok) {
                  const { liked } = await response.json();
                  return { postId: post.id, liked };
                }
                return null;
              } catch (error) {
                return null;
              }
            });
            
            const results = await Promise.all(likeChecks);
            const userLikedPosts = new Set<string>();
            results.forEach(result => {
              if (result?.liked) {
                userLikedPosts.add(result.postId);
              }
            });
            setLikedPosts(userLikedPosts);
          }
        }
      }
    } catch (error) {
      console.log('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - postTime.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handlePostClick = (post: Post) => {
    onNavigate('post', { postId: post.id });
  };

  const handleMentorClick = (mentorId: string) => {
    onNavigate('mentor-profile', { mentorId });
  };

  const handleLike = async (post: Post) => {
    const accessToken = localStorage.getItem('prepconnect_access_token');
    if (!accessToken) return;

    setLikingPost(post.id);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-78cb9030/posts/${post.id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const { liked, likes } = await response.json();
        
        // Update local state
        setPosts(prevPosts => 
          prevPosts.map(p => 
            p.id === post.id ? { ...p, likes } : p
          )
        );

        setLikedPosts(prev => {
          const newSet = new Set(prev);
          if (liked) {
            newSet.add(post.id);
          } else {
            newSet.delete(post.id);
          }
          return newSet;
        });
      }
    } catch (error) {
      console.log('Error liking post:', error);
    } finally {
      setLikingPost(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Welcome Card */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16 bg-blue-600">
                  <AvatarFallback className="bg-blue-600 text-white text-xl">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Welcome back, {user.name}!
                  </h2>
                  <p className="text-gray-600">
                    {user.userType === 'student' 
                      ? 'Discover insights from experienced mentors and grow your career.' 
                      : 'Share your knowledge and help students succeed in their journey.'}
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    {user.userType === 'student' ? 'Student' : 'Mentor'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Posts Feed */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {activeFilter === 'posts' ? 'All Posts' : 'Latest Posts'}
              </h2>
              <Button variant="outline" onClick={() => onNavigate('create')}>
                <FileText className="w-4 h-4 mr-2" />
                Create Post
              </Button>
            </div>
            
            {posts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-500 mb-4">Be the first to share insights with the community!</p>
                  <Button onClick={() => onNavigate('create')}>
                    Create Your First Post
                  </Button>
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-0">
                    {/* Post Header */}
                    <div className="p-6 pb-4">
                      <div className="flex items-start space-x-4">
                        <Avatar 
                          className="w-12 h-12 cursor-pointer"
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
                          <p className="text-sm text-gray-500 mt-1">
                            {formatTime(post.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div 
                      className="px-6 pb-4 cursor-pointer"
                      onClick={() => handlePostClick(post)}
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 leading-tight">
                        {post.title}
                      </h3>
                      <p className="text-gray-700 leading-relaxed line-clamp-4">
                        {post.content}
                      </p>
                      {post.content.length > 200 && (
                        <span className="text-blue-600 font-medium cursor-pointer hover:underline">
                          Read more
                        </span>
                      )}
                    </div>

                    {/* Post Image */}
                    {post.imageUrl && (
                      <div className="mx-6 mb-4 rounded-lg overflow-hidden">
                        <ImageWithFallback
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-full h-64 object-cover cursor-pointer"
                          onClick={() => handlePostClick(post)}
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
                            likedPosts.has(post.id) 
                              ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
                              : 'text-gray-600 hover:text-blue-600'
                          }`}
                          onClick={() => handleLike(post)}
                          disabled={likingPost === post.id}
                        >
                          {likingPost === post.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                          ) : (
                            <ThumbsUp className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-blue-600' : ''}`} />
                          )}
                          <span className="font-medium">{formatNumber(post.likes || 0)}</span>
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex items-center space-x-2 text-gray-600 hover:text-green-600"
                          onClick={() => handlePostClick(post)}
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span className="font-medium">{formatNumber(post.comments || 0)}</span>
                        </Button>
                        
                        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-orange-600">
                          <Share className="w-4 h-4" />
                        </Button>
                        
                        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-purple-600">
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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Featured Mentors */}
          {user.userType === 'student' && mentors.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Featured Mentors
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                {mentors.slice(0, 4).map((mentor) => (
                  <div
                    key={mentor.id}
                    className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    onClick={() => handleMentorClick(mentor.id)}
                  >
                    <Avatar className="w-10 h-10 bg-blue-500">
                      <AvatarFallback className="bg-blue-500 text-white">
                        {mentor.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {mentor.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {mentor.company || 'Mentor'}
                      </p>
                    </div>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => onNavigate('mentors')}
                >
                  View All Mentors
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Trending Topics */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Trending Topics
              </h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                'Data Science',
                'Frontend Development',
                'Machine Learning',
                'Career Growth',
                'Interview Tips'
              ].map((topic, index) => (
                <div key={topic} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{topic}</span>
                  <Badge variant="secondary" className="text-xs">
                    {Math.floor(Math.random() * 100) + 20}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900">Community Stats</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">2.5K+</p>
                <p className="text-sm text-gray-600">Active Members</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">150+</p>
                <p className="text-sm text-gray-600">Expert Mentors</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">500+</p>
                <p className="text-sm text-gray-600">Success Stories</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}