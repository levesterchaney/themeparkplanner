import {apiClient} from '@/lib/api-client';
import {RegistrationData} from '@/types/api';

export const authService = {
    register: async (data: RegistrationData) => {
        return apiClient.post('/api/v1/auth/register', data);
    }
};
