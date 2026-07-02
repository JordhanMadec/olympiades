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
import { ScoringDirection, GameFormat } from '../games/game.enums';

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

    // If this is an elimination bracket, advance winners
    if (game.gameFormat === GameFormat.ELIMINATION) {
      await this.advanceWinnerInBracket(match);
    }

    return this.findOne(id);
  }

  async removeAll(): Promise<void> {
    await this.matchTeamsRepository.delete({});
    await this.matchesRepository.delete({});
  }

  async generateAllMatches(): Promise<{ created: number }> {
    // Get all games and all teams
    const games = await this.gamesRepository.find();
    const teams = await this.teamsRepository.find();
    const teamIds = teams.map(t => t.id);

    if (teams.length === 0) {
      throw new BadRequestException('No teams found. Add teams first.');
    }

    let totalCreated = 0;

    for (const game of games) {
      if (game.gameFormat === GameFormat.ROUND_ROBIN) {
        totalCreated += await this.generateRoundRobinForGame(game, teamIds);
      } else if (game.gameFormat === GameFormat.ELIMINATION) {
        totalCreated += await this.generateBracketForGame(game, teamIds);
      }
    }

    return { created: totalCreated };
  }

  private async generateRoundRobinForGame(game: Game, teamIds: number[]): Promise<number> {
    const teamsPerMatch = game.teamsPerMatch || 2;
    
    // Allow teams to play alone if only 1 team available
    if (teamIds.length === 0) {
      return 0;
    }

    // Each team plays once: create one match with all teams (up to teamsPerMatch)
    const matchTeams = teamIds.slice(0, teamsPerMatch);

    const match = this.matchesRepository.create({
      gameId: game.id,
      matchNumber: 1,
      status: MatchStatus.PENDING,
    });

    const savedMatch = await this.matchesRepository.save(match);

    const matchTeamEntries = matchTeams.map((teamId) =>
      this.matchTeamsRepository.create({
        matchId: savedMatch.id,
        teamId,
      }),
    );

    await this.matchTeamsRepository.save(matchTeamEntries);
    return 1;
  }

  private async generateBracketForGame(game: Game, teamIds: number[]): Promise<number> {
    if (teamIds.length < 2) {
      return 0;
    }

    // Shuffle teams
    const shuffledTeams = [...teamIds].sort(() => Math.random() - 0.5);

    // Determine bracket size (next power of 2)
    const bracketSize = Math.pow(2, Math.ceil(Math.log2(shuffledTeams.length)));
    const numberOfByes = bracketSize - shuffledTeams.length;

    // Fill with nulls for byes
    const bracketTeams = [
      ...shuffledTeams,
      ...Array(numberOfByes).fill(null),
    ];

    const totalRounds = Math.log2(bracketSize);
    let matchNumber = 1;
    let created = 0;

    // Create first round matches only
    for (let i = 0; i < bracketSize / 2; i++) {
      const team1 = bracketTeams[i * 2];
      const team2 = bracketTeams[i * 2 + 1];

      const matchTeamIds: number[] = [];
      if (team1 !== null) matchTeamIds.push(team1);
      if (team2 !== null) matchTeamIds.push(team2);

      // Only create match if there's at least one team
      if (matchTeamIds.length > 0) {
        const match = this.matchesRepository.create({
          gameId: game.id,
          matchNumber: matchNumber++,
          round: totalRounds,
          bracketPosition: i,
          status: MatchStatus.PENDING,
        });

        const savedMatch = await this.matchesRepository.save(match);

        const matchTeamEntries = matchTeamIds.map((teamId) =>
          this.matchTeamsRepository.create({
            matchId: savedMatch.id,
            teamId,
          }),
        );

        await this.matchTeamsRepository.save(matchTeamEntries);
        created++;
      }
    }

    return created;
  }

  private async advanceWinnerInBracket(completedMatch: Match): Promise<void> {
    if (!completedMatch.round || !completedMatch.bracketPosition !== undefined) {
      return;
    }

    // Find winner (rank 1)
    const winner = completedMatch.matchTeams.find(mt => mt.rank === 1);
    if (!winner) {
      return;
    }

    // Calculate next round and position
    const nextRound = completedMatch.round - 1;
    if (nextRound < 1) {
      return; // This was the final
    }

    const nextPosition = Math.floor(completedMatch.bracketPosition / 2);

    // Find or create next match
    let nextMatch = await this.matchesRepository.findOne({
      where: {
        gameId: completedMatch.gameId,
        round: nextRound,
        bracketPosition: nextPosition,
      },
      relations: ['matchTeams'],
    });

    if (!nextMatch) {
      // Create next round match
      const maxMatchNumber = await this.matchesRepository
        .createQueryBuilder('match')
        .where('match.gameId = :gameId', { gameId: completedMatch.gameId })
        .select('MAX(match.matchNumber)', 'max')
        .getRawOne();

      nextMatch = this.matchesRepository.create({
        gameId: completedMatch.gameId,
        matchNumber: (maxMatchNumber?.max || 0) + 1,
        round: nextRound,
        bracketPosition: nextPosition,
        status: MatchStatus.PENDING,
      });

      nextMatch = await this.matchesRepository.save(nextMatch);
    }

    // Add winner to next match
    const existingTeam = nextMatch.matchTeams?.find(mt => mt.teamId === winner.teamId);
    if (!existingTeam) {
      const newMatchTeam = this.matchTeamsRepository.create({
        matchId: nextMatch.id,
        teamId: winner.teamId,
      });
      await this.matchTeamsRepository.save(newMatchTeam);
    }
  }
}
