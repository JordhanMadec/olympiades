import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamMatchHistory } from '../database/team-match-history.entity';
import { Team } from '../teams/team.entity';
import { Game } from '../games/game.entity';
import { Match } from '../matches/match.entity';
import { MatchTeam } from '../matches/match-team.entity';
import { ConfrontationHistoryDto } from './dto/confrontation-history.dto';
import { GenerateRoundRobinDto } from './dto/generate-roundrobin.dto';
import { GenerateBracketDto } from './dto/generate-bracket.dto';
import { RoundRobinMatchDto } from './dto/round-robin-match.dto';
import { BracketMatchDto } from './dto/bracket-match.dto';
import { GameFormat } from '../games/game.enums';

@Injectable()
export class DrawsService {
  constructor(
    @InjectRepository(TeamMatchHistory)
    private teamMatchHistoryRepository: Repository<TeamMatchHistory>,
    @InjectRepository(Team)
    private teamsRepository: Repository<Team>,
    @InjectRepository(Game)
    private gamesRepository: Repository<Game>,
    @InjectRepository(Match)
    private matchesRepository: Repository<Match>,
    @InjectRepository(MatchTeam)
    private matchTeamsRepository: Repository<MatchTeam>,
  ) {}

  async getConfrontationHistory(): Promise<ConfrontationHistoryDto[]> {
    const histories = await this.teamMatchHistoryRepository.find();
    const teams = await this.teamsRepository.find();

    const teamMap = new Map(teams.map((team) => [team.id, team]));

    return histories.map((history) => ({
      team1Id: history.team1Id,
      team1Name: teamMap.get(history.team1Id)?.name || 'Unknown',
      team2Id: history.team2Id,
      team2Name: teamMap.get(history.team2Id)?.name || 'Unknown',
      matchCount: history.matchCount,
    }));
  }

  async updateConfrontationHistory(team1Id: number, team2Id: number): Promise<void> {
    // Ensure team1Id < team2Id for consistency
    const [minId, maxId] = team1Id < team2Id ? [team1Id, team2Id] : [team2Id, team1Id];

    const existing = await this.teamMatchHistoryRepository.findOne({
      where: { team1Id: minId, team2Id: maxId },
    });

    if (existing) {
      existing.matchCount += 1;
      await this.teamMatchHistoryRepository.save(existing);
    } else {
      const newHistory = this.teamMatchHistoryRepository.create({
        team1Id: minId,
        team2Id: maxId,
        matchCount: 1,
      });
      await this.teamMatchHistoryRepository.save(newHistory);
    }
  }

  async getConfrontationCount(team1Id: number, team2Id: number): Promise<number> {
    const [minId, maxId] = team1Id < team2Id ? [team1Id, team2Id] : [team2Id, team1Id];

    const history = await this.teamMatchHistoryRepository.findOne({
      where: { team1Id: minId, team2Id: maxId },
    });

    return history?.matchCount || 0;
  }

  async resetHistory(): Promise<void> {
    await this.teamMatchHistoryRepository.clear();
  }

  // Round-Robin Draw Algorithm
  async generateRoundRobinDraw(dto: GenerateRoundRobinDto): Promise<RoundRobinMatchDto[]> {
    const { gameId, teamIds, numberOfMatches, teamsPerMatch } = dto;

    // Verify game exists and is round-robin format
    const game = await this.gamesRepository.findOne({ where: { id: gameId } });
    if (!game) {
      throw new NotFoundException(`Game with ID ${gameId} not found`);
    }
    if (game.gameFormat !== GameFormat.ROUND_ROBIN) {
      throw new BadRequestException('This game is not configured for round-robin format');
    }

    // Verify all teams exist
    const teams = await this.teamsRepository.findByIds(teamIds);
    if (teams.length !== teamIds.length) {
      throw new NotFoundException('One or more teams not found');
    }

    if (teamIds.length < teamsPerMatch) {
      throw new BadRequestException(
        `Not enough teams. Need at least ${teamsPerMatch} teams.`,
      );
    }

    const matches: RoundRobinMatchDto[] = [];

    for (let i = 0; i < numberOfMatches; i++) {
      const matchTeams = await this.selectOptimalTeams(teamIds, teamsPerMatch);
      const confrontationScore = await this.calculateConfrontationScore(matchTeams);

      matches.push({
        matchNumber: i + 1,
        teamIds: matchTeams,
        confrontationScore,
      });

      // Update history for this match
      for (let j = 0; j < matchTeams.length; j++) {
        for (let k = j + 1; k < matchTeams.length; k++) {
          await this.updateConfrontationHistory(matchTeams[j], matchTeams[k]);
        }
      }
    }

    return matches;
  }

