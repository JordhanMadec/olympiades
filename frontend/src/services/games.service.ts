import api from './api';
import type { Game, GameType, GameFormat, ScoringDirection } from '../types';

export interface CreateGameData {
  name: string;
  type: GameType;
  format: GameFormat;
  scoringDirection?: ScoringDirection;
  description?: string;
}

export const gamesService = {
  getAll: () => api.get<Game[]>('/games').then((r) => r.data),
  getOne: (id: number) => api.get<Game>(`/games/${id}`).then((r) => r.data),
  create: (data: CreateGameData) => api.post<Game>('/games', data).then((r) => r.data),
  update: (id: number, data: Partial<CreateGameData>) =>
    api.put<Game>(`/games/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/games/${id}`),
};
