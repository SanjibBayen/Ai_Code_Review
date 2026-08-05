import apiClient from './axios';

export const historyApi = {
  getReviewHistory: async () => {
    const res = await apiClient.get('/history');
    return res.data;
  },

  getHistoryById: async (reviewId: string) => {
    const res = await apiClient.get(`/history/${reviewId}`);
    return res.data;
  },

  deleteHistory: async (reviewId: string) => {
    const res = await apiClient.delete(`/history/${reviewId}`);
    return res.data;
  }
};