  // Select teams minimizing confrontation repeats
  private async selectOptimalTeams(
    availableTeamIds: number[],
    count: number,
  ): Promise<number[]> {
    if (availableTeamIds.length === count) {
      return availableTeamIds;
    }

    let bestCombination: number[] = [];
    let bestScore = Infinity;

    // Generate random combinations and pick the best
    const attempts = Math.min(100, this.getCombinationsCount(availableTeamIds.length, count));

    for (let attempt = 0; attempt < attempts; attempt++) {
      const combination = this.getRandomCombination(availableTeamIds, count);
      const score = await this.calculateConfrontationScore(combination);

      if (score < bestScore) {
        bestScore = score;
        bestCombination = combination;
      }
    }

    return bestCombination;
  }

  private async calculateConfrontationScore(teamIds: number[]): Promise<number> {
    let score = 0;
    for (let i = 0; i < teamIds.length; i++) {
      for (let j = i + 1; j < teamIds.length; j++) {
        score += await this.getConfrontationCount(teamIds[i], teamIds[j]);
      }
    }
    return score;
  }

  private getRandomCombination(array: number[], count: number): number[] {
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  private getCombinationsCount(n: number, r: number): number {
    if (r > n) return 0;
    let result = 1;
    for (let i = 1; i <= r; i++) {
      result = (result * (n - i + 1)) / i;
    }
    return Math.floor(result);
  }

  // Bracket Generation Algorithm
  async generateBracketDraw(dto: GenerateBracketDto): Promise<BracketMatchDto[]> {
    const { gameId, teamIds, useSeeding } = dto;

    // Verify game exists and is elimination format
    const game = await this.gamesRepository.findOne({ where: { id: gameId } });
    if (!game) {
      throw new NotFoundException(`Game with ID ${gameId} not found`);
    }
    if (game.gameFormat !== GameFormat.ELIMINATION) {
      throw new BadRequestException('This game is not configured for elimination format');
    }

    // Verify all teams exist
    const teams = await this.teamsRepository.findByIds(teamIds);
    if (teams.length !== teamIds.length) {
      throw new NotFoundException('One or more teams not found');
    }

    // Determine bracket size (next power of 2)
    const bracketSize = Math.pow(2, Math.ceil(Math.log2(teamIds.length)));
    const numberOfByes = bracketSize - teamIds.length;

    // Arrange teams (with optional seeding)
    let orderedTeamIds: number[];
    if (useSeeding) {
      // TODO: Get teams ordered by general ranking
      // For now, use the order provided
      orderedTeamIds = [...teamIds];
    } else {
      // Random shuffle
      orderedTeamIds = [...teamIds].sort(() => Math.random() - 0.5);
    }

    // Fill with nulls for byes
    const bracketTeams = [
      ...orderedTeamIds,
      ...Array(numberOfByes).fill(null),
    ];

    // Generate bracket matches
    const matches: BracketMatchDto[] = [];
    let matchNumber = 1;
    const totalRounds = Math.log2(bracketSize);

    // First round
    for (let i = 0; i < bracketSize / 2; i++) {
      const team1 = bracketTeams[i * 2];
      const team2 = bracketTeams[i * 2 + 1];

      const matchTeamIds: number[] = [];
      if (team1 !== null) matchTeamIds.push(team1);
      if (team2 !== null) matchTeamIds.push(team2);

      const isBye = matchTeamIds.length < 2;

      matches.push({
        matchNumber: matchNumber++,
        round: totalRounds,
        bracketPosition: i,
        teamIds: matchTeamIds,
        isBye,
      });
    }

    // Subsequent rounds (empty matches to be filled as bracket progresses)
    for (let round = totalRounds - 1; round >= 1; round--) {
      const matchesInRound = Math.pow(2, round - 1);
      for (let i = 0; i < matchesInRound; i++) {
        matches.push({
          matchNumber: matchNumber++,
          round,
          bracketPosition: i,
          teamIds: [],
        });
      }
    }

    return matches;
  }
}
