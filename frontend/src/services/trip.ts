import { NewTripRequestData } from '@/types/api';
import { apiClient } from '@/lib';

export interface TripDetailResponseData {
  id: number;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  party_size: number;
  has_kids: boolean;
  status: string;
}

export const tripService = {
  createTrip: async (
    data: NewTripRequestData
  ): Promise<{ message: string }> => {
    return apiClient.post('/api/v1/trips', data);
  },
  getUpcomingTrips: async (): Promise<TripDetailResponseData[]> => {
    const allTrips: TripDetailResponseData[] =
      await apiClient.get('/api/v1/trips');
    return allTrips.filter(
      (trip) => trip.start_date > new Date().toISOString()
    );
  },
  getPastTrips: async (): Promise<TripDetailResponseData[]> => {
    const allTrips: TripDetailResponseData[] =
      await apiClient.get('/api/v1/trips');
    return allTrips.filter(
      (trip) => trip.start_date <= new Date().toISOString()
    );
  },
  getSpecificTrip: async (tripId: string): Promise<TripDetailResponseData> => {
    return apiClient.get(`/api/v1/trips/${tripId}`);
  },
};
