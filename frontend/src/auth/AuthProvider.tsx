import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { authApi, type UserProfile } from '../lib/api';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Fetch profile from backend using the access token
  const fetchProfile = useCallback(async (token: string) => {
    try {
      const result = await authApi.getProfile(token);
      if (result.ok && result.data.user) {
        setUser(result.data.user);
        setAccessToken(token);
        setRedirectPath(result.data.redirectPath);
      } else {
        setUser(null);
        setAccessToken(null);
        setRedirectPath(null);
      }
    } catch {
      setUser(null);
      setAccessToken(null);
      setRedirectPath(null);
    }
  }, []);

  useEffect(() => {
    // Check for existing session on mount
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        await fetchProfile(session.access_token);
      }
      setLoading(false);
      setIsInitialLoad(false);
    };

    initSession();

    // Listen for auth state changes (e.g., token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.access_token) {
          await fetchProfile(session.access_token);
        } else {
          setUser(null);
          setAccessToken(null);
          setRedirectPath(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAccessToken(null);
    setRedirectPath(null);
  };

  const setAuthData = (user: UserProfile, token: string, redirect: string) => {
    setUser(user);
    setAccessToken(token);
    setRedirectPath(redirect);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, isInitialLoad, redirectPath, signOut, setAuthData }}>
      {children}
    </AuthContext.Provider>
  );
}
