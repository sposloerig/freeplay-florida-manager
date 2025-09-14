import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { MANAGER_EMAILS } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isManager: boolean;
  adminBypass: boolean;
  setAdminBypass: (bypass: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isManager, setIsManager] = useState(false);
  const [adminBypass, setAdminBypass] = useState(false);

  useEffect(() => {
    // Check active sessions and sets the user
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        setIsManager(session?.user ? MANAGER_EMAILS.includes(session.user.email || '') : false);
      } catch (error) {
        console.error('Error checking auth session:', error);
        setUser(null);
        setIsManager(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setIsManager(session?.user ? MANAGER_EMAILS.includes(session.user.email || '') : false);
      setLoading(false);

      // Handle password recovery
      if (event === 'PASSWORD_RECOVERY') {
        // The user is being redirected to reset their password
        // The session will contain the recovery session
        console.log('Password recovery event detected');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    // Admin bypass for testing - check FIRST before Supabase
    if (email === 'admin@test.com' && password === 'freeplay2024') {
      setAdminBypass(true);
      setIsManager(true);
      setUser({ email: 'admin@bypass.local' } as User);
      setLoading(false);
      console.log('Admin bypass login successful');
      return;
    }

    // Only try Supabase if not using bypass
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Handle admin bypass logout
      if (adminBypass) {
        setAdminBypass(false);
        setIsManager(false);
        setUser(null);
        setLoading(false);
        return;
      }

      // First check if we have a session
      const { data: { session } } = await supabase.auth.getSession();
      
      // Only attempt to sign out if we have a session
      if (session) {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Error during sign out:', error);
        }
      }
    } catch (error) {
      console.error('Error during sign out:', error);
    } finally {
      // Ensure user state is cleared and loading is set to false
      setUser(null);
      setIsManager(false);
      setAdminBypass(false);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, isManager, adminBypass, setAdminBypass }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};