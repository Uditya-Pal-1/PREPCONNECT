import { supabase } from "./supabase/client";
import { authManager } from "./auth";
import { projectId, publicAnonKey } from "./supabase/info";

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-78cb9030`;

export class ApiClient {
  // Get shared Supabase client instance
  getSupabaseClient() {
    return supabase;
  }

  private getAuthToken(): string | null {
    return authManager.getAccessToken();
  }

  private async makeRequest(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<any> {
    const authToken = this.getAuthToken();

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken || publicAnonKey}`,
      ...options.headers,
    };

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            `HTTP error! status: ${response.status}`,
        );
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Auth endpoints
  async signup(userData: any) {
    return this.makeRequest("/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  // Profile endpoints
  async getProfile(userId: string) {
    return this.makeRequest(`/profile/${userId}`);
  }

  async updateProfile(userId: string, updates: any) {
    return this.makeRequest(`/profile/${userId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  // Mentors endpoints
  async getMentors() {
    return this.makeRequest("/mentors");
  }

  // Messaging endpoints
  async sendMessage(recipientId: string, content: string) {
    return this.makeRequest("/messages", {
      method: "POST",
      body: JSON.stringify({ recipientId, content }),
    });
  }

  async getConversations(userId: string) {
    return this.makeRequest(`/conversations/${userId}`);
  }

  async getMessages(conversationId: string) {
    return this.makeRequest(`/messages/${conversationId}`);
  }

  // Connection requests endpoints
  async sendConnectionRequest(
    mentorId: string,
    message?: string,
  ) {
    return this.makeRequest("/connection-request", {
      method: "POST",
      body: JSON.stringify({ mentorId, message }),
    });
  }

  async getConnectionRequests(userId: string) {
    return this.makeRequest(`/connection-requests/${userId}`);
  }

  async updateConnectionRequest(
    requestId: string,
    status: "accepted" | "rejected",
  ) {
    return this.makeRequest("/connection-request-update", {
      method: "POST",
      body: JSON.stringify({ requestId, status }),
    });
  }

  // File endpoints
  async uploadFile(file: File, fileType: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileType", fileType);

    const authToken = this.getAuthToken();

    return fetch(`${BASE_URL}/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }
      return data;
    });
  }

  async getFiles(userId: string) {
    return this.makeRequest(`/files/${userId}`);
  }
}

export const api = new ApiClient();