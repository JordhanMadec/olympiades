import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, HttpCode, HttpStatus, Query, ParseIntPipe as ParseInt } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { UpdateScoresDto } from './dto/update-scores.dto';
import { Match } from './match.entity';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  findAll(@Query('gameId') gameId?: string): Promise<Match[]> {
    return this.matchesService.findAll(gameId ? parseInt(gameId, 10) : undefined);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Match> {
    return this.matchesService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createMatchDto: CreateMatchDto): Promise<Match> {
    return this.matchesService.create(createMatchDto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMatchDto: UpdateMatchDto,
  ): Promise<Match> {
    return this.matchesService.update(id, updateMatchDto);
  }

  @Put(':id/scores')
  updateScores(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateScoresDto: UpdateScoresDto,
  ): Promise<Match> {
    return this.matchesService.updateScores(id, updateScoresDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.matchesService.remove(id);
  }
}
