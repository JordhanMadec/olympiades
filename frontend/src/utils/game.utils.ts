import { GameFormat, GameType } from '@/types';

export function getGameTypeLabel(type: GameType) {
  const map = {
    [GameType.TIME]: 'Temps',
    [GameType.SCORE]: 'Score',
    [GameType.POINTS]: 'Points',
  };
  return map[type];
}

export function getGameFormatLabel(format: GameFormat) {
  return format === GameFormat.ROUND_ROBIN ? 'Round-Robin' : 'Élimination';
}
