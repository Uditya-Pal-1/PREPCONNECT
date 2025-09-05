import React, { useState, useEffect } from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Badge } from './ui/badge'
import { Link, Building, GraduationCap, MapPin, Edit, Settings, LogOut } from 'lucide-react'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface User {
  id: string
  email: string
  name: string
  userType: 'student' | 'mentor'
}

interface Profile {
  id: string
  name: string
  email: string
  userType: string
  company?: string
  college?: string
  experience?: string
  expertise?: string
  charges?: string
  bio?: string
  course?: string
  year?: string
  phone?: string
  linkedin?: string
  github?: string
}

interface MobileProfileProps {
  user: User
  onNavigate: (view: string, data?: any) => void
  onLogout: () => void
}

export function MobileProfile({ user, onNavigate, onLogout }: MobileProfileProps) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState({
    posts: 0,
    connections: 0,
    reviews: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
    generateStats()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-78cb9030/profile/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        }
      })

      if (response.ok) {
        const { profile } = await response.json()
        setProfile(profile)
      }
    } catch (error) {
      console.log('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateStats = () => {
    // Generate demo stats for MVP
    setStats({
      posts: Math.floor(Math.random() * 200) + 10,
      connections: Math.floor(Math.random() * 2000) + 100,
      reviews: Math.floor(Math.random() * 50) + 5
    })
  }

  const navigationButtons = [
    { label: 'Home', id: 'home', color: 'bg-blue-600' },
    { label: 'Post', id: 'create', color: 'bg-blue-600' },
    { label: 'Blogs', id: 'posts', color: 'bg-blue-600' },
    { label: 'Meeting', id: 'chat', color: 'bg-blue-600' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Header with Gradient */}
      <div className="relative">
        {/* Gradient Background */}
        <div className="h-32 bg-gradient-to-r from-orange-200 via-pink-200 to-green-200 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-100/50 via-transparent to-green-100/50"></div>
        </div>
        
        {/* Profile Content */}
        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="flex justify-center -mt-16 mb-4">
            <Avatar className="w-24 h-24 bg-orange-500 border-4 border-white shadow-lg">
              <AvatarFallback className="bg-orange-500 text-white text-2xl font-bold">
                {profile?.name?.charAt(0)?.toUpperCase() || user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* User Info */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center space-x-2">
              <h1 className="text-xl font-bold text-gray-900">
                {profile?.name || user.name}
              </h1>
              <span className="text-2xl">🇮🇳</span>
            </div>

            {/* Stats */}
            <div className="flex justify-center space-x-8">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{stats.posts}</p>
                <p className="text-sm text-gray-600">Posts</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{stats.connections}</p>
                <p className="text-sm text-gray-600">connections</p>
              </div>
              {user.userType === 'mentor' && (
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{stats.reviews}</p>
                  <p className="text-sm text-gray-600">reviews</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="px-6 space-y-4">
        {/* Professional Info */}
        <div className="space-y-3">
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
        </div>

        {/* Bio */}
        {profile?.bio && (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-700 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Expertise Tags */}
        {profile?.expertise && (
          <div className="flex flex-wrap gap-2">
            {profile.expertise.split(',').map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill.trim()}
              </Badge>
            ))}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {navigationButtons.map((button) => (
            <Button
              key={button.id}
              className={`${button.color} hover:opacity-90 text-white font-medium py-3`}
              onClick={() => onNavigate(button.id)}
            >
              {button.label}
            </Button>
          ))}
        </div>

        {/* Settings Section */}
        <Card className="mt-6">
          <CardContent className="p-4 space-y-3">
            <Button
              variant="ghost"
              className="w-full justify-start text-left"
              onClick={() => onNavigate('profile-settings')}
            >
              <Edit className="w-4 h-4 mr-3" />
              Edit Profile
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start text-left"
              onClick={() => onNavigate('settings')}
            >
              <Settings className="w-4 h-4 mr-3" />
              Settings
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start text-left text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={onLogout}
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Preview */}
      <div className="px-6 pb-8">
        <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700">
                <span className="font-medium">{user.name}</span> shared insights about interview preparation
              </p>
              <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-green-100 text-green-600 text-sm">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700">
                <span className="font-medium">{user.name}</span> {user.userType === 'mentor' ? 'helped a student with mock interview' : 'connected with a new mentor'}
              </p>
              <p className="text-xs text-gray-500 mt-1">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}