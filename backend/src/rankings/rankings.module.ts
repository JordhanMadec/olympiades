import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchTeam } from '../entities/match-team.entity';
import { Team } from '../entities/team.entity';
import { Game } from '../entities/game.entity';
import { RankingsController } from './rankings.controller';
import { RankingsService } from './rankings.service';

@Module({
  imports: [TypeOrmModule.forFeature([MatchTeam, Team, Game])],
  controllers: [RankingsController],
  providers: [RankingsService],
})
export class RankingsModule {}
