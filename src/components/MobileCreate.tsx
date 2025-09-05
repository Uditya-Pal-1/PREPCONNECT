import React, { useState } from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Plus, Camera, FileText, Video, Mic, Image } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string
  userType: 'student' | 'mentor'
}

interface MobileCreateProps {
  user: User
  onNavigate: (view: string, data?: any) => void
}

export function MobileCreate({ user, onNavigate }: MobileCreateProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null)

  const createOptions = [
    {
      id: 'post',
      title: 'Create Post',
      description: 'Share insights, tips, or experiences',
      icon: FileText,
      color: 'bg-blue-500',
      available: true
    },
    {
      id: 'blog',
      title: 'Write Article',
      description: 'Share detailed knowledge and tutorials',
      icon: FileText,
      color: 'bg-purple-500',
      available: true
    },
    {
      id: 'video',
      title: 'Record Video',
      description: 'Create video content for students',
      icon: Video,
      color: 'bg-red-500',
      available: false
    },
    {
      id: 'audio',
      title: 'Voice Note',
      description: 'Record audio tips and advice',
      icon: Mic,
      color: 'bg-green-500',
      available: false
    },
    {
      id: 'image',
      title: 'Share Image',
      description: 'Upload photos with captions',
      icon: Image,
      color: 'bg-orange-500',
      available: false
    }
  ]

  const handleCreateContent = (type: string) => {
    if (type === 'post' || type === 'blog') {
      onNavigate('create-content', { type })
    } else {
      alert('This feature is coming soon!')
    }
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Create Content</h1>
        <p className="text-gray-600">
          {user.userType === 'mentor' 
            ? 'Share your expertise and help students grow'
            : 'Share your learning journey and connect with peers'
          }
        </p>
      </div>

      {/* Quick Actions - Large Buttons */}
      <div className="space-y-4">
        <Card className="border-2 border-dashed border-gray-200 bg-gray-50">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              {/* Main Create Icons */}
              <div className="flex justify-center space-x-8">
                <button
                  onClick={() => handleCreateContent('post')}
                  className="flex flex-col items-center space-y-3 p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center border-2 border-gray-200">
                    <Plus className="w-8 h-8 text-gray-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Add</span>
                </button>

                <button
                  onClick={() => alert('Camera feature coming soon!')}
                  className="flex flex-col items-center space-y-3 p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Camera</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={() => handleCreateContent('post')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                >
                  Post
                </Button>
                <Button
                  onClick={() => handleCreateContent('blog')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                >
                  blog
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Type Options */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">What would you like to create?</h3>
        
        <div className="grid grid-cols-1 gap-3">
          {createOptions.map((option) => {
            const Icon = option.icon
            return (
              <Card 
                key={option.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  !option.available ? 'opacity-60' : 'hover:scale-[1.02]'
                }`}
                onClick={() => option.available ? handleCreateContent(option.id) : null}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${option.color} rounded-xl flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">{option.title}</h4>
                        {!option.available && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                            Soon
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                    </div>
                    
                    {option.available && (
                      <div className="text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Tips Section */}
      {user.userType === 'mentor' && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h4 className="font-medium text-blue-900 mb-2">💡 Content Tips for Mentors</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <p>• Share real industry experiences and challenges</p>
              <p>• Provide actionable tips for interview preparation</p>
              <p>• Create step-by-step guides for complex topics</p>
              <p>• Use examples from your professional journey</p>
            </div>
          </CardContent>
        </Card>
      )}

      {user.userType === 'student' && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <h4 className="font-medium text-green-900 mb-2">🌱 Content Ideas for Students</h4>
            <div className="space-y-2 text-sm text-green-800">
              <p>• Share your learning progress and milestones</p>
              <p>• Ask questions about career guidance</p>
              <p>• Document your project building journey</p>
              <p>• Share useful resources you've discovered</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}