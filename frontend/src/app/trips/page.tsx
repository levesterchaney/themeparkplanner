'use client';

import { Button } from '@/components';

export default function MyTripsSummaryPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page heading */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 dark:text-white">My Trips</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Plan and manage your theme park adventures
          </p>
        </div>
        <div className="flex justify-end">
          <Button disabled={true}>Create New Trip</Button>
        </div>
      </div>
    </div>
  );
}
