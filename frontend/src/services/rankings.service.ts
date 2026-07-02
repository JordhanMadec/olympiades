import { api } from './api';
import { GameRanking } from '../types';

export const rankingsService = {
  async getGeneralRanking(): Promise<GameRanking> {
    const response = await api.get<GameRanking>('/rankings/general');
    return response.data;
  },

  async getRankingByGame(gameId: number): Promise<GameRanking> {
    const response = await api.get<GameRanking>(`/rankings/game/${gameId}`);
    return response.data;
  },

  async getAllGameRankings(): Promise<GameRanking[]> {
    const response = await api.get<GameRanking[]>('/rankings/games');
    return response.data;
  },
};
