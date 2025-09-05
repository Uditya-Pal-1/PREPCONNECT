import React, { useState, useEffect } from "react";
import { AuthProvider } from "./components/AuthContext";
import { LandingPage } from "./components/LandingPage";
import { ResponsiveApp } from "./components/ResponsiveApp";
import { Toaster } from "./components/ui/sonner";
import { supabase } from './utils/supabase/client';
import { projectId, publicAnonKey } from './utils/supabase/info';
import "./styles/globals.css";

interface User {
  id: string;
  email: string;
  name: string;
  userType: "student" | "mentor";
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing Supabase session
    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.access_token && session?.user) {
        localStorage.setItem('prepconnect_access_token', session.access_token);
        await loadUserProfile(session.user.id, session.access_token);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem("prepconnect_access_token");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && session?.access_token) {
        localStorage.setItem('prepconnect_access_token', session.access_token);
        await loadUserProfile(session.user.id, session.access_token);
      }
    } catch (error) {
      console.log("Session check error:", error);
    }
    setLoading(false);
  };

  const loadUserProfile = async (userId: string, accessToken: string) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-78cb9030/profile/${userId}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        }
      });

      if (response.ok) {
        const { profile } = await response.json();
        setUser({
          id: profile.id,
          email: profile.email,
          name: profile.name,
          userType: profile.userType
        });
      } else {
        console.log("Failed to load user profile");
      }
    } catch (error) {
      console.log("Profile load error:", error);
    }
  };

  const handleLogin = async (userData: User) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem("prepconnect_access_token");
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        {!user ? (
          <LandingPage onLogin={handleLogin} />
        ) : (
          <ResponsiveApp user={user} onLogout={handleLogout} />
        )}
        <Toaster />
      </div>
    </AuthProvider>
  );
}

export default App;