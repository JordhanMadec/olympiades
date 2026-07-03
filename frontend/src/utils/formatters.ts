import { GameType, Game } from '../types';

/**
 * Format a time value in seconds to MM:SS or HH:MM:SS
 */
export function formatTime(seconds: number): string {
  if (seconds < 0) return '00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Parse a time string (MM:SS or HH:MM:SS) to seconds
 */
export function parseTime(timeString: string): number {
  const parts = timeString.split(':').map(p => parseInt(p, 10) || 0);
  
  if (parts.length === 3) {
    // HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // MM:SS
    return parts[0] * 60 + parts[1];
  }
  
  return 0;
}

/**
 * Format a quantity with its unit
 */
export function formatQuantity(value: number, unit?: string): string {
  if (unit) {
    return `${value} ${unit}`;
  }
  return value.toString();
}

/**
 * Format a score based on game type
 */
export function formatScore(value: number | null | undefined, game: Game): string {
  if (value === null || value === undefined) {
    return '-';
  }
  
  switch (game.gameType) {
    case GameType.TIME:
      return formatTime(value);
    case GameType.POINTS:
      return formatQuantity(value, game.unit);
    case GameType.SCORE:
    default:
      return value.toString();
  }
}
