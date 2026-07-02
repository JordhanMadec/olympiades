import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatchTeam } from '../entities/match-team.entity';
import { Team } from '../entities/team.entity';
import { Game } from '../entities/game.entity';
import { MatchStatus } from '../entities/match-status.enum';

export interface TeamRanking {
  team: Team;
  totalPoints: number;
  matchesPlayed: number;
  rank: number;
}

export interface GameRanking {
  game: Game;
  rankings: TeamRanking[];
}

@Injectable()
export class RankingsService {
  constructor(
    @InjectRepository(MatchTeam)
    private readonly matchTeamRepo: Repository<MatchTeam>,
    @InjectRepository(Team)
    private readonly teamRepo: Repository<Team>,
    @InjectRepository(Game)
    private readonly gameRepo: Repository<Game>,
  ) {}

  async getGlobalRanking(): Promise<TeamRanking[]> {
    const teams = await this.teamRepo.find();

    const result: TeamRanking[] = [];

    for (const team of teams) {
      const matchTeams = await this.matchTeamRepo.find({
        where: { teamId: team.id },
        relations: { match: true },
      });

      const completedMatchTeams = matchTeams.filter(
        (mt) => mt.match?.status === MatchStatus.COMPLETED && mt.points !== null,
      );

      const totalPoints = completedMatchTeams.reduce((sum, mt) => sum + (mt.points ?? 0), 0);
      const matchesPlayed = completedMatchTeams.length;

      result.push({ team, totalPoints, matchesPlayed, rank: 0 });
    }

    result.sort((a, b) => b.totalPoints - a.totalPoints || a.team.name.localeCompare(b.team.name));
    result.forEach((r, idx) => (r.rank = idx + 1));

    return result;
  }

  async getGameRanking(gameId: number): Promise<GameRanking> {
    const game = await this.gameRepo.findOne({ where: { id: gameId } });
    if (!game) return { game: null as any, rankings: [] };

    const teams = await this.teamRepo.find();

    const result: TeamRanking[] = [];

    for (const team of teams) {
      const matchTeams = await this.matchTeamRepo.find({
        where: { teamId: team.id },
        relations: { match: true },
      });

      const completedMatchTeams = matchTeams.filter(
        (mt) =>
          mt.match?.status === MatchStatus.COMPLETED &&
          mt.match?.gameId === gameId &&
          mt.points !== null,
      );

      const totalPoints = completedMatchTeams.reduce((sum, mt) => sum + (mt.points ?? 0), 0);
      const matchesPlayed = completedMatchTeams.length;

      if (matchesPlayed > 0) {
        result.push({ team, totalPoints, matchesPlayed, rank: 0 });
      }
    }

    result.sort((a, b) => b.totalPoints - a.totalPoints || a.team.name.localeCompare(b.team.name));
    result.forEach((r, idx) => (r.rank = idx + 1));

    return { game, rankings: result };
  }

  async getAllGameRankings(): Promise<GameRanking[]> {
    const games = await this.gameRepo.find();
    const rankings: GameRanking[] = [];
    for (const game of games) {
      rankings.push(await this.getGameRanking(game.id));
    }
    return rankings;
  }
}
