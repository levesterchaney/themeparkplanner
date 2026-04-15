import { apiClient } from '@/lib/api-client';
import {
  ForgotPasswordRequestData,
  LoginRequestData,
  PasswordResetRequestData,
  RegistrationRequestData,
} from '@/types/api';

export const authService = {
  register: async (data: RegistrationRequestData) => {
    return apiClient.post('/api/v1/auth/register', data);
  },

  login: async (data: LoginRequestData) => {
    return apiClient.post('/api/v1/auth/login', data);
  },

  logout: async () => {
    return apiClient.post('/api/v1/auth/logout');
  },

  sendPasswordReset: async (data: ForgotPasswordRequestData) => {
    return apiClient.post('/api/v1/auth/forgot-password', data);
  },

  resetPassword: async (data: PasswordResetRequestData) => {
    return apiClient.post('/api/v1/auth/reset-password', data);
  },
};
