import { supabase } from './supabase/client';

export const TOKEN_KEY = 'prepconnect_access_token';

export class AuthManager {
  // Get current access token
  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  // Set access token
  setAccessToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  // Remove access token
  removeAccessToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session?.access_token;
    } catch (error) {
      console.log('Auth check error:', error);
      return false;
    }
  }

  // Get current session
  async getCurrentSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.log('Session fetch error:', error);
      return null;
    }
  }

  // Sign out and cleanup
  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
      this.removeAccessToken();
    } catch (error) {
      console.log('Sign out error:', error);
      // Still remove local token even if remote signout fails
      this.removeAccessToken();
    }
  }
}

export const authManager = new AuthManager();