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
    // Check if session cookie exists first
    const hasSessionCookie = document.cookie
      .split(';')
      .some((cookie) => cookie.trim().startsWith('session_token='));

    if (!hasSessionCookie) {
      setIsAuthenticated(false);
      return;
    }

    // Validate the session with the backend
    try {
      await authService.validateSession();
      setIsAuthenticated(true);
    } catch {
      // Session is invalid or network error, clear it
      setIsAuthenticated(false);
      document.cookie =
        'session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
  };

  const handleAuthFailure = () => {
    // Clear session state and redirect to login
    setIsAuthenticated(false);
    // Clear the session cookie by setting it to expire
    document.cookie =
      'session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    // Redirect to login page
    window.location.href = '/login';
  };

  // Check session on mount and when cookies change
  useEffect(() => {
    checkSession();
  }, []);

  // Register the auth failure handler globally
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
