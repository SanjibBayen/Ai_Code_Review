import { create } from 'zustand';
import { Project } from '../types';
import { projectApi } from '../api/project.api';

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  fetchProjectById: (id: string) => Promise<Project | null>;
  createProject: (data: { name: string; description?: string; repository?: string; branch?: string; language?: string }) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  selectProject: (project: Project | null) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  selectedProject: null,
  loading: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const res = await projectApi.getProjects();
      set({ projects: res.projects || [], loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to fetch projects', loading: false });
    }
  },

  fetchProjectById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const res = await projectApi.getProject(id);
      set({ selectedProject: res.project, loading: false });
      return res.project;
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Project not found', loading: false });
      return null;
    }
  },

  createProject: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await projectApi.createProject(data);
      const newProj = res.project;
      set((state) => ({ projects: [newProj, ...state.projects], loading: false }));
      return newProj;
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to create project', loading: false });
      throw err;
    }
  },

  deleteProject: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await projectApi.deleteProject(id);
      set((state) => ({
        projects: state.projects.filter(p => p.id !== id),
        selectedProject: state.selectedProject?.id === id ? null : state.selectedProject,
        loading: false
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to delete project', loading: false });
    }
  },

  selectProject: (project) => set({ selectedProject: project })
}));
