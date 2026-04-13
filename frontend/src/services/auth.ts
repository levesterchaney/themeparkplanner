import { apiClient } from '@/lib/api-client';
import { RegistrationData } from '@/types/api';

export const authService = {
  register: async (data: RegistrationData) => {
    return apiClient.post('/api/v1/auth/register', data);
  },

  login: async (email: string, password: string) => {
    return apiClient.post('/api/v1/auth/login', { email, password });
  },

  logout: async () => {
    return apiClient.post('/api/v1/auth/logout');
  },
};
