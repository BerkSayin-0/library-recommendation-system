/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, useContext } from 'react';
import { signIn, signUp, signOut, getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils'; // ✅ EKLENDİ: Olay dinleyicisi
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
    // 1. İlk açılışta kontrol et
    checkUser();

    // 2. ✅ EKLENDİ: Hub ile anlık değişimleri dinle
    // Bu sayede F5 atmadan Header güncellenecek
    const listener = Hub.listen('auth', (data) => {
      const { payload } = data;
      if (payload.event === 'signedIn') {
        checkUser(); // Giriş oldu, verileri çek!
      } else if (payload.event === 'signedOut') {
        setUser(null); // Çıkış oldu, temizle!
      }
    });

    // Temizlik (Component ölürse dinlemeyi bırak)
    return () => listener();
  }, []);

  async function checkUser() {
    try {
      const currentUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();

      setUser({
        id: currentUser.userId,
        email: attributes.email || '',
        name: attributes.name || currentUser.username,
        role: 'user',
        createdAt: new Date().toISOString(),
      });
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Hub dinlediği için burada ekstra checkUser çağırmamıza gerek kalmaz ama
      // garanti olsun diye bırakıyoruz.
      const { isSignedIn } = await signIn({ username: email, password });
      if (isSignedIn) {
        await checkUser();
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut();
      // Hub 'signedOut' olayını yakalayacağı için setUser(null) orada yapılır
    } catch (error) {
      console.error('Logout error:', error);
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
      console.error('Signup error:', error);
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
