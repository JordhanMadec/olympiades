import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from '../entities/match.entity';
import { MatchTeam } from '../entities/match-team.entity';
import { Game } from '../entities/game.entity';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { SubmitScoresDto } from './dto/submit-scores.dto';
import { MatchStatus } from '../entities/match-status.enum';

/** Olympic points mapping: rank → points */
const OLYMPIC_POINTS: Record<number, number> = {
  1: 10,
  2: 8,
  3: 6,
  4: 5,
  5: 4,
  6: 3,
  7: 2,
  8: 1,
};

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private readonly matchRepo: Repository<Match>,
    @InjectRepository(MatchTeam)
    private readonly matchTeamRepo: Repository<MatchTeam>,
    @InjectRepository(Game)
    private readonly gameRepo: Repository<Game>,
  ) {}

  findAll(): Promise<Match[]> {
    return this.matchRepo.find({
      relations: { matchTeams: { team: true }, game: true },
      order: { round: 'ASC', id: 'ASC' },
    });
  }

  findByGame(gameId: number): Promise<Match[]> {
    return this.matchRepo.find({
      where: { gameId },
      relations: { matchTeams: { team: true }, game: true },
      order: { round: 'ASC', id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Match> {
    const match = await this.matchRepo.findOne({
      where: { id },
      relations: { matchTeams: { team: true }, game: true },
    });
    if (!match) throw new NotFoundException(`Match #${id} not found`);
    return match;
  }

  async create(dto: CreateMatchDto): Promise<Match> {
    const game = await this.gameRepo.findOne({ where: { id: dto.gameId } });
    if (!game) throw new NotFoundException(`Game #${dto.gameId} not found`);

    const match = this.matchRepo.create({
      gameId: dto.gameId,
      status: dto.status ?? MatchStatus.PENDING,
      round: dto.round ?? 1,
    });
    const savedMatch = await this.matchRepo.save(match);

    for (const t of dto.teams) {
      const mt = this.matchTeamRepo.create({
        matchId: savedMatch.id,
        teamId: t.teamId,
        rawScore: null,
        rank: null,
        points: null,
      });
      await this.matchTeamRepo.save(mt);
    }

    return this.findOne(savedMatch.id);
  }

  async update(id: number, dto: UpdateMatchDto): Promise<Match> {
    const match = await this.findOne(id);
    if (dto.status !== undefined) match.status = dto.status;
    if (dto.round !== undefined) match.round = dto.round;
    await this.matchRepo.save(match);
    return this.findOne(id);
  }

  async submitScores(matchId: number, dto: SubmitScoresDto): Promise<Match> {
    const match = await this.findOne(matchId);
    const game = await this.gameRepo.findOne({ where: { id: match.gameId } });
    if (!game) throw new NotFoundException(`Game not found`);

    // Update raw scores
    for (const scoreEntry of dto.scores) {
      const mt = match.matchTeams.find((mt) => mt.teamId === scoreEntry.teamId);
      if (!mt) throw new BadRequestException(`Team #${scoreEntry.teamId} not in match #${matchId}`);
      mt.rawScore = scoreEntry.rawScore;
    }

    // Calculate ranks and olympic points
    const teamsWithScores = match.matchTeams.filter((mt) => mt.rawScore !== null);

    if (teamsWithScores.length > 0) {
      // Sort: ASC = lowest is best (time), DESC = highest is best (score/points)
      const sorted = [...teamsWithScores].sort((a, b) =>
        game.scoringDirection === 'ASC'
          ? (a.rawScore ?? 0) - (b.rawScore ?? 0)
          : (b.rawScore ?? 0) - (a.rawScore ?? 0),
      );

      sorted.forEach((mt, idx) => {
        mt.rank = idx + 1;
        mt.points = OLYMPIC_POINTS[idx + 1] ?? 0;
      });
    }

    for (const mt of match.matchTeams) {
      await this.matchTeamRepo.save(mt);
    }

    // Mark as completed if all teams have scores
    const allScored = match.matchTeams.every((mt) => mt.rawScore !== null);
    if (allScored) {
      match.status = MatchStatus.COMPLETED;
      await this.matchRepo.save(match);
    }

    return this.findOne(matchId);
  }

  async remove(id: number): Promise<void> {
    const match = await this.findOne(id);
    await this.matchRepo.remove(match);
  }
}
