import { itineraryService } from '../itinerary';
import { apiClient } from '@/lib';
import { ItineraryPreferencesData } from '@/types/api';

jest.mock('@/lib', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockPreferences: ItineraryPreferencesData = {
  thrill_level: 'moderate',
  visit_style: 'moderate',
  start_time: '09:00',
  end_time: '21:00',
  must_do_attractions: [],
  skip_attractions: [],
  preferred_attraction_types: [],
  accessibility_needs: [],
  dietary_restrictions: [],
  budget_tier: 'moderate',
};

describe('itineraryService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('generateItinerary', () => {
    it('posts to the correct endpoint with preferences', async () => {
      const response = { id: '1', days: [] };
      (apiClient.post as jest.Mock).mockResolvedValue(response);

      const result = await itineraryService.generateItinerary(
        '42',
        mockPreferences
      );

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/v1/trips/42/itineraries',
        mockPreferences
      );
      expect(result).toEqual(response);
    });

    it('propagates API errors', async () => {
      (apiClient.post as jest.Mock).mockRejectedValue(
        new Error('Server error')
      );
      await expect(
        itineraryService.generateItinerary('42', mockPreferences)
      ).rejects.toThrow('Server error');
    });
  });

  describe('getItinerary', () => {
    it('fetches itinerary without date param', async () => {
      const response = { id: '1' };
      (apiClient.get as jest.Mock).mockResolvedValue(response);

      await itineraryService.getItinerary('42');

      expect(apiClient.get).toHaveBeenCalledWith(
        '/api/v1/trips/42/itineraries'
      );
    });

    it('appends date query param when date is provided', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({});

      await itineraryService.getItinerary('42', '2026-07-01');

      expect(apiClient.get).toHaveBeenCalledWith(
        '/api/v1/trips/42/itineraries?date=2026-07-01'
      );
    });

    it('propagates API errors', async () => {
      (apiClient.get as jest.Mock).mockRejectedValue(new Error('Not found'));
      await expect(itineraryService.getItinerary('42')).rejects.toThrow(
        'Not found'
      );
    });
  });

  describe('getAllItineraries', () => {
    it('fetches all itineraries for a trip', async () => {
      const response = [{ id: '1' }, { id: '2' }];
      (apiClient.get as jest.Mock).mockResolvedValue(response);

      const result = await itineraryService.getAllItineraries('42');

      expect(apiClient.get).toHaveBeenCalledWith(
        '/api/v1/trips/42/itineraries'
      );
      expect(result).toEqual(response);
    });

    it('propagates API errors', async () => {
      (apiClient.get as jest.Mock).mockRejectedValue(new Error('Unauthorized'));
      await expect(itineraryService.getAllItineraries('42')).rejects.toThrow(
        'Unauthorized'
      );
    });
  });

  describe('updateItinerary', () => {
    it('patches the correct itinerary endpoint', async () => {
      const updates = { title: 'Updated' };
      const response = { message: 'Updated' };
      (apiClient.patch as jest.Mock).mockResolvedValue(response);

      const result = await itineraryService.updateItinerary(
        '42',
        'itin-1',
        updates
      );

      expect(apiClient.patch).toHaveBeenCalledWith(
        '/api/v1/itineraries/itin-1',
        updates
      );
      expect(result).toEqual(response);
    });

    it('propagates API errors', async () => {
      (apiClient.patch as jest.Mock).mockRejectedValue(new Error('Conflict'));
      await expect(
        itineraryService.updateItinerary('42', 'itin-1', {})
      ).rejects.toThrow('Conflict');
    });
  });

  describe('deleteItinerary', () => {
    it('deletes the correct itinerary endpoint', async () => {
      const response = { message: 'Deleted' };
      (apiClient.delete as jest.Mock).mockResolvedValue(response);

      const result = await itineraryService.deleteItinerary('42', 'itin-1');

      expect(apiClient.delete).toHaveBeenCalledWith(
        '/api/v1/itineraries/itin-1'
      );
      expect(result).toEqual(response);
    });

    it('propagates API errors', async () => {
      (apiClient.delete as jest.Mock).mockRejectedValue(new Error('Not found'));
      await expect(
        itineraryService.deleteItinerary('42', 'itin-1')
      ).rejects.toThrow('Not found');
    });
  });

  describe('regenerateItinerary', () => {
    it('patches the regenerate endpoint with preferences', async () => {
      const response = { id: '1', days: [] };
      (apiClient.patch as jest.Mock).mockResolvedValue(response);

      const result = await itineraryService.regenerateItinerary(
        '42',
        'itin-1',
        mockPreferences
      );

      expect(apiClient.patch).toHaveBeenCalledWith(
        '/api/v1/itineraries/itin-1/regenerate',
        mockPreferences
      );
      expect(result).toEqual(response);
    });

    it('propagates API errors', async () => {
      (apiClient.patch as jest.Mock).mockRejectedValue(
        new Error('Server error')
      );
      await expect(
        itineraryService.regenerateItinerary('42', 'itin-1', mockPreferences)
      ).rejects.toThrow('Server error');
    });
  });
});
