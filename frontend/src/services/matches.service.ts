import api from './api';
import type { Match, MatchStatus } from '../types';

export interface TeamScore {
  teamId: number;
  rawScore: number;
}

export interface CreateMatchData {
  gameId: number;
  teams: TeamScore[];
  round?: number;
  status?: MatchStatus;
}

export const matchesService = {
  getAll: (gameId?: number) =>
    api
      .get<Match[]>('/matches', { params: gameId ? { gameId } : {} })
      .then((r) => r.data),
  getOne: (id: number) => api.get<Match>(`/matches/${id}`).then((r) => r.data),
  create: (data: CreateMatchData) => api.post<Match>('/matches', data).then((r) => r.data),
  update: (id: number, data: { status?: MatchStatus; round?: number }) =>
    api.put<Match>(`/matches/${id}`, data).then((r) => r.data),
  submitScores: (id: number, scores: TeamScore[]) =>
    api.post<Match>(`/matches/${id}/scores`, { scores }).then((r) => r.data),
  delete: (id: number) => api.delete(`/matches/${id}`),
};
