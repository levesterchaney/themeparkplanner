import HealthCheck from '@/components/HealthCheck';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Theme Park Planner
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Plan your perfect theme park adventure with real-time data and intelligent recommendations
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
              System Status
            </h2>
            <HealthCheck />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                🏰 Parks
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Browse theme parks and attractions
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                🎢 Attractions
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Check real-time wait times and plan your route
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                📋 Itineraries
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create and manage your visit plans
              </p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              API Base URL: {process.env.NEXT_PUBLIC_API_BASE_URL || 'Not configured'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
