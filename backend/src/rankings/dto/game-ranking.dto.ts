import { RankingEntryDto } from './ranking-entry.dto';

export class GameRankingDto {
  gameId?: number;
  gameName?: string;
  entries: RankingEntryDto[];
}
