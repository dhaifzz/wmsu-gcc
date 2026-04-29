import { createContext, useContext } from 'react';
import type { UserProfile } from '../lib/api';

export interface AuthContextType {
  user: UserProfile | null;
  accessToken: string | null;
  loading: boolean;
  isInitialLoad: boolean;
  redirectPath: string | null;
  signOut: () => Promise<void>;
  setAuthData: (user: UserProfile, token: string, redirect: string) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  accessToken: null,
  loading: true,
  isInitialLoad: true,
  redirectPath: null,
  signOut: async () => {},
  setAuthData: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}
