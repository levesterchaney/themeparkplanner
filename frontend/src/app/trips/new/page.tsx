'use client';

import { NewTripForm } from '@/forms';

export default function TripCreationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-center">Planning a Trip?</h2>
          <p className="mt-2 text-sm text-gray-600 text-center">
            Enter the details for your upcoming trip to get started planning
            now.
          </p>
        </div>

        <NewTripForm />
      </div>
    </div>
  );
}
