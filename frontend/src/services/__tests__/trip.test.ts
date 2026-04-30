import { tripService } from '../trip';
import { apiClient } from '@/lib';
import { NewTripRequestData } from '@/types/api';

jest.mock('@/lib', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

describe('tripService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTrip', () => {
    it('should create a trip successfully', async () => {
      const tripData: NewTripRequestData = {
        title: 'Disney Adventure',
        destination: 'Walt Disney World Resort',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-05'),
        partySize: 4,
        hasKids: true,
      };

      const expectedResponse = { message: 'Trip created successfully' };
      (apiClient.post as jest.Mock).mockResolvedValue(expectedResponse);

      const result = await tripService.createTrip(tripData);

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/trips', tripData);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle API errors when creating a trip', async () => {
      const tripData: NewTripRequestData = {
        title: 'Disney Adventure',
        destination: 'Walt Disney World Resort',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-05'),
        partySize: 4,
        hasKids: true,
      };

      const apiError = new Error('Network error');
      (apiClient.post as jest.Mock).mockRejectedValue(apiError);

      await expect(tripService.createTrip(tripData)).rejects.toThrow(
        'Network error'
      );
      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/trips', tripData);
    });

    it('should call the correct endpoint for trip creation', async () => {
      const tripData: NewTripRequestData = {
        title: 'Universal Adventure',
        destination: 'Universal Orlando Resort',
        startDate: new Date('2024-07-01'),
        endDate: new Date('2024-07-03'),
        partySize: 2,
        hasKids: false,
      };

      (apiClient.post as jest.Mock).mockResolvedValue({ message: 'Success' });

      await tripService.createTrip(tripData);

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/trips', tripData);
      expect(apiClient.post).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUpcomingTrips', () => {
    it('should fetch upcoming trips successfully', async () => {
      const expectedTrips = [
        {
          id: 1,
          title: 'Disney Adventure',
          destination: 'Walt Disney World Resort',
          start_date: '2024-06-01',
          end_date: '2024-06-05',
          party_size: 4,
          has_kids: true,
          status: 'planned',
        },
        {
          id: 2,
          title: 'Universal Fun',
          destination: 'Universal Orlando Resort',
          start_date: '2024-07-01',
          end_date: '2024-07-03',
          party_size: 2,
          has_kids: false,
          status: 'draft',
        },
      ];

      (apiClient.get as jest.Mock).mockResolvedValue(expectedTrips);

      const result = await tripService.getUpcomingTrips();

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/trips');
      expect(result).toEqual(expectedTrips);
    });

    it('should handle API errors when fetching upcoming trips', async () => {
      const apiError = new Error('Authentication failed');
      (apiClient.get as jest.Mock).mockRejectedValue(apiError);

      await expect(tripService.getUpcomingTrips()).rejects.toThrow(
        'Authentication failed'
      );
      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/trips');
    });

    it('should return empty array when no trips exist', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue([]);

      const result = await tripService.getUpcomingTrips();

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/trips');
      expect(result).toEqual([]);
    });
  });

  describe('getPastTrips', () => {
    it('should fetch past trips successfully', async () => {
      const expectedTrips = [
        {
          id: 3,
          title: 'Disneyland Trip',
          destination: 'Disneyland Resort',
          start_date: '2023-12-01',
          end_date: '2023-12-05',
          party_size: 3,
          has_kids: true,
          status: 'completed',
        },
      ];

      (apiClient.get as jest.Mock).mockResolvedValue(expectedTrips);

      const result = await tripService.getPastTrips();

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/trips');
      expect(result).toEqual(expectedTrips);
    });

    it('should handle API errors when fetching past trips', async () => {
      const apiError = new Error('Server error');
      (apiClient.get as jest.Mock).mockRejectedValue(apiError);

      await expect(tripService.getPastTrips()).rejects.toThrow('Server error');
      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/trips');
    });

    it('should return empty array when no past trips exist', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue([]);

      const result = await tripService.getPastTrips();

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/trips');
      expect(result).toEqual([]);
    });
  });

  describe('getSpecificTrip', () => {
    it('should fetch a specific trip successfully', async () => {
      const tripId = '123';
      const expectedTrip = {
        id: 123,
        title: 'Specific Trip',
        destination: 'Walt Disney World Resort',
        start_date: '2024-08-01',
        end_date: '2024-08-05',
        party_size: 2,
        has_kids: false,
        status: 'planned',
      };

      (apiClient.get as jest.Mock).mockResolvedValue(expectedTrip);

      const result = await tripService.getSpecificTrip(tripId);

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/trips/123');
      expect(result).toEqual(expectedTrip);
    });

    it('should handle API errors when fetching a specific trip', async () => {
      const tripId = '999';
      const apiError = new Error('Trip not found');
      (apiClient.get as jest.Mock).mockRejectedValue(apiError);

      await expect(tripService.getSpecificTrip(tripId)).rejects.toThrow(
        'Trip not found'
      );
      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/trips/999');
    });

    it('should call the correct endpoint with trip ID', async () => {
      const tripId = '456';
      const expectedTrip = {
        id: 456,
        title: 'Test Trip',
        destination: 'Universal Orlando Resort',
        start_date: '2024-09-01',
        end_date: '2024-09-03',
        party_size: 1,
        has_kids: false,
        status: 'draft',
      };

      (apiClient.get as jest.Mock).mockResolvedValue(expectedTrip);

      await tripService.getSpecificTrip(tripId);

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/trips/456');
      expect(apiClient.get).toHaveBeenCalledTimes(1);
    });

    it('should handle string and numeric trip IDs correctly', async () => {
      const stringTripId = '789';
      const numericTripId = 789;

      const expectedTrip = {
        id: numericTripId,
        title: 'ID Test Trip',
        destination: 'Disneyland Resort',
        start_date: '2024-10-01',
        end_date: '2024-10-03',
        party_size: 4,
        has_kids: true,
        status: 'planned',
      };

      (apiClient.get as jest.Mock).mockResolvedValue(expectedTrip);

      await tripService.getSpecificTrip(stringTripId);

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/trips/789');
    });
  });

  describe('API client integration', () => {
    it('should properly pass data to apiClient for all methods', async () => {
      const tripData: NewTripRequestData = {
        title: 'Integration Test',
        destination: 'Test Resort',
        startDate: new Date('2024-12-01'),
        endDate: new Date('2024-12-05'),
        partySize: 3,
        hasKids: true,
      };

      (apiClient.post as jest.Mock).mockResolvedValue({ message: 'Success' });
      (apiClient.get as jest.Mock).mockResolvedValue([]);

      await tripService.createTrip(tripData);
      await tripService.getUpcomingTrips();
      await tripService.getPastTrips();
      await tripService.getSpecificTrip('1');

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/trips', tripData);
      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/trips');
      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/trips');
      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/trips/1');
    });

    it('should maintain proper method call counts', async () => {
      const tripData: NewTripRequestData = {
        title: 'Count Test',
        destination: 'Test Resort',
        startDate: new Date('2024-12-01'),
        endDate: new Date('2024-12-05'),
        partySize: 1,
        hasKids: false,
      };

      (apiClient.post as jest.Mock).mockResolvedValue({ message: 'Success' });
      (apiClient.get as jest.Mock).mockResolvedValue([]);

      await tripService.createTrip(tripData);
      await tripService.getUpcomingTrips();

      expect(apiClient.post).toHaveBeenCalledTimes(1);
      expect(apiClient.get).toHaveBeenCalledTimes(1);
    });
  });
});
