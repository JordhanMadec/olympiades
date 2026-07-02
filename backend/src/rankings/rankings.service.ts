import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatchTeam } from '../matches/match-team.entity';
import { Match } from '../matches/match.entity';
import { Team } from '../teams/team.entity';
import { Game } from '../games/game.entity';
import { MatchStatus } from '../matches/match.enums';
import { RankingEntryDto } from './dto/ranking-entry.dto';
import { GameRankingDto } from './dto/game-ranking.dto';

@Injectable()
export class RankingsService {
  constructor(
    @InjectRepository(MatchTeam)
    private matchTeamsRepository: Repository<MatchTeam>,
    @InjectRepository(Match)
    private matchesRepository: Repository<Match>,
    @InjectRepository(Team)
    private teamsRepository: Repository<Team>,
    @InjectRepository(Game)
    private gamesRepository: Repository<Game>,
  ) {}

  async getGeneralRanking(): Promise<GameRankingDto> {
    // Get all teams
    const allTeams = await this.teamsRepository.find();

    // Get all teams with their total points from all completed matches
    const results = await this.matchTeamsRepository
      .createQueryBuilder('mt')
      .innerJoin('mt.match', 'match')
      .innerJoin('mt.team', 'team')
      .select('mt.teamId', 'teamId')
      .addSelect('team.name', 'teamName')
      .addSelect('team.color', 'teamColor')
      .addSelect('SUM(mt.points)', 'totalPoints')
      .addSelect('COUNT(DISTINCT match.id)', 'matchCount')
      .where('match.status = :status', { status: MatchStatus.COMPLETED })
      .groupBy('mt.teamId')
      .addGroupBy('team.name')
      .addGroupBy('team.color')
      .getRawMany();

    // Create a map for quick lookup of team stats
    const teamStatsMap = new Map(
      results.map((result) => [
        result.teamId,
        {
          totalPoints: parseFloat(result.totalPoints) || 0,
          matchCount: parseInt(result.matchCount) || 0,
        },
      ]),
    );

    // Build entries for all teams, including those with no matches
    const entries: RankingEntryDto[] = allTeams.map((team) => {
      const stats = teamStatsMap.get(team.id) || {
        totalPoints: 0,
        matchCount: 0,
      };
      return {
        teamId: team.id,
        teamName: team.name,
        teamColor: team.color,
        totalPoints: stats.totalPoints,
        matchCount: stats.matchCount,
        rank: 0, // Will be set below
      };
    });

    // Sort by totalPoints descending
    entries.sort((a, b) => b.totalPoints - a.totalPoints);

    // Add rank
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return {
      entries,
    };
  }

  async getRankingByGame(gameId: number): Promise<GameRankingDto> {
    // Verify game exists
    const game = await this.gamesRepository.findOne({ where: { id: gameId } });
    if (!game) {
      throw new Error(`Game with ID ${gameId} not found`);
    }

    // Get all teams
    const allTeams = await this.teamsRepository.find();

    // Get all teams with their total points for this specific game
    const results = await this.matchTeamsRepository
      .createQueryBuilder('mt')
      .innerJoin('mt.match', 'match')
      .innerJoin('mt.team', 'team')
      .select('mt.teamId', 'teamId')
      .addSelect('team.name', 'teamName')
      .addSelect('team.color', 'teamColor')
      .addSelect('SUM(mt.points)', 'totalPoints')
      .addSelect('COUNT(DISTINCT match.id)', 'matchCount')
      .where('match.gameId = :gameId', { gameId })
      .andWhere('match.status = :status', { status: MatchStatus.COMPLETED })
      .groupBy('mt.teamId')
      .addGroupBy('team.name')
      .addGroupBy('team.color')
      .getRawMany();

    // Create a map for quick lookup of team stats
    const teamStatsMap = new Map(
      results.map((result) => [
        result.teamId,
        {
          totalPoints: parseFloat(result.totalPoints) || 0,
          matchCount: parseInt(result.matchCount) || 0,
        },
      ]),
    );

    // Build entries for all teams, including those with no matches for this game
    const entries: RankingEntryDto[] = allTeams.map((team) => {
      const stats = teamStatsMap.get(team.id) || {
        totalPoints: 0,
        matchCount: 0,
      };
      return {
        teamId: team.id,
        teamName: team.name,
        teamColor: team.color,
        totalPoints: stats.totalPoints,
        matchCount: stats.matchCount,
        rank: 0, // Will be set below
      };
    });

    // Sort by totalPoints descending
    entries.sort((a, b) => b.totalPoints - a.totalPoints);

    // Add rank
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return {
      gameId: game.id,
      gameName: game.name,
      entries,
    };
  }

  async getAllGameRankings(): Promise<GameRankingDto[]> {
    const games = await this.gamesRepository.find({ order: { name: 'ASC' } });
    
    const rankings: GameRankingDto[] = [];
    for (const game of games) {
      const ranking = await this.getRankingByGame(game.id);
      rankings.push(ranking);
    }

    return rankings;
  }
}
