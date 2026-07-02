import api from './api';
import type { Team } from '../types';

export const teamsService = {
  getAll: () => api.get<Team[]>('/teams').then((r) => r.data),
  getOne: (id: number) => api.get<Team>(`/teams/${id}`).then((r) => r.data),
  create: (data: { name: string; color?: string }) =>
    api.post<Team>('/teams', data).then((r) => r.data),
  update: (id: number, data: Partial<{ name: string; color: string }>) =>
    api.put<Team>(`/teams/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/teams/${id}`),
};
