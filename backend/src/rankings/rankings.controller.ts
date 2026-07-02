import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { RankingsService } from './rankings.service';

@Controller('rankings')
export class RankingsController {
  constructor(private readonly rankingsService: RankingsService) {}

  @Get()
  getGlobalRanking() {
    return this.rankingsService.getGlobalRanking();
  }

  @Get('games')
  getAllGameRankings() {
    return this.rankingsService.getAllGameRankings();
  }

  @Get('games/:gameId')
  getGameRanking(@Param('gameId', ParseIntPipe) gameId: number) {
    return this.rankingsService.getGameRanking(gameId);
  }
}
