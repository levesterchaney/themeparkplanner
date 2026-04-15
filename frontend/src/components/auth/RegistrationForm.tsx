'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth';
import { RegistrationRequestData } from '@/types/api';

export default function RegistrationForm() {
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isValidPassword = (password: string): boolean => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password)
    );
  };

  const register = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(event.currentTarget);
    const data: RegistrationRequestData = {
      firstName: formData.get('first-name') as string,
      lastName: (formData.get('last-name') as string) || undefined,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    // Basic validation
    if (!data.firstName) {
      setError('First name is required.');
      setLoading(false);
      return;
    }
    if (!data.email) {
      setError('Email is required.');
      setLoading(false);
      return;
    }
    if (!data.password) {
      setError('Password is required.');
      setLoading(false);
      return;
    }
    if (!isValidPassword(data.password)) {
      setError(
        'Password must be at least 8 characters long and include uppercase letters, lowercase letters, and numbers.'
      );
      setLoading(false);
      return;
    }

    try {
      await authService.register(data);
      //TODO Redirect to login page once implemented
      router.push('/');
    } catch (error: unknown) {
      // Surface error message to user
      const errorMessage =
        (error as { details?: { error?: string }; message?: string })?.details
          ?.error ||
        (error as { message?: string })?.message ||
        'Registration attempt failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={register}>
      <div className="rounded-md shadow-sm -space-y-px">
        <div>
          <label htmlFor="first-name" className="sr-only">
            First Name
          </label>
          <input
            id="first-name"
            name="first-name"
            type="text"
            autoComplete="first-name"
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="First Name"
          />
        </div>
        <div>
          <label htmlFor="last-name" className="sr-only">
            Last Name
          </label>
          <input
            id="last-name"
            name="last-name"
            type="text"
            autoComplete="last-name"
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Last Name"
          />
        </div>
        <div>
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Email address"
          />
        </div>
        <div>
          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Password"
          />
        </div>
      </div>

      {error && <div className="text-red-600 text-sm text-center">{error}</div>}

      <div>
        <button
          type="submit"
          disabled={loading}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Account...' : 'Register'}
        </button>
      </div>
    </form>
  );
}
