import { Controller, Get, Post, Param, ParseIntPipe } from '@nestjs/common';
import { DrawsService } from './draws.service';

@Controller('draws')
export class DrawsController {
  constructor(private readonly drawsService: DrawsService) {}

  @Get(':gameId/preview')
  previewDraw(@Param('gameId', ParseIntPipe) gameId: number) {
    return this.drawsService.generateDraw(gameId);
  }

  @Post(':gameId/generate')
  generateMatches(@Param('gameId', ParseIntPipe) gameId: number) {
    return this.drawsService.createMatchesFromDraw(gameId);
  }
}
