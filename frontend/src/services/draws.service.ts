import { api } from './api';
import {
  TeamMatchHistory,
  RoundRobinMatch,
  BracketMatch,
  GenerateRoundRobinDto,
  GenerateBracketDto,
} from '../types';

export const drawsService = {
  async getConfrontationHistory(): Promise<TeamMatchHistory[]> {
    const response = await api.get<TeamMatchHistory[]>('/draws/history');
    return response.data;
  },

  async resetHistory(): Promise<void> {
    await api.delete('/draws/history');
  },

  async generateRoundRobin(dto: GenerateRoundRobinDto): Promise<RoundRobinMatch[]> {
    const response = await api.post<RoundRobinMatch[]>('/draws/generate-roundrobin', dto);
    return response.data;
  },

  async generateBracket(dto: GenerateBracketDto): Promise<BracketMatch[]> {
    const response = await api.post<BracketMatch[]>('/draws/generate-bracket', dto);
    return response.data;
  },
};
