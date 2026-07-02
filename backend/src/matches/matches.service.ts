import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './match.entity';
import { MatchTeam } from './match-team.entity';
import { Game } from '../games/game.entity';
import { Team } from '../teams/team.entity';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { UpdateScoresDto } from './dto/update-scores.dto';
import { MatchStatus } from './match.enums';
import { ScoringDirection } from '../games/game.enums';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private matchesRepository: Repository<Match>,
    @InjectRepository(MatchTeam)
    private matchTeamsRepository: Repository<MatchTeam>,
    @InjectRepository(Game)
    private gamesRepository: Repository<Game>,
    @InjectRepository(Team)
    private teamsRepository: Repository<Team>,
  ) {}

  async findAll(gameId?: number): Promise<Match[]> {
    const query = this.matchesRepository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.game', 'game')
      .leftJoinAndSelect('match.matchTeams', 'matchTeams')
      .leftJoinAndSelect('matchTeams.team', 'team')
      .orderBy('match.matchNumber', 'ASC');

    if (gameId) {
      query.where('match.gameId = :gameId', { gameId });
    }

    return query.getMany();
  }

  async findOne(id: number): Promise<Match> {
    const match = await this.matchesRepository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.game', 'game')
      .leftJoinAndSelect('match.matchTeams', 'matchTeams')
      .leftJoinAndSelect('matchTeams.team', 'team')
      .where('match.id = :id', { id })
      .getOne();

    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }
    return match;
  }

  async create(createMatchDto: CreateMatchDto): Promise<Match> {
    const { gameId, teamIds, ...matchData } = createMatchDto;

    // Verify game exists
    const game = await this.gamesRepository.findOne({ where: { id: gameId } });
    if (!game) {
      throw new NotFoundException(`Game with ID ${gameId} not found`);
    }

    // Verify all teams exist
    const teams = await this.teamsRepository.findByIds(teamIds);
    if (teams.length !== teamIds.length) {
      throw new NotFoundException('One or more teams not found');
    }

    // Create match
    const match = this.matchesRepository.create({
      ...matchData,
      gameId,
      status: MatchStatus.PENDING,
    });

    const savedMatch = await this.matchesRepository.save(match);

    // Create match teams
    const matchTeams = teamIds.map((teamId) =>
      this.matchTeamsRepository.create({
        matchId: savedMatch.id,
        teamId,
      }),
    );

    await this.matchTeamsRepository.save(matchTeams);

    return this.findOne(savedMatch.id);
  }

  async update(id: number, updateMatchDto: UpdateMatchDto): Promise<Match> {
    const match = await this.findOne(id);
    Object.assign(match, updateMatchDto);
    await this.matchesRepository.save(match);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const match = await this.findOne(id);
    await this.matchesRepository.remove(match);
  }

  async updateScores(id: number, updateScoresDto: UpdateScoresDto): Promise<Match> {
    const match = await this.findOne(id);
    const game = match.game;

    // Validate that all teams in the match are included
    const teamIds = updateScoresDto.scores.map((s) => s.teamId);
    const matchTeamIds = match.matchTeams.map((mt) => mt.teamId);
    
    for (const teamId of teamIds) {
      if (!matchTeamIds.includes(teamId)) {
        throw new BadRequestException(`Team ${teamId} is not part of this match`);
      }
    }

    // Calculate ranks based on raw scores and scoring direction
    const sortedScores = [...updateScoresDto.scores].sort((a, b) => {
      if (game.scoringDirection === ScoringDirection.ASC) {
        return a.rawScore - b.rawScore; // Lower is better (for TIME)
      } else {
        return b.rawScore - a.rawScore; // Higher is better (for SCORE/POINTS)
      }
    });

    // Assign ranks
    const rankedScores = sortedScores.map((score, index) => ({
      ...score,
      rank: index + 1,
    }));

    // Calculate olympic points based on rank
    const pointsMap = [10, 8, 6, 5, 4, 3, 2, 1];
    const scoresWithPoints = rankedScores.map((score) => ({
      ...score,
      points: pointsMap[score.rank - 1] || 0,
    }));

    // Update match teams
    for (const scoreData of scoresWithPoints) {
      const matchTeam = match.matchTeams.find((mt) => mt.teamId === scoreData.teamId);
      if (matchTeam) {
        matchTeam.rawScore = scoreData.rawScore;
        matchTeam.rank = scoreData.rank;
        matchTeam.points = scoreData.points;
        await this.matchTeamsRepository.save(matchTeam);
      }
    }

    // Mark match as completed
    match.status = MatchStatus.COMPLETED;
    await this.matchesRepository.save(match);

    return this.findOne(id);
  }
}
