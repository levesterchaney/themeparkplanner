'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services';
import { useSession } from '@/contexts/SessionContext';

export default function LogoutPage() {
  const router = useRouter();
  const { setIsAuthenticated } = useSession();

  const performLogout = useCallback(async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false); // Update session context
      router.push('/login');
    } catch {
      //TODO how to handle logout failure? Redirect to home page with error message?
      setIsAuthenticated(false); // Update session context even on failure
      router.push('/'); // Redirect to home page on logout failure for now
    }
  }, [router, setIsAuthenticated]);

  useEffect(() => {
    performLogout();
  }, [performLogout]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Logging you out...
          </h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto" />
        </div>
      </div>
    </div>
  );
}
