import {
  ItineraryPreferencesData,
  ItineraryResponse,
  ItineraryData,
} from '@/types/api';
import { apiClient } from '@/lib';

export const itineraryService = {
  generateItinerary: async (
    tripId: string,
    preferences: ItineraryPreferencesData
  ): Promise<ItineraryResponse> => {
    return apiClient.post(`/api/v1/trips/${tripId}/itineraries`, preferences);
  },

  getItinerary: async (
    tripId: string,
    date?: string
  ): Promise<ItineraryData> => {
    const url = date
      ? `/api/v1/trips/${tripId}/itineraries?date=${date}`
      : `/api/v1/trips/${tripId}/itineraries`;
    return apiClient.get(url);
  },

  getAllItineraries: async (tripId: string): Promise<ItineraryData[]> => {
    return apiClient.get(`/api/v1/trips/${tripId}/itineraries`);
  },

  updateItinerary: async (
    tripId: string,
    itineraryId: string,
    updates: Partial<ItineraryData>
  ): Promise<ItineraryResponse> => {
    return apiClient.patch(`/api/v1/itineraries/${itineraryId}`, updates);
  },

  deleteItinerary: async (
    tripId: string,
    itineraryId: string
  ): Promise<{ message: string }> => {
    return apiClient.delete(`/api/v1/itineraries/${itineraryId}`);
  },

  regenerateItinerary: async (
    tripId: string,
    itineraryId: string,
    preferences: ItineraryPreferencesData
  ): Promise<ItineraryResponse> => {
    return apiClient.patch(
      `/api/v1/itineraries/${itineraryId}/regenerate`,
      preferences
    );
  },
};
