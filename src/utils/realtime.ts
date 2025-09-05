import { supabase } from './supabase/client';
import { projectId } from './supabase/info';

export class RealtimeManager {
  private subscriptions: { [key: string]: any } = {};

  // Subscribe to new messages for a conversation
  subscribeToMessages(conversationId: string, onMessage: (message: any) => void) {
    const channel = `messages:${conversationId}`;
    
    if (this.subscriptions[channel]) {
      this.unsubscribe(channel);
    }

    // For this MVP, we'll use polling since we're using KV store
    // In a production app, you'd use Supabase realtime with database tables
    const pollInterval = setInterval(async () => {
      try {
        const accessToken = localStorage.getItem('prepconnect_access_token');
        if (!accessToken) return;

        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-78cb9030/messages/${conversationId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          }
        });

        if (response.ok) {
          const { messages } = await response.json();
          onMessage(messages);
        }
      } catch (error) {
        console.log('Error polling messages:', error);
      }
    }, 2000); // Poll every 2 seconds

    this.subscriptions[channel] = { type: 'interval', handler: pollInterval };
    return channel;
  }

  // Subscribe to connection requests updates
  subscribeToConnectionRequests(userId: string, onUpdate: (requests: any[]) => void) {
    const channel = `connection_requests:${userId}`;
    
    if (this.subscriptions[channel]) {
      this.unsubscribe(channel);
    }

    const pollInterval = setInterval(async () => {
      try {
        const accessToken = localStorage.getItem('prepconnect_access_token');
        if (!accessToken) return;

        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-78cb9030/connection-requests/${userId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          }
        });

        if (response.ok) {
          const { requests } = await response.json();
          onUpdate(requests);
        }
      } catch (error) {
        console.log('Error polling connection requests:', error);
      }
    }, 5000); // Poll every 5 seconds

    this.subscriptions[channel] = { type: 'interval', handler: pollInterval };
    return channel;
  }

  // Unsubscribe from a channel
  unsubscribe(channel: string) {
    const subscription = this.subscriptions[channel];
    if (subscription) {
      if (subscription.type === 'interval') {
        clearInterval(subscription.handler);
      }
      delete this.subscriptions[channel];
    }
  }

  // Clean up all subscriptions
  cleanup() {
    Object.keys(this.subscriptions).forEach(channel => {
      this.unsubscribe(channel);
    });
  }

  // Get online status (simulated for MVP)
  getOnlineStatus(userId: string): Promise<boolean> {
    // In a real app, you'd track user presence
    return Promise.resolve(Math.random() > 0.5);
  }

  // Simulate typing indicators
  sendTypingIndicator(conversationId: string, isTyping: boolean) {
    // In a real app, you'd broadcast typing status to other participants
    console.log(`Typing indicator for ${conversationId}: ${isTyping}`);
  }
}

export const realtimeManager = new RealtimeManager();