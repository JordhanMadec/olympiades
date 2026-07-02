import api from './api';
import type { DrawResult, Match } from '../types';

export const drawsService = {
  preview: (gameId: number) =>
    api.get<DrawResult>(`/draws/${gameId}/preview`).then((r) => r.data),
  generate: (gameId: number) =>
    api.post<Match[]>(`/draws/${gameId}/generate`).then((r) => r.data),
};
