// Enums
export enum GameType {
  TIME = 'TIME',
  SCORE = 'SCORE',
  POINTS = 'POINTS',
}

export enum GameFormat {
  ROUND_ROBIN = 'ROUND_ROBIN',
  ELIMINATION = 'ELIMINATION',
}

export enum ScoringDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum MatchStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

// Entities
export interface Team {
  id: number;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Game {
  id: number;
  name: string;
  description: string;
  rules: string;
  gameType: GameType;
  gameFormat: GameFormat;
  scoringDirection: ScoringDirection;
  teamsPerMatch: number;
  createdAt: string;
  updatedAt: string;
}

export interface Match {
  id: number;
  gameId: number;
  game?: Game;
  matchNumber: number;
  status: MatchStatus;
  round?: number;
  bracketPosition?: number;
  matchTeams: MatchTeam[];
  createdAt: string;
  updatedAt: string;
}

export interface MatchTeam {
  id: number;
  matchId: number;
  teamId: number;
  team?: Team;
  rawScore?: number;
  rank?: number;
  points?: number;
  isEliminated: boolean;
}

export interface TeamMatchHistory {
  team1Id: number;
  team1Name: string;
  team2Id: number;
  team2Name: string;
  matchCount: number;
}

export interface RankingEntry {
  teamId: number;
  teamName: string;
  teamColor: string;
  totalPoints: number;
  matchCount: number;
}

export interface GameRanking {
  gameId?: number;
  gameName?: string;
  entries: RankingEntry[];
}

export interface RoundRobinMatch {
  matchNumber: number;
  teamIds: number[];
  confrontationScore: number;
}

export interface BracketMatch {
  matchNumber: number;
  round: number;
  bracketPosition: number;
  teamIds: number[];
  isBye?: boolean;
}

// DTOs
export interface CreateTeamDto {
  name: string;
  color: string;
}

export interface UpdateTeamDto {
  name?: string;
  color?: string;
}

export interface CreateGameDto {
  name: string;
  description: string;
  rules: string;
  gameType: GameType;
  gameFormat: GameFormat;
  scoringDirection: ScoringDirection;
  teamsPerMatch: number;
}

export interface UpdateGameDto {
  name?: string;
  description?: string;
  rules?: string;
  gameType?: GameType;
  gameFormat?: GameFormat;
  scoringDirection?: ScoringDirection;
  teamsPerMatch?: number;
}

export interface CreateMatchDto {
  gameId: number;
  matchNumber: number;
  teamIds: number[];
  round?: number;
  bracketPosition?: number;
}

export interface UpdateMatchDto {
  matchNumber?: number;
  status?: MatchStatus;
  round?: number;
  bracketPosition?: number;
}

export interface UpdateScoresDto {
  scores: {
    teamId: number;
    rawScore: number;
  }[];
}

export interface GenerateRoundRobinDto {
  gameId: number;
  teamIds: number[];
  numberOfMatches: number;
  teamsPerMatch: number;
}

export interface GenerateBracketDto {
  gameId: number;
  teamIds: number[];
  useSeeding?: boolean;
}
