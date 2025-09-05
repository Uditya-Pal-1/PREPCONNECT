import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Send, Search, Phone, Video, MoreVertical, ArrowLeft } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'student' | 'mentor';
}

interface Chat {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientType: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
}

interface DesktopChatProps {
  user: User;
  recipientId?: string;
  onNavigate: (view: string, data?: any) => void;
}

export function DesktopChat({ user, recipientId, onNavigate }: DesktopChatProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (recipientId && chats.length > 0) {
      const chat = chats.find(c => c.recipientId === recipientId);
      if (chat) {
        setSelectedChat(chat);
        fetchMessages(chat.id);
      }
    }
  }, [recipientId, chats]);

  const fetchChats = async () => {
    try {
      // Create sample chats for MVP
      const sampleChats: Chat[] = [
        {
          id: 'chat-1',
          recipientId: 'mentor-1',
          recipientName: 'Sarah Johnson',
          recipientType: 'mentor',
          lastMessage: 'Thanks for the interview tips! They were really helpful.',
          lastMessageTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          unreadCount: 2
        },
        {
          id: 'chat-2',
          recipientId: 'student-1',
          recipientName: 'Alex Kumar',
          recipientType: 'student',
          lastMessage: 'Can we schedule a mock interview session?',
          lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          unreadCount: 1
        },
        {
          id: 'chat-3',
          recipientId: 'mentor-2',
          recipientName: 'David Chen',
          recipientType: 'mentor',
          lastMessage: 'Here are some resources for data science preparation.',
          lastMessageTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          unreadCount: 0
        },
        {
          id: 'chat-4',
          recipientId: 'student-2',
          recipientName: 'Priya Sharma',
          recipientType: 'student',
          lastMessage: 'Thank you so much for your guidance!',
          lastMessageTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          unreadCount: 0
        }
      ];

      setChats(sampleChats);
      
      if (!selectedChat && sampleChats.length > 0) {
        setSelectedChat(sampleChats[0]);
        fetchMessages(sampleChats[0].id);
      }
    } catch (error) {
      console.log('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      // Create sample messages for MVP
      const sampleMessages: Message[] = [
        {
          id: 'msg-1',
          senderId: selectedChat?.recipientId || 'other',
          content: 'Hi! I saw your profile and would love to get some career advice.',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          type: 'text'
        },
        {
          id: 'msg-2',
          senderId: user.id,
          content: 'Hello! I\'d be happy to help. What specific area are you looking for guidance in?',
          timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
          type: 'text'
        },
        {
          id: 'msg-3',
          senderId: selectedChat?.recipientId || 'other',
          content: 'I\'m preparing for data science interviews and could use some tips on technical questions.',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          type: 'text'
        },
        {
          id: 'msg-4',
          senderId: user.id,
          content: 'Great! Let me share some resources and we can schedule a mock interview session.',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          type: 'text'
        }
      ];

      setMessages(sampleMessages);
    } catch (error) {
      console.log('Error fetching messages:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 24 * 60) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return messageTime.toLocaleDateString();
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedChat) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      senderId: user.id,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Update last message in chat list
    setChats(prev => prev.map(chat => 
      chat.id === selectedChat.id 
        ? { ...chat, lastMessage: message.content, lastMessageTime: message.timestamp }
        : chat
    ));
  };

  const filteredChats = chats.filter(chat =>
    chat.recipientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-200px)]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        {/* Chat List */}
        <div className="md:col-span-1">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Messages</CardTitle>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-0">
              <div className="space-y-1">
                {filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
                      selectedChat?.id === chat.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => {
                      setSelectedChat(chat);
                      fetchMessages(chat.id);
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-10 h-10 bg-blue-600">
                        <AvatarFallback className="bg-blue-600 text-white">
                          {chat.recipientName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900 truncate">
                            {chat.recipientName}
                          </p>
                          {chat.unreadCount > 0 && (
                            <Badge className="bg-blue-600 text-white text-xs">
                              {chat.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {chat.lastMessage}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTime(chat.lastMessageTime)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Messages */}
        <div className="md:col-span-2">
          {selectedChat ? (
            <Card className="h-full flex flex-col">
              {/* Chat Header */}
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10 bg-blue-600">
                      <AvatarFallback className="bg-blue-600 text-white">
                        {selectedChat.recipientName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {selectedChat.recipientName}
                      </h3>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {selectedChat.recipientType}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="flex items-end space-x-2 max-w-xs lg:max-w-md">
                      {message.senderId !== user.id && (
                        <Avatar className="w-6 h-6 bg-gray-600">
                          <AvatarFallback className="bg-gray-600 text-white text-xs">
                            {selectedChat.recipientName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`rounded-lg px-3 py-2 ${
                          message.senderId === user.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderId === user.id ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                      {message.senderId === user.id && (
                        <Avatar className="w-6 h-6 bg-blue-600">
                          <AvatarFallback className="bg-blue-600 text-white text-xs">
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>

              {/* Message Input */}
              <div className="border-t border-gray-200 p-4">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No conversation selected
                </h3>
                <p className="text-gray-500">
                  Choose a conversation from the list to start messaging.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}