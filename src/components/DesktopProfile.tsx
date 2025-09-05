import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Link, 
  Building, 
  GraduationCap, 
  MapPin, 
  Edit, 
  Settings, 
  LogOut,
  FileText,
  Users,
  Star,
  Calendar,
  Trophy,
  Activity
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'student' | 'mentor';
}

interface Profile {
  id: string;
  name: string;
  email: string;
  userType: string;
  company?: string;
  college?: string;
  experience?: string;
  expertise?: string;
  charges?: string;
  bio?: string;
  course?: string;
  year?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
}

interface DesktopProfileProps {
  user: User;
  onNavigate: (view: string, data?: any) => void;
  onLogout: () => void;
}

export function DesktopProfile({ user, onNavigate, onLogout }: DesktopProfileProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState({
    posts: 0,
    connections: 0,
    reviews: 0,
    sessions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    generateStats();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-78cb9030/profile/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        }
      });

      if (response.ok) {
        const { profile } = await response.json();
        setProfile(profile);
      }
    } catch (error) {
      console.log('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateStats = () => {
    // Generate demo stats for MVP
    setStats({
      posts: Math.floor(Math.random() * 200) + 10,
      connections: Math.floor(Math.random() * 2000) + 100,
      reviews: Math.floor(Math.random() * 50) + 5,
      sessions: Math.floor(Math.random() * 100) + 10
    });
  };

  const recentActivities = [
    {
      id: 1,
      type: 'post',
      title: 'Shared insights about interview preparation',
      time: '2 hours ago',
      icon: FileText
    },
    {
      id: 2,
      type: 'connection',
      title: user.userType === 'mentor' ? 'Helped a student with mock interview' : 'Connected with a new mentor',
      time: '1 day ago',
      icon: Users
    },
    {
      id: 3,
      type: 'achievement',
      title: 'Reached 100+ connections milestone',
      time: '3 days ago',
      icon: Trophy
    },
    {
      id: 4,
      type: 'session',
      title: user.userType === 'mentor' ? 'Completed mentoring session' : 'Attended mentoring session',
      time: '5 days ago',
      icon: Calendar
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-orange-200 via-pink-200 to-green-200 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-100/50 via-transparent to-green-100/50"></div>
        </div>
        <CardContent className="relative -mt-16 px-8 pb-8">
          <div className="flex items-end space-x-6">
            <Avatar className="w-32 h-32 bg-orange-500 border-4 border-white shadow-lg">
              <AvatarFallback className="bg-orange-500 text-white text-4xl font-bold">
                {profile?.name?.charAt(0)?.toUpperCase() || user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {profile?.name || user.name}
                    </h1>
                    <span className="text-2xl">🇮🇳</span>
                    <Badge variant="secondary" className="capitalize">
                      {user.userType}
                    </Badge>
                  </div>
                  {profile?.bio && (
                    <p className="text-gray-600 mt-2 max-w-2xl">{profile.bio}</p>
                  )}
                </div>
                <div className="flex space-x-3">
                  <Button onClick={() => onNavigate('profile-settings')}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" onClick={() => onNavigate('settings')}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-6 mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.posts}</p>
              <p className="text-sm text-gray-600">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.connections}</p>
              <p className="text-sm text-gray-600">Connections</p>
            </div>
            {user.userType === 'mentor' && (
              <>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{stats.reviews}</p>
                  <p className="text-sm text-gray-600">Reviews</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{stats.sessions}</p>
                  <p className="text-sm text-gray-600">Sessions</p>
                </div>
              </>
            )}
            {user.userType === 'student' && (
              <>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{stats.sessions}</p>
                  <p className="text-sm text-gray-600">Sessions</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">4.8</p>
                  <p className="text-sm text-gray-600">Rating</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="about" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="connections">Connections</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="space-y-6">
              {/* Professional Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Professional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile?.college && (
                    <div className="flex items-start space-x-3">
                      <GraduationCap className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">College: {profile.college}</p>
                        {profile.course && (
                          <p className="text-sm text-gray-600">{profile.course}</p>
                        )}
                        {profile.year && (
                          <p className="text-sm text-gray-600">{profile.year} year</p>
                        )}
                      </div>
                    </div>
                  )}

                  {profile?.company && (
                    <div className="flex items-start space-x-3">
                      <Building className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Working: {profile.company}</p>
                        {profile.experience && (
                          <p className="text-sm text-gray-600">Experience: {profile.experience}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {profile?.expertise && (
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                      <p className="font-medium text-gray-900">Position: {profile.expertise}</p>
                    </div>
                  )}

                  {profile?.linkedin && (
                    <div className="flex items-start space-x-3">
                      <Link className="w-5 h-5 text-gray-500 mt-0.5" />
                      <a 
                        href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {profile.linkedin.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Skills */}
              {profile?.expertise && (
                <Card>
                  <CardHeader>
                    <CardTitle>Skills & Expertise</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profile.expertise.split(',').map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill.trim()}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="posts">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((_, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Sample Post Title {index + 1}
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">
                          This is a sample post content that would show the user's recent posts and activities.
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>2 days ago</span>
                          <span>•</span>
                          <span>45 likes</span>
                          <span>•</span>
                          <span>12 comments</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => {
                      const Icon = activity.icon;
                      return (
                        <div key={activity.id} className="flex items-start space-x-3">
                          <div className="p-2 bg-gray-100 rounded-full">
                            <Icon className="w-4 h-4 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{activity.title}</p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="connections">
              <Card>
                <CardHeader>
                  <CardTitle>Connections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((_, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                        <Avatar className="w-10 h-10 bg-blue-500">
                          <AvatarFallback className="bg-blue-500 text-white">
                            U{index + 1}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">
                            User Name {index + 1}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user.userType === 'student' ? 'Mentor' : 'Student'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onNavigate('create')}
              >
                <FileText className="w-4 h-4 mr-3" />
                Create Post
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onNavigate('chat')}
              >
                <Users className="w-4 h-4 mr-3" />
                Message Someone
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onNavigate('home')}
              >
                <Activity className="w-4 h-4 mr-3" />
                View Feed
              </Button>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => onNavigate('profile-settings')}
              >
                <Edit className="w-4 h-4 mr-3" />
                Edit Profile
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => onNavigate('settings')}
              >
                <Settings className="w-4 h-4 mr-3" />
                Settings
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={onLogout}
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </Button>
            </CardContent>
          </Card>

          {/* Performance */}
          {user.userType === 'mentor' && (
            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Rating</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">4.8</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Response Time</span>
                  <span className="font-medium">&lt; 2 hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="font-medium">95%</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}