import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const cookieStore = await cookies();
  const hasActiveSession = cookieStore.has('session_token');

  if (!hasActiveSession) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Dashboard
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Welcome to your Theme Park Planner dashboard
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                📅 My Trips
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                View and manage your planned trips
              </p>
              <a
                href="/trips"
                className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
              >
                View Trips
              </a>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                👤 Profile
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Manage your account settings
              </p>
              <a
                href="/profile"
                className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
              >
                Edit Profile
              </a>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                🏰 Explore Parks
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Discover new theme parks and attractions
              </p>
              <a
                href="/"
                className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
              >
                Browse Parks
              </a>
            </div>
          </div>

          <div className="mt-12 text-center">
            <a
              href="/logout"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              Logout
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
