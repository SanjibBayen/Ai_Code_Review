import apiClient from './axios';

export const authApi = {
  register: async (data: { name: string; email: string; password?: string }) => {
    const res = await apiClient.post('/auth/register', data);
    return res.data;
  },

  login: async (data: { email: string; password?: string }) => {
    const res = await apiClient.post('/auth/login', data);
    return res.data;
  },

  verifyOTP: async (data: { email: string; otp: string }) => {
    const res = await apiClient.post('/auth/verify-otp', data);
    return res.data;
  },

  resendOTP: async (email: string) => {
    const res = await apiClient.post('/auth/resend-otp', { email });
    return res.data;
  },

  getCurrentUser: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  logout: async () => {
    const res = await apiClient.post('/auth/logout');
    return res.data;
  }
};
