import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamMatchHistory } from '../database/team-match-history.entity';
import { Team } from '../teams/team.entity';
import { Game } from '../games/game.entity';
import { Match } from '../matches/match.entity';
import { MatchTeam } from '../matches/match-team.entity';
import { DrawsController } from './draws.controller';
import { DrawsService } from './draws.service';

@Module({
  imports: [TypeOrmModule.forFeature([TeamMatchHistory, Team, Game, Match, MatchTeam])],
  controllers: [DrawsController],
  providers: [DrawsService],
  exports: [DrawsService],
})
export class DrawsModule {}
