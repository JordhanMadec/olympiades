import { api } from './api';
import { Team, CreateTeamDto, UpdateTeamDto } from '../types';

export const teamsService = {
  async getAll(): Promise<Team[]> {
    const response = await api.get<Team[]>('/teams');
    return response.data;
  },

  async getById(id: number): Promise<Team> {
    const response = await api.get<Team>(`/teams/${id}`);
    return response.data;
  },

  async create(dto: CreateTeamDto): Promise<Team> {
    const response = await api.post<Team>('/teams', dto);
    return response.data;
  },

  async update(id: number, dto: UpdateTeamDto): Promise<Team> {
    const response = await api.put<Team>(`/teams/${id}`, dto);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/teams/${id}`);
  },
};
