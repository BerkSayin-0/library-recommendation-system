/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  fetchUserAttributes,
  fetchAuthSession,
} from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { User } from '@/types';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();

    const listener = Hub.listen('auth', (data) => {
      const { payload } = data;
      if (payload.event === 'signedIn') {
        checkUser();
      } else if (payload.event === 'signedOut') {
        setUser(null);
      }
    });

    return () => listener();
  }, []);

  async function checkUser() {
    try {
      const currentUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      const session = await fetchAuthSession();

      const accessGroups =
        (session.tokens?.accessToken?.payload['cognito:groups'] as string[]) || [];
      const idGroups = (session.tokens?.idToken?.payload['cognito:groups'] as string[]) || [];
      const allGroups = [...new Set([...accessGroups, ...idGroups])];

      console.log('Kullanıcı Rol Grupları:', allGroups);

      const isAdmin = allGroups.includes('admin');

      setUser({
        id: currentUser.userId,
        email: attributes.email || '',
        name: attributes.name || currentUser.username,
        role: isAdmin ? 'admin' : 'user',
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Oturum doğrulama hatası:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { isSignedIn } = await signIn({ username: email, password });
      if (isSignedIn) {
        await checkUser();
      }
    } catch (error) {
      console.error('Giriş hatası:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error('Çıkış hatası:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name,
          },
        },
      });
    } catch (error) {
      console.error('Kayıt hatası:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    signup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
