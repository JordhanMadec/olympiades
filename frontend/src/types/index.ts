export type GameType = 'TIME' | 'SCORE' | 'POINTS';
export type GameFormat = 'ROUND_ROBIN' | 'ELIMINATION';
export type MatchStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type ScoringDirection = 'ASC' | 'DESC';

export interface Team {
  id: number;
  name: string;
  color: string;
}

export interface Game {
  id: number;
  name: string;
  type: GameType;
  format: GameFormat;
  scoringDirection: ScoringDirection;
  description: string;
}

export interface MatchTeam {
  id: number;
  matchId: number;
  teamId: number;
  team: Team;
  rawScore: number | null;
  rank: number | null;
  points: number | null;
}

export interface Match {
  id: number;
  gameId: number;
  game: Game;
  status: MatchStatus;
  round: number;
  matchTeams: MatchTeam[];
}

export interface TeamRanking {
  team: Team;
  totalPoints: number;
  matchesPlayed: number;
  rank: number;
}

export interface GameRanking {
  game: Game;
  rankings: TeamRanking[];
}

export interface DrawMatch {
  teams: Team[];
  isBye?: boolean;
}

export interface DrawRound {
  round: number;
  matches: DrawMatch[];
}

export interface DrawResult {
  rounds: DrawRound[];
}
