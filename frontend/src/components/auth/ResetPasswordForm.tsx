'use client';

import { authService } from '@/services/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PasswordResetRequestData } from '@/types/api';

export default function ResetPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const isValidPassword = (password: string): boolean => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password)
    );
  };

  const resetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    setError('');
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: PasswordResetRequestData = {
      newPassword: formData.get('new-password') as string,
      token: new URLSearchParams(window.location.search).get('token') || '',
    };
    const confirmedPassword = formData.get('confirm-password') as string;

    if (data.newPassword !== confirmedPassword) {
      setError('Passwords must match.');
      setLoading(false);
      return;
    }
    if (!isValidPassword(data.newPassword)) {
      setError(
        'Password must be at least 8 characters long and include uppercase letters, lowercase letters, and numbers.'
      );
      setLoading(false);
      return;
    }
    try {
      await authService.resetPassword(data);
    } catch (error) {
      const errorMessage =
        (error as { details?: { error?: string }; message?: string })?.details
          ?.error ||
        (error as { message?: string })?.message ||
        'Password reset attempt failed.';
      setError(errorMessage);
    } finally {
      setLoading(false);
      if (!error) {
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={resetPassword} role="form">
      <div className="rounded-md shadow-sm -space-y-px">
        <div>
          <label htmlFor="new-password" className="sr-only">
            New Password
          </label>
          <input
            id="new-password"
            name="new-password"
            type="password"
            autoComplete="new-password"
            required
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="New Password"
          />
        </div>

        <div>
          <label htmlFor="confirm-password" className="sr-only">
            New Password
          </label>
          <input
            id="confirm-password"
            name="confirm-password"
            type="password"
            autoComplete="new-password"
            required
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Confirm Password"
          />
        </div>
      </div>

      <div>{error && <p className="text-sm text-red-600">{error}</p>}</div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </div>
    </form>
  );
}
