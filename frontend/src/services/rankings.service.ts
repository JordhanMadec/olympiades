import { api } from './api';
import { RankingEntry, GameRanking } from '../types';

export const rankingsService = {
  async getGeneralRanking(): Promise<RankingEntry[]> {
    const response = await api.get<RankingEntry[]>('/rankings');
    return response.data;
  },

  async getRankingByGame(gameId: number): Promise<RankingEntry[]> {
    const response = await api.get<RankingEntry[]>(`/rankings/game/${gameId}`);
    return response.data;
  },

  async getAllGameRankings(): Promise<GameRanking[]> {
    const response = await api.get<GameRanking[]>('/rankings/games');
    return response.data;
  },
};
