import {
  parkService,
  ParkDetailResponseData,
  AttractionDetailResponseData,
} from '@/services/park';
import { apiClient } from '@/lib/api-client';

// Mock the apiClient
jest.mock('@/lib/api-client');
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('parkService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getParkList', () => {
    it('should fetch and return list of parks', async () => {
      // Arrange
      const mockParks: ParkDetailResponseData[] = [
        {
          id: 1,
          external_id: 'park_001',
          name: 'Magic Kingdom',
          slug: 'magic-kingdom',
          resort_name: 'Walt Disney World',
          timezone: 'America/New_York',
          location_lat: 28.417663,
          location_lon: -81.581212,
          description: 'The most magical place on earth',
          synced_at: '2023-12-01T10:00:00Z',
          created_at: '2023-01-01T00:00:00Z',
        },
        {
          id: 2,
          external_id: 'park_002',
          name: 'EPCOT',
          slug: 'epcot',
          resort_name: 'Walt Disney World',
          timezone: 'America/New_York',
          location_lat: 28.375015,
          location_lon: -81.549303,
          description: 'Experimental Prototype Community of Tomorrow',
          synced_at: '2023-12-01T10:00:00Z',
          created_at: '2023-01-01T00:00:00Z',
        },
      ];

      mockApiClient.get.mockResolvedValue(mockParks);

      // Act
      const result = await parkService.getParkList();

      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/parks');
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockParks);
    });

    it('should handle API error when fetching park list', async () => {
      // Arrange
      const mockError = new Error('API Error: Failed to fetch parks');
      mockApiClient.get.mockRejectedValue(mockError);

      // Act & Assert
      await expect(parkService.getParkList()).rejects.toThrow(
        'API Error: Failed to fetch parks'
      );
      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/parks');
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);
    });

    it('should handle empty park list response', async () => {
      // Arrange
      const emptyParks: ParkDetailResponseData[] = [];
      mockApiClient.get.mockResolvedValue(emptyParks);

      // Act
      const result = await parkService.getParkList();

      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/parks');
      expect(result).toEqual(emptyParks);
      expect(result).toHaveLength(0);
    });
  });

  describe('getParkInfo', () => {
    it('should fetch and return specific park information', async () => {
      // Arrange
      const parkId = '42';
      const mockPark: ParkDetailResponseData = {
        id: 42,
        external_id: 'park_042',
        name: 'Universal Studios Florida',
        slug: 'universal-studios-florida',
        resort_name: 'Universal Orlando Resort',
        timezone: 'America/New_York',
        location_lat: 28.4793754,
        location_lon: -81.4689025,
        description: 'Ride the movies at Universal Studios Florida',
        synced_at: '2023-12-01T15:30:00Z',
        created_at: '2023-01-15T00:00:00Z',
      };

      mockApiClient.get.mockResolvedValue(mockPark);

      // Act
      const result = await parkService.getParkInfo(parkId);

      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith(`/api/v1/parks/${parkId}`);
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockPark);
    });

    it('should handle API error when fetching park info', async () => {
      // Arrange
      const parkId = '999';
      const mockError = new Error('API Error: Park not found');
      mockApiClient.get.mockRejectedValue(mockError);

      // Act & Assert
      await expect(parkService.getParkInfo(parkId)).rejects.toThrow(
        'API Error: Park not found'
      );
      expect(mockApiClient.get).toHaveBeenCalledWith(`/api/v1/parks/${parkId}`);
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);
    });

    it('should handle numeric park ID as string', async () => {
      // Arrange
      const parkId = '123';
      const mockPark: ParkDetailResponseData = {
        id: 123,
        external_id: 'park_123',
        name: 'Test Park',
        slug: 'test-park',
        resort_name: 'Test Resort',
        timezone: 'America/Los_Angeles',
        location_lat: 34.0522,
        location_lon: -118.2437,
        description: 'A test park for unit testing',
        synced_at: '2023-12-01T12:00:00Z',
        created_at: '2023-01-01T00:00:00Z',
      };

      mockApiClient.get.mockResolvedValue(mockPark);

      // Act
      const result = await parkService.getParkInfo(parkId);

      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/parks/123');
      expect(result).toEqual(mockPark);
    });
  });

  describe('getParkAttractions', () => {
    it('should fetch and return attractions for a specific park', async () => {
      // Arrange
      const parkId = '1';
      const mockAttractions: AttractionDetailResponseData[] = [
        {
          id: 1,
          park_id: 1,
          external_id: 'attraction_001',
          name: 'Space Mountain',
          type: 'roller_coaster',
          area: 'Tomorrowland',
          min_height_cm: 112,
          avg_duration_min: 3,
          thrill_level: 'moderate',
          kid_friendly: false,
          location_lat: 28.418956,
          location_lon: -81.578674,
          attraction_metadata: {
            capacity: 2000,
            opened_date: '1975-01-15',
          },
          synced_at: '2023-12-01T10:00:00Z',
          created_at: '2023-01-01T00:00:00Z',
        },
        {
          id: 2,
          park_id: 1,
          external_id: 'attraction_002',
          name: 'Pirates of the Caribbean',
          type: 'dark_ride',
          area: 'Adventureland',
          min_height_cm: 0,
          avg_duration_min: 8,
          thrill_level: 'mild',
          kid_friendly: true,
          location_lat: 28.418024,
          location_lon: -81.583755,
          attraction_metadata: {
            capacity: 3000,
            opened_date: '1973-12-15',
          },
          synced_at: '2023-12-01T10:00:00Z',
          created_at: '2023-01-01T00:00:00Z',
        },
      ];

      mockApiClient.get.mockResolvedValue(mockAttractions);

      // Act
      const result = await parkService.getParkAttractions(parkId);

      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith(
        `/api/v1/parks/${parkId}/attractions`
      );
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockAttractions);
      expect(result).toHaveLength(2);
    });

    it('should handle API error when fetching park attractions', async () => {
      // Arrange
      const parkId = '999';
      const mockError = new Error('API Error: Park not found');
      mockApiClient.get.mockRejectedValue(mockError);

      // Act & Assert
      await expect(parkService.getParkAttractions(parkId)).rejects.toThrow(
        'API Error: Park not found'
      );
      expect(mockApiClient.get).toHaveBeenCalledWith(
        `/api/v1/parks/${parkId}/attractions`
      );
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);
    });

    it('should handle empty attractions list for a park', async () => {
      // Arrange
      const parkId = '5';
      const emptyAttractions: AttractionDetailResponseData[] = [];
      mockApiClient.get.mockResolvedValue(emptyAttractions);

      // Act
      const result = await parkService.getParkAttractions(parkId);

      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/api/v1/parks/5/attractions'
      );
      expect(result).toEqual(emptyAttractions);
      expect(result).toHaveLength(0);
    });

    it('should handle different attraction types and properties', async () => {
      // Arrange
      const parkId = '2';
      const mockAttractions: AttractionDetailResponseData[] = [
        {
          id: 10,
          park_id: 2,
          external_id: 'attraction_010',
          name: 'Test of Track',
          type: 'simulator',
          area: 'Future World',
          min_height_cm: 102,
          avg_duration_min: 5,
          thrill_level: 'high',
          kid_friendly: false,
          location_lat: 28.374185,
          location_lon: -81.549354,
          attraction_metadata: {
            capacity: 1500,
            opened_date: '1999-03-17',
            sponsor: 'General Motors',
          },
          synced_at: '2023-12-01T14:00:00Z',
          created_at: '2023-01-01T00:00:00Z',
        },
      ];

      mockApiClient.get.mockResolvedValue(mockAttractions);

      // Act
      const result = await parkService.getParkAttractions(parkId);

      // Assert
      expect(result).toEqual(mockAttractions);
      expect(result[0].type).toBe('simulator');
      expect(result[0].thrill_level).toBe('high');
      expect(result[0].kid_friendly).toBe(false);
      expect(result[0].attraction_metadata).toEqual({
        capacity: 1500,
        opened_date: '1999-03-17',
        sponsor: 'General Motors',
      });
    });
  });

  describe('TypeScript type checking', () => {
    it('should ensure proper typing for ParkDetailResponseData', async () => {
      // This test ensures the service maintains proper TypeScript typing
      const mockPark: ParkDetailResponseData = {
        id: 1,
        external_id: 'test',
        name: 'Test Park',
        slug: 'test-park',
        resort_name: 'Test Resort',
        timezone: 'UTC',
        location_lat: 0,
        location_lon: 0,
        description: 'Test description',
        synced_at: '2023-01-01T00:00:00Z',
        created_at: '2023-01-01T00:00:00Z',
      };

      mockApiClient.get.mockResolvedValue(mockPark);

      const result = await parkService.getParkInfo('1');

      // TypeScript will catch type errors at compile time
      expect(typeof result.id).toBe('number');
      expect(typeof result.name).toBe('string');
      expect(typeof result.location_lat).toBe('number');
      expect(typeof result.location_lon).toBe('number');
    });

    it('should ensure proper typing for AttractionDetailResponseData', async () => {
      const mockAttractions: AttractionDetailResponseData[] = [
        {
          id: 1,
          park_id: 1,
          external_id: 'test',
          name: 'Test Attraction',
          type: 'test_type',
          area: 'Test Area',
          min_height_cm: 100,
          avg_duration_min: 5,
          thrill_level: 'mild',
          kid_friendly: true,
          location_lat: 0,
          location_lon: 0,
          attraction_metadata: {},
          synced_at: '2023-01-01T00:00:00Z',
          created_at: '2023-01-01T00:00:00Z',
        },
      ];

      mockApiClient.get.mockResolvedValue(mockAttractions);

      const result = await parkService.getParkAttractions('1');

      // TypeScript will catch type errors at compile time
      expect(typeof result[0].id).toBe('number');
      expect(typeof result[0].park_id).toBe('number');
      expect(typeof result[0].kid_friendly).toBe('boolean');
      expect(typeof result[0].min_height_cm).toBe('number');
      expect(typeof result[0].attraction_metadata).toBe('object');
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined or null park ID gracefully', async () => {
      // This tests how the service handles edge cases
      mockApiClient.get.mockResolvedValue({});

      // These calls will use the parkId as-is since the service doesn't validate input
      await parkService.getParkInfo('undefined');
      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/parks/undefined');

      await parkService.getParkAttractions('null');
      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/api/v1/parks/null/attractions'
      );
    });

    it('should handle special characters in park ID', async () => {
      mockApiClient.get.mockResolvedValue({});

      await parkService.getParkInfo('park-with-special-chars-123');
      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/api/v1/parks/park-with-special-chars-123'
      );
    });

    it('should handle very large park IDs', async () => {
      const largeId = '999999999999999999';
      mockApiClient.get.mockResolvedValue({});

      await parkService.getParkInfo(largeId);
      expect(mockApiClient.get).toHaveBeenCalledWith(
        `/api/v1/parks/${largeId}`
      );
    });
  });
});
