'use client';

import { authService } from '@/services/auth';
import { useState } from 'react';
import { ForgotPasswordRequestData } from '@/types/api';

export default function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  const sendLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(e.currentTarget);
    const data: ForgotPasswordRequestData = {
      email: formData.get('email') as string,
    };

    try {
      const response = await authService.sendPasswordReset(data);
      console.log(response);
      setMessage(
        (response as { message?: string })?.message ||
          'A reset link has been sent.'
      );
    } catch (error: unknown) {
      console.log('Error sending password reset link:', error);
      const errorMessage =
        (error as { details?: { error?: string }; message?: string })?.details
          ?.error ||
        (error as { message?: string })?.message ||
        'Something went wrong.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={sendLink} role="form">
      <input type="hidden" name="remember" value="true" />
      {!loading && message ? (
        <div className="text-sm text-green-600">
          <p>{message}</p>
          <p>
            Back to{' '}
            <a href="/login" className="text-indigo-600 hover:text-indigo-500">
              login
            </a>
            .
          </p>
        </div>
      ) : (
        <div>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
          </div>

          <div>{error && <p className="text-sm text-red-600">{error}</p>}</div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
