import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: () => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: clerkUser, isLoaded } = useUser();
  const { openSignIn, signOut } = useClerk();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      if (clerkUser) {
        // Map Clerk user to our User type
        const mappedUser: User = {
          id: clerkUser.id,
          name: clerkUser.fullName || clerkUser.username || 'User',
          email: clerkUser.primaryEmailAddress?.emailAddress || '',
          avatar: clerkUser.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(clerkUser.fullName || 'User')}&background=6366f1&color=fff`
        };
        setUser(mappedUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    }
  }, [clerkUser, isLoaded]);

  const login = () => {
    openSignIn();
  };

  const logout = async () => {
    await signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};