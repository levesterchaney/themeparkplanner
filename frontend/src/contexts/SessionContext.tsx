'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { setGlobalAuthHandler } from '@/lib/api-client';
import { authService } from '@/services';

interface SessionContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  checkSession: () => void;
  handleAuthFailure: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: React.ReactNode;
  initialAuth: boolean;
}

export function SessionProvider({
  children,
  initialAuth,
}: SessionProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuth);

  const checkSession = async () => {
    try {
      await authService.validateSession();
      setIsAuthenticated(true);
    } catch {
      setIsAuthenticated(false);
    }
  };

  const handleAuthFailure = () => {
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  useEffect(() => {
    setGlobalAuthHandler(handleAuthFailure);
  }, []);

  const value = {
    isAuthenticated,
    setIsAuthenticated,
    checkSession,
    handleAuthFailure,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
