import apiClient from './axios';

export const projectApi = {
  getProjects: async () => {
    const res = await apiClient.get('/projects');
    return res.data;
  },

  createProject: async (data: { name: string; description?: string; repository?: string; branch?: string; language?: string }) => {
    const res = await apiClient.post('/projects', data);
    return res.data;
  },

  getProject: async (id: string) => {
    const res = await apiClient.get(`/projects/${id}`);
    return res.data;
  },

  updateProject: async (id: string, data: Partial<{ name: string; description: string; repository: string; branch: string; language: string }>) => {
    const res = await apiClient.put(`/projects/${id}`, data);
    return res.data;
  },

  deleteProject: async (id: string) => {
    const res = await apiClient.delete(`/projects/${id}`);
    return res.data;
  }
};
