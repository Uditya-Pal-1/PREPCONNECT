import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Bell, 
  MessageCircle, 
  ThumbsUp, 
  UserPlus, 
  Calendar,
  CheckCircle,
  X,
  Settings
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'student' | 'mentor';
}

interface Notification {
  id: string;
  type: 'message' | 'like' | 'connection' | 'session' | 'system';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  avatar?: string;
  userName?: string;
}

interface DesktopNotificationsProps {
  user: User;
  onNavigate: (view: string, data?: any) => void;
}

export function DesktopNotifications({ user, onNavigate }: DesktopNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      // Create sample notifications for MVP
      const sampleNotifications: Notification[] = [
        {
          id: 'notif-1',
          type: 'message',
          title: 'New message from Sarah Johnson',
          description: 'Thanks for the interview tips! They were really helpful.',
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          read: false,
          userName: 'Sarah Johnson'
        },
        {
          id: 'notif-2',
          type: 'like',
          title: 'Alex Kumar liked your post',
          description: 'Your post "Data Science: The Fuel of Modern Decision Making" received a like',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          read: false,
          userName: 'Alex Kumar'
        },
        {
          id: 'notif-3',
          type: 'connection',
          title: 'New connection request',
          description: 'David Chen wants to connect with you',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read: false,
          userName: 'David Chen'
        },
        {
          id: 'notif-4',
          type: 'session',
          title: 'Upcoming mentoring session',
          description: 'You have a session scheduled with Priya Sharma in 1 hour',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          read: true,
          userName: 'Priya Sharma'
        },
        {
          id: 'notif-5',
          type: 'system',
          title: 'Profile completion reminder',
          description: 'Complete your profile to get better mentor recommendations',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          read: true
        },
        {
          id: 'notif-6',
          type: 'like',
          title: 'Multiple likes on your post',
          description: 'Your post "Frontend Development Best Practices" has received 25 new likes',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          read: true
        }
      ];

      setNotifications(sampleNotifications);
    } catch (error) {
      console.log('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notifTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 24 * 60) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      const diffInDays = Math.floor(diffInMinutes / (24 * 60));
      return `${diffInDays}d ago`;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return MessageCircle;
      case 'like':
        return ThumbsUp;
      case 'connection':
        return UserPlus;
      case 'session':
        return Calendar;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'message':
        return 'text-blue-600 bg-blue-100';
      case 'like':
        return 'text-red-600 bg-red-100';
      case 'connection':
        return 'text-green-600 bg-green-100';
      case 'session':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(notif => notif.id !== notificationId)
    );
  };

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const NotificationItem = ({ notification }: { notification: Notification }) => {
    const Icon = getNotificationIcon(notification.type);
    const colorClass = getNotificationColor(notification.type);

    return (
      <div className={`p-4 border border-gray-200 rounded-lg ${
        !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-white'
      } hover:shadow-sm transition-shadow`}>
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-full ${colorClass}`}>
            <Icon className="w-4 h-4" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">
                  {notification.title}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  {notification.description}
                </p>
                <div className="flex items-center space-x-3">
                  <p className="text-xs text-gray-500">
                    {formatTime(notification.timestamp)}
                  </p>
                  {!notification.read && (
                    <Badge className="bg-blue-600 text-white text-xs">
                      New
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsRead(notification.id)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteNotification(notification.id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {notification.userName && (
              <div className="flex items-center space-x-2 mt-3">
                <Avatar className="w-6 h-6 bg-gray-600">
                  <AvatarFallback className="bg-gray-600 text-white text-xs">
                    {notification.userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-gray-500">{notification.userName}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">
            {unreadNotifications.length} unread notifications
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {unreadNotifications.length > 0 && (
            <Button
              variant="outline"
              onClick={markAllAsRead}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => onNavigate('notification-settings')}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Notifications */}
      <div className="space-y-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread ({unreadNotifications.length})
            </TabsTrigger>
            <TabsTrigger value="messages">
              Messages
            </TabsTrigger>
            <TabsTrigger value="activity">
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {notifications.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No notifications yet
                  </h3>
                  <p className="text-gray-500">
                    You'll see notifications here when you receive messages, likes, and more.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="unread" className="space-y-4">
            {unreadNotifications.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    All caught up!
                  </h3>
                  <p className="text-gray-500">
                    You have no unread notifications.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {unreadNotifications.map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            <div className="space-y-3">
              {notifications
                .filter(n => n.type === 'message')
                .map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <div className="space-y-3">
              {notifications
                .filter(n => ['like', 'connection', 'session'].includes(n.type))
                .map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}