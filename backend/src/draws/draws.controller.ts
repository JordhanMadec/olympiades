import { Controller, Get, Post, Delete, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { DrawsService } from './draws.service';
import { ConfrontationHistoryDto } from './dto/confrontation-history.dto';
import { GenerateRoundRobinDto } from './dto/generate-roundrobin.dto';
import { GenerateBracketDto } from './dto/generate-bracket.dto';
import { RoundRobinMatchDto } from './dto/round-robin-match.dto';
import { BracketMatchDto } from './dto/bracket-match.dto';

@Controller('draws')
export class DrawsController {
  constructor(private readonly drawsService: DrawsService) {}

  @Get('history')
  getConfrontationHistory(): Promise<ConfrontationHistoryDto[]> {
    return this.drawsService.getConfrontationHistory();
  }

  @Delete('history')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resetHistory(): Promise<void> {
    await this.drawsService.resetHistory();
  }

  @Post('generate-roundrobin')
  @HttpCode(HttpStatus.CREATED)
  generateRoundRobinDraw(@Body() dto: GenerateRoundRobinDto): Promise<RoundRobinMatchDto[]> {
    return this.drawsService.generateRoundRobinDraw(dto);
  }

  @Post('generate-bracket')
  @HttpCode(HttpStatus.CREATED)
  generateBracketDraw(@Body() dto: GenerateBracketDto): Promise<BracketMatchDto[]> {
    return this.drawsService.generateBracketDraw(dto);
  }
}

