'use client';

import { Button, TabPanel, TripCard } from '@/components';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { tripService } from '@/services';
import { TripDetailResponseData } from '@/services/trip';

export default function MyTripsSummaryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [upcomingTripList, setUpcomingTripList] = useState<
    TripDetailResponseData[]
  >([]);
  const [pastTripList, setPastTripList] = useState<TripDetailResponseData[]>(
    []
  );
  console.log(upcomingTripList); //TODO remove
  console.log(pastTripList); //TODO remove

  const openTripCreation = () => {
    router.push('/trips/new');
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate).toLocaleDateString();
    const end = new Date(endDate).toLocaleDateString();
    return `${start} - ${end}`;
  };

  const content = [
    {
      id: 'upcoming-trips',
      label: `Upcoming (${upcomingTripList.length})`,
      content: (
        <div className="space-y-4">
          {upcomingTripList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No upcoming trips planned.</p>
              <Button onClick={openTripCreation} className="mt-4">
                Create Your First Trip
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingTripList.map((trip) => (
                <TripCard
                  key={trip.id}
                  id={trip.id}
                  title={trip.title}
                  destination={trip.destination}
                  dateRange={formatDateRange(trip.start_date, trip.end_date)}
                  status={trip.status}
                  partySize={trip.party_size}
                  hasKids={trip.has_kids}
                />
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'past-trips',
      label: `Past (${pastTripList.length})`,
      content: (
        <div className="space-y-4">
          {pastTripList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No past trips to show.</p>
              <p className="text-sm mt-1">
                Your completed trips will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastTripList.map((trip) => (
                <TripCard
                  key={trip.id}
                  id={trip.id}
                  title={trip.title}
                  destination={trip.destination}
                  dateRange={formatDateRange(trip.start_date, trip.end_date)}
                  status={trip.status}
                  partySize={trip.party_size}
                  hasKids={trip.has_kids}
                />
              ))}
            </div>
          )}
        </div>
      ),
    },
  ];

  useEffect(() => {
    const fetchUserTripData = async () => {
      setLoading(true);
      const upcomingTrips = await tripService.getUpcomingTrips();
      const pastTrips = await tripService.getPastTrips();

      setUpcomingTripList(upcomingTrips);
      setPastTripList(pastTrips);
      setLoading(false);
    };

    fetchUserTripData();
  }, []);

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

      {loading ? <div /> : <TabPanel tabs={content} />}
    </div>
  );
}
