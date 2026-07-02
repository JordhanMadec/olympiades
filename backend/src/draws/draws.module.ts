import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from '../entities/game.entity';
import { Team } from '../entities/team.entity';
import { Match } from '../entities/match.entity';
import { MatchTeam } from '../entities/match-team.entity';
import { TeamMatchHistory } from '../entities/team-match-history.entity';
import { DrawsController } from './draws.controller';
import { DrawsService } from './draws.service';

@Module({
  imports: [TypeOrmModule.forFeature([Game, Team, Match, MatchTeam, TeamMatchHistory])],
  controllers: [DrawsController],
  providers: [DrawsService],
})
export class DrawsModule {}
