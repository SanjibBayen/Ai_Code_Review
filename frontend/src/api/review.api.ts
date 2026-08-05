import apiClient from './axios';

export const reviewApi = {
  analyzeCode: async (data: { projectId?: string; code: string; fileName?: string; language?: string }) => {
    const res = await apiClient.post('/review/analyze', data);
    return res.data;
  },

  getReview: async (reviewId: string) => {
    const res = await apiClient.get(`/review/${reviewId}`);
    return res.data;
  }
};
