import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { RankingsService } from './rankings.service';
import { GameRankingDto } from './dto/game-ranking.dto';

@Controller('rankings')
export class RankingsController {
  constructor(private readonly rankingsService: RankingsService) {}

  @Get('general')
  getGeneralRanking(): Promise<GameRankingDto> {
    return this.rankingsService.getGeneralRanking();
  }

  @Get('game/:gameId')
  getRankingByGame(@Param('gameId', ParseIntPipe) gameId: number): Promise<GameRankingDto> {
    return this.rankingsService.getRankingByGame(gameId);
  }

  @Get('games')
  getAllGameRankings(): Promise<GameRankingDto[]> {
    return this.rankingsService.getAllGameRankings();
  }
}
