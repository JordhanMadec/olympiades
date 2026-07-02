import api from './api';
import type { TeamRanking, GameRanking } from '../types';

export const rankingsService = {
  getGlobal: () => api.get<TeamRanking[]>('/rankings').then((r) => r.data),
  getAllGames: () => api.get<GameRanking[]>('/rankings/games').then((r) => r.data),
  getGame: (gameId: number) =>
    api.get<GameRanking>(`/rankings/games/${gameId}`).then((r) => r.data),
};
