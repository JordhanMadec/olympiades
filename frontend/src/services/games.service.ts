import { api } from './api';
import { Game, CreateGameDto, UpdateGameDto } from '../types';

export const gamesService = {
  async getAll(): Promise<Game[]> {
    const response = await api.get<Game[]>('/games');
    return response.data;
  },

  async getById(id: number): Promise<Game> {
    const response = await api.get<Game>(`/games/${id}`);
    return response.data;
  },

  async create(dto: CreateGameDto): Promise<Game> {
    const response = await api.post<Game>('/games', dto);
    return response.data;
  },

  async update(id: number, dto: UpdateGameDto): Promise<Game> {
    const response = await api.put<Game>(`/games/${id}`, dto);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/games/${id}`);
  },
};
