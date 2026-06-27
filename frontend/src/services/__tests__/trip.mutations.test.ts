import { tripService } from '../trip';
import { apiClient } from '@/lib';

jest.mock('@/lib', () => ({
  apiClient: {
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('tripService mutations', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('updateTrip', () => {
    it('patches the correct endpoint with update data', async () => {
      const response = { message: 'Trip updated successfully' };
      (apiClient.patch as jest.Mock).mockResolvedValue(response);

      const result = await tripService.updateTrip('99', { title: 'New Title' });

      expect(apiClient.patch).toHaveBeenCalledWith('/api/v1/trips/99', {
        title: 'New Title',
      });
      expect(result).toEqual(response);
    });

    it('propagates API errors', async () => {
      (apiClient.patch as jest.Mock).mockRejectedValue(new Error('Not found'));
      await expect(
        tripService.updateTrip('99', { title: 'x' })
      ).rejects.toThrow('Not found');
    });
  });

  describe('deleteTrip', () => {
    it('calls delete on the correct endpoint', async () => {
      const response = { message: 'Trip deleted successfully' };
      (apiClient.delete as jest.Mock).mockResolvedValue(response);

      const result = await tripService.deleteTrip('99');

      expect(apiClient.delete).toHaveBeenCalledWith('/api/v1/trips/99');
      expect(result).toEqual(response);
    });

    it('propagates API errors', async () => {
      (apiClient.delete as jest.Mock).mockRejectedValue(
        new Error('Unauthorized')
      );
      await expect(tripService.deleteTrip('99')).rejects.toThrow(
        'Unauthorized'
      );
    });
  });
});
