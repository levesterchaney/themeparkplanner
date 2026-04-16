import { apiClient } from '@/lib';

export interface ParkDetailResponseData {
  id: number;
  external_id: string;
  name: string;
  slug: string;
  resort_name: string;
  timezone: string;
  location_lat: number;
  location_lon: number;
  description: string;
  synced_at: string;
  created_at: string;
}

export interface AttractionDetailResponseData {
  id: number;
  park_id: number;
  external_id: string;
  name: string;
  type: string;
  area: string;
  min_height_cm: number;
  avg_duration_min: number;
  thrill_level: string;
  kid_friendly: boolean;
  location_lat: number;
  location_lon: number;
  attraction_metadata: object;
  synced_at: string;
  created_at: string;
}

export const parkService = {
  getParkList: async () => {
    return await apiClient.get<ParkDetailResponseData[]>('/api/v1/parks');
  },
  getParkInfo: async (parkId: string) => {
    return await apiClient.get<ParkDetailResponseData>(
      `/api/v1/parks/${parkId}`
    );
  },
  getParkAttractions: async (parkId: string) => {
    return await apiClient.get<AttractionDetailResponseData[]>(
      `/api/v1/parks/${parkId}/attractions`
    );
  },
};
