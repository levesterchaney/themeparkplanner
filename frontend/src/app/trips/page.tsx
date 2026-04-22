'use client';

import { Button, TabPanel } from '@/components';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { tripService } from '@/services';
import { TripDetailResponseData } from '@/services/trip';

export default function MyTripsSummaryPage() {
  const router = useRouter();
  const [upcomingTripList, setUpcomingTripList] = useState<
    TripDetailResponseData[]
  >([]);
  const [pastTripList, setPastTripList] = useState<TripDetailResponseData[]>(
    []
  );
  console.log(upcomingTripList); //TODO remove
  console.log(pastTripList); //TODO remove

  const content = [
    {
      id: 'upcoming-trips',
      label: 'Upcoming',
      content: <div>Placeholder upcoming trip content</div>,
    },
    {
      id: 'past-trips',
      label: 'Past',
      content: <div>Placeholder past trip content</div>,
    },
  ];

  const openTripCreation = () => {
    router.push('/trips/new');
  };

  useEffect(() => {
    const fetchUserTripData = async () => {
      const upcomingTrips = await tripService.getUpcomingTrips();
      const pastTrips = await tripService.getPastTrips();

      setUpcomingTripList(upcomingTrips);
      setPastTripList(pastTrips);
    };

    fetchUserTripData();
  });

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
          <Button onClick={() => openTripCreation()}>Create New Trip</Button>
        </div>
      </div>

      <TabPanel tabs={content} />
    </div>
  );
}
