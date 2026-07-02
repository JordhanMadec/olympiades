import { api } from './api';
import { Match, CreateMatchDto, UpdateMatchDto, UpdateScoresDto } from '../types';

export const matchesService = {
  async getAll(gameId?: number): Promise<Match[]> {
    const params = gameId ? { gameId } : {};
    const response = await api.get<Match[]>('/matches', { params });
    return response.data;
  },

  async getById(id: number): Promise<Match> {
    const response = await api.get<Match>(`/matches/${id}`);
    return response.data;
  },

  async create(dto: CreateMatchDto): Promise<Match> {
    const response = await api.post<Match>('/matches', dto);
    return response.data;
  },

  async update(id: number, dto: UpdateMatchDto): Promise<Match> {
    const response = await api.put<Match>(`/matches/${id}`, dto);
    return response.data;
  },

  async updateScores(id: number, dto: UpdateScoresDto): Promise<Match> {
    const response = await api.put<Match>(`/matches/${id}/scores`, dto);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/matches/${id}`);
  },

  async generateAll(): Promise<{ created: number }> {
    const response = await api.post<{ created: number }>('/matches/generate-all');
    return response.data;
  },

  async deleteAll(): Promise<void> {
    await api.delete('/matches/all');
  },
};
