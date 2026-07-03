import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Team } from './teams/team.entity';
import { Game } from './games/game.entity';
import { Match } from './matches/match.entity';
import { MatchTeam } from './matches/match-team.entity';
import { TeamMatchHistory } from './database/team-match-history.entity';
import { TeamsModule } from './teams/teams.module';
import { GamesModule } from './games/games.module';
import { MatchesModule } from './matches/matches.module';
import { RankingsModule } from './rankings/rankings.module';
import { DrawsModule } from './draws/draws.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: process.env.DATABASE_TYPE === 'postgres' ? 'postgres' : 'sqlite',
      // PostgreSQL config
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME || 'olympiades.sqlite',
      // SQLite fallback (for local development)
      ...(process.env.DATABASE_TYPE !== 'postgres' && { 
        database: 'olympiades.sqlite' 
      }),
      entities: [Team, Game, Match, MatchTeam, TeamMatchHistory],
      synchronize: process.env.NODE_ENV !== 'production', // Disable in production
      logging: process.env.NODE_ENV === 'development',
      ssl: process.env.DATABASE_SSL === 'true' ? {
        rejectUnauthorized: false
      } : false,
    }),
    TeamsModule,
    GamesModule,
    MatchesModule,
    RankingsModule,
    DrawsModule,
  ],
})
export class AppModule {}
