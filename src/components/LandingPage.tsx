import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'
import { useAuth } from './AuthContext'
import { Users, MessageCircle, Upload, Zap } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string
  userType: 'student' | 'mentor'
}

interface LandingPageProps {
  onLogin: (user: User) => void
}

export function LandingPage({ onLogin }: LandingPageProps) {
  const [activeTab, setActiveTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, signup } = useAuth()

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })

  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    name: '',
    userType: '',
    // Student fields
    college: '',
    course: '',
    year: '',
    // Mentor fields
    company: '',
    experience: '',
    expertise: '',
    charges: '',
    bio: ''
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const user = await login(loginForm.email, loginForm.password)
      onLogin(user)
    } catch (error: any) {
      setError(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const user = await signup(signupForm)
      onLogin(user)
    } catch (error: any) {
      setError(error.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Technoscien PrepConnect</span>
            </div>
            <div className="hidden md:flex items-center space-x-8 text-sm text-gray-600">
              <span>Connect with Expert Mentors</span>
              <span>•</span>
              <span>Interview Preparation</span>
              <span>•</span>
              <span>Career Guidance</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Hero */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Your Gateway to
                <span className="text-blue-600 block">Interview Success</span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Connect with experienced mentors from top companies. Get personalized guidance, 
                practice interviews, and accelerate your career growth.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">1:1 Mentoring</h3>
                  <p className="text-sm text-gray-600">Direct messaging with industry experts</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Upload className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Resume Review</h3>
                  <p className="text-sm text-gray-600">Upload and get feedback on your resume</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Fast Connections</h3>
                  <p className="text-sm text-gray-600">Quick mentor matching and responses</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Expert Network</h3>
                  <p className="text-sm text-gray-600">Mentors from top tech companies</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Forms */}
          <div className="max-w-md mx-auto w-full">
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <CardTitle>Join PrepConnect</CardTitle>
                <CardDescription>
                  Start your journey to interview success
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="your@email.com"
                          value={loginForm.email}
                          onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                          required
                        />
                      </div>

                      {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                          {error}
                        </div>
                      )}

                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup">
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="signup-name">Name</Label>
                          <Input
                            id="signup-name"
                            placeholder="Full name"
                            value={signupForm.name}
                            onChange={(e) => setSignupForm(prev => ({ ...prev, name: e.target.value }))}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="user-type">I am a</Label>
                          <Select value={signupForm.userType} onValueChange={(value) => 
                            setSignupForm(prev => ({ ...prev, userType: value }))
                          }>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="mentor">Mentor</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="your@email.com"
                          value={signupForm.email}
                          onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="••••••••"
                          value={signupForm.password}
                          onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                          required
                        />
                      </div>

                      {/* Student-specific fields */}
                      {signupForm.userType === 'student' && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="college">College/University</Label>
                            <Input
                              id="college"
                              placeholder="Your college name"
                              value={signupForm.college}
                              onChange={(e) => setSignupForm(prev => ({ ...prev, college: e.target.value }))}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="course">Course</Label>
                              <Input
                                id="course"
                                placeholder="CS, IT, etc."
                                value={signupForm.course}
                                onChange={(e) => setSignupForm(prev => ({ ...prev, course: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="year">Year</Label>
                              <Select value={signupForm.year} onValueChange={(value) => 
                                setSignupForm(prev => ({ ...prev, year: value }))
                              }>
                                <SelectTrigger>
                                  <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1st">1st Year</SelectItem>
                                  <SelectItem value="2nd">2nd Year</SelectItem>
                                  <SelectItem value="3rd">3rd Year</SelectItem>
                                  <SelectItem value="4th">4th Year</SelectItem>
                                  <SelectItem value="graduate">Graduate</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Mentor-specific fields */}
                      {signupForm.userType === 'mentor' && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="company">Company</Label>
                              <Input
                                id="company"
                                placeholder="Current company"
                                value={signupForm.company}
                                onChange={(e) => setSignupForm(prev => ({ ...prev, company: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="experience">Experience</Label>
                              <Select value={signupForm.experience} onValueChange={(value) => 
                                setSignupForm(prev => ({ ...prev, experience: value }))
                              }>
                                <SelectTrigger>
                                  <SelectValue placeholder="Years" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="2-3">2-3 Years</SelectItem>
                                  <SelectItem value="3-5">3-5 Years</SelectItem>
                                  <SelectItem value="5+">5+ Years</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="expertise">Expertise</Label>
                              <Input
                                id="expertise"
                                placeholder="Frontend, Backend, etc."
                                value={signupForm.expertise}
                                onChange={(e) => setSignupForm(prev => ({ ...prev, expertise: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="charges">Charges (₹/hour)</Label>
                              <Input
                                id="charges"
                                placeholder="500"
                                value={signupForm.charges}
                                onChange={(e) => setSignupForm(prev => ({ ...prev, charges: e.target.value }))}
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                              id="bio"
                              placeholder="Brief description about yourself and your mentoring approach..."
                              value={signupForm.bio}
                              onChange={(e) => setSignupForm(prev => ({ ...prev, bio: e.target.value }))}
                            />
                          </div>
                        </>
                      )}

                      {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                          {error}
                        </div>
                      )}

                      <Button type="submit" className="w-full" disabled={loading || !signupForm.userType}>
                        {loading ? 'Creating account...' : 'Create Account'}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}