import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Star, 
  MapPin, 
  Building, 
  GraduationCap, 
  MessageCircle, 
  Calendar,
  Link,
  Clock,
  Award,
  Users
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'student' | 'mentor';
}

interface MentorProfile {
  id: string;
  name: string;
  company: string;
  experience: string;
  expertise: string;
  bio: string;
  charges?: string;
  rating: number;
  totalSessions: number;
  responseTime: string;
  linkedin?: string;
  github?: string;
}

interface Review {
  id: string;
  studentName: string;
  rating: number;
  comment: string;
  date: string;
}

interface DesktopMentorProfileProps {
  user: User;
  mentorId: string;
  onNavigate: (view: string, data?: any) => void;
}

export function DesktopMentorProfile({ user, mentorId, onNavigate }: DesktopMentorProfileProps) {
  const [mentor, setMentor] = useState<MentorProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMentorProfile();
  }, [mentorId]);

  const fetchMentorProfile = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-78cb9030/mentor/${mentorId}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        }
      });

      if (response.ok) {
        const { mentor } = await response.json();
        setMentor(mentor);
      } else {
        // Create sample mentor profile for MVP
        const sampleMentor: MentorProfile = {
          id: mentorId,
          name: 'Sarah Johnson',
          company: 'Google',
          experience: '5+ years',
          expertise: 'Data Science, Machine Learning, Python',
          bio: 'Senior Data Scientist at Google with 5+ years of experience in machine learning and data analytics. I\'ve worked on large-scale ML systems and love helping students break into the tech industry. My passion is making complex concepts accessible and helping others grow their careers.',
          charges: '$50/hour',
          rating: 4.8,
          totalSessions: 150,
          responseTime: '< 2 hours',
          linkedin: 'linkedin.com/in/sarahjohnson',
          github: 'github.com/sarahjohnson'
        };
        setMentor(sampleMentor);

        // Create sample reviews
        const sampleReviews: Review[] = [
          {
            id: 'review-1',
            studentName: 'Alex Kumar',
            rating: 5,
            comment: 'Sarah was incredibly helpful! She explained complex ML concepts in a way that was easy to understand and gave me practical advice for my job search.',
            date: '2 days ago'
          },
          {
            id: 'review-2',
            studentName: 'Priya Sharma',
            rating: 5,
            comment: 'Amazing mentor! Her interview preparation session helped me land my dream job at Microsoft. Highly recommended!',
            date: '1 week ago'
          },
          {
            id: 'review-3',
            studentName: 'David Chen',
            rating: 4,
            comment: 'Very knowledgeable and patient. Sarah helped me understand data science fundamentals and guided me through project development.',
            date: '2 weeks ago'
          }
        ];
        setReviews(sampleReviews);
      }
    } catch (error) {
      console.log('Error fetching mentor profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    onNavigate('chat', { chatId: mentorId });
  };

  const handleBookSession = () => {
    // In a real app, this would open a booking modal or navigate to booking page
    alert('Booking functionality would be implemented here');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Mentor profile not found</p>
        <Button onClick={() => onNavigate('home')} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-transparent to-pink-100/50"></div>
        </div>
        <CardContent className="relative -mt-16 px-8 pb-8">
          <div className="flex items-end space-x-6">
            <Avatar className="w-32 h-32 bg-blue-600 border-4 border-white shadow-lg">
              <AvatarFallback className="bg-blue-600 text-white text-4xl font-bold">
                {mentor.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {mentor.name}
                    </h1>
                    <span className="text-2xl">🇮🇳</span>
                    <Badge variant="secondary">Mentor</Badge>
                  </div>
                  
                  <div className="flex items-center space-x-6 mb-3">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{mentor.rating}</span>
                      <span className="text-gray-500">({reviews.length} reviews)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">{mentor.totalSessions} sessions</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Responds in {mentor.responseTime}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">{mentor.company}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-700">{mentor.experience}</span>
                    </div>
                    {mentor.linkedin && (
                      <div className="flex items-center space-x-2">
                        <Link className="w-4 h-4 text-gray-500" />
                        <a 
                          href={`https://${mentor.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {mentor.linkedin}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <Button onClick={handleConnect} variant="outline">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  <Button onClick={handleBookSession} className="bg-blue-600 hover:bg-blue-700">
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Session
                    {mentor.charges && (
                      <span className="ml-2 text-sm opacity-90">
                        {mentor.charges}
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="about" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="space-y-6">
              {/* Bio */}
              <Card>
                <CardHeader>
                  <CardTitle>About {mentor.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {mentor.bio}
                  </p>
                </CardContent>
              </Card>

              {/* Expertise */}
              <Card>
                <CardHeader>
                  <CardTitle>Areas of Expertise</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {mentor.expertise.split(',').map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill.trim()}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Sample Projects/Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[1, 2, 3].map((_, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">
                        {index === 0 ? 'Machine Learning Best Practices' :
                         index === 1 ? 'Data Science Interview Guide' :
                         'Career Growth in Tech'}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {index === 0 ? 'Key principles for building robust ML systems in production environments.' :
                         index === 1 ? 'Comprehensive guide to ace your data science interviews.' :
                         'Strategies for advancing your career in the technology industry.'}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{index + 1} week ago</span>
                        <span>•</span>
                        <span>{Math.floor(Math.random() * 100) + 50} likes</span>
                        <span>•</span>
                        <span>{Math.floor(Math.random() * 20) + 5} comments</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-10 h-10 bg-gray-600">
                        <AvatarFallback className="bg-gray-600 text-white">
                          {review.studentName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">
                            {review.studentName}
                          </h4>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${
                                  i < review.rating 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'text-gray-300'
                                }`} 
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="availability">
              <Card>
                <CardHeader>
                  <CardTitle>Availability & Booking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Available Time Slots</h4>
                      <div className="space-y-2">
                        {[
                          'Monday: 6:00 PM - 9:00 PM',
                          'Tuesday: 6:00 PM - 9:00 PM',
                          'Wednesday: Not Available',
                          'Thursday: 6:00 PM - 9:00 PM',
                          'Friday: 6:00 PM - 9:00 PM',
                          'Saturday: 10:00 AM - 2:00 PM',
                          'Sunday: 10:00 AM - 2:00 PM'
                        ].map((slot, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                            <span className="text-sm text-gray-700">{slot}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Session Types</h4>
                      <div className="space-y-3">
                        <div className="p-3 border border-gray-200 rounded-lg">
                          <h5 className="font-medium text-gray-900">Career Guidance</h5>
                          <p className="text-sm text-gray-600">1 hour • $50</p>
                        </div>
                        <div className="p-3 border border-gray-200 rounded-lg">
                          <h5 className="font-medium text-gray-900">Mock Interview</h5>
                          <p className="text-sm text-gray-600">1.5 hours • $75</p>
                        </div>
                        <div className="p-3 border border-gray-200 rounded-lg">
                          <h5 className="font-medium text-gray-900">Resume Review</h5>
                          <p className="text-sm text-gray-600">30 minutes • $25</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Mentor Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Rating</span>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{mentor.rating}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Sessions</span>
                <span className="font-medium">{mentor.totalSessions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Response Time</span>
                <span className="font-medium">{mentor.responseTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="font-medium">95%</span>
              </div>
            </CardContent>
          </Card>

          {/* Contact Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Get in Touch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={handleConnect}
                variant="outline" 
                className="w-full justify-start"
              >
                <MessageCircle className="w-4 h-4 mr-3" />
                Send Message
              </Button>
              <Button 
                onClick={handleBookSession}
                className="w-full justify-start bg-blue-600 hover:bg-blue-700"
              >
                <Calendar className="w-4 h-4 mr-3" />
                Book Session
              </Button>
            </CardContent>
          </Card>

          {/* Similar Mentors */}
          <Card>
            <CardHeader>
              <CardTitle>Similar Mentors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10 bg-purple-600">
                    <AvatarFallback className="bg-purple-600 text-white">
                      {String.fromCharCode(65 + index)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">
                      Mentor {index + 1}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      Data Science • 4.9 ⭐
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}