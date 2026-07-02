import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchTeam } from '../matches/match-team.entity';
import { Match } from '../matches/match.entity';
import { Team } from '../teams/team.entity';
import { Game } from '../games/game.entity';
import { RankingsController } from './rankings.controller';
import { RankingsService } from './rankings.service';

@Module({
  imports: [TypeOrmModule.forFeature([MatchTeam, Match, Team, Game])],
  controllers: [RankingsController],
  providers: [RankingsService],
  exports: [RankingsService],
})
export class RankingsModule {}
