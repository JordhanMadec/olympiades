import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Team } from './entities/team.entity';
import { Game } from './entities/game.entity';
import { Match } from './entities/match.entity';
import { MatchTeam } from './entities/match-team.entity';
import { TeamMatchHistory } from './entities/team-match-history.entity';
import { TeamsModule } from './teams/teams.module';
import { GamesModule } from './games/games.module';
import { MatchesModule } from './matches/matches.module';
import { RankingsModule } from './rankings/rankings.module';
import { DrawsModule } from './draws/draws.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env.DATABASE_PATH ?? 'olympiades.db',
      entities: [Team, Game, Match, MatchTeam, TeamMatchHistory],
      synchronize: true,
    }),
    TeamsModule,
    GamesModule,
    MatchesModule,
    RankingsModule,
    DrawsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
