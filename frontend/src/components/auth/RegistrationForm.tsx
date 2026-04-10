'use client';

import {useState} from 'react';
import {useRouter} from "next/navigation";
import { authService} from "@/services/auth";

export default function RegistrationForm() {
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const register = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(event.currentTarget);
        const data = {
            firstName: formData.get('first-name') as string,
            lastName: formData.get('last-name') as string,
            email: formData.get('email') as string,
            password: formData.get('password') as string,
        };

        try {
            await authService.register(data);
            // Redirect to login page once implemented
            router.push('/');
        } catch (error: any) {
            // Show error message to user
            console.log('Registration error:', error);
            setError(error?.details?.error || error?.message || "Registration attempt failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="mt-8 space-y-6" onSubmit={register}>
            <div className="rounded-md shadow-sm -space-y-px">
                <div>
                    <label htmlFor="first-name" className="sr-only">First Name</label>
                    <input
                        id="first-name"
                        name="first-name"
                        type="text"
                        autoComplete="first-name"
                        required
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="First Name"
                    />
                </div>
                <div>
                    <label htmlFor="last-name" className="sr-only">Last Name</label>
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
                    <label htmlFor="email" className="sr-only">Email address</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Email address"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="sr-only">Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Password"
                    />
                </div>
            </div>

            {error && (
                <div className="text-red-600 text-sm text-center">
                    {error}
                </div>
            )}

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