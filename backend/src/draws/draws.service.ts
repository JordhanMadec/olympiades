import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '../entities/game.entity';
import { Team } from '../entities/team.entity';
import { Match } from '../entities/match.entity';
import { MatchTeam } from '../entities/match-team.entity';
import { TeamMatchHistory } from '../entities/team-match-history.entity';
import { GameFormat } from '../entities/enums';
import { MatchStatus } from '../entities/match-status.enum';

export interface DrawResult {
  rounds: Array<{
    round: number;
    matches: Array<{
      teams: Team[];
      isBye?: boolean;
    }>;
  }>;
}

@Injectable()
export class DrawsService {
  constructor(
    @InjectRepository(Game)
    private readonly gameRepo: Repository<Game>,
    @InjectRepository(Team)
    private readonly teamRepo: Repository<Team>,
    @InjectRepository(Match)
    private readonly matchRepo: Repository<Match>,
    @InjectRepository(MatchTeam)
    private readonly matchTeamRepo: Repository<MatchTeam>,
    @InjectRepository(TeamMatchHistory)
    private readonly historyRepo: Repository<TeamMatchHistory>,
  ) {}

  async generateDraw(gameId: number): Promise<DrawResult> {
    const game = await this.gameRepo.findOne({ where: { id: gameId } });
    if (!game) throw new NotFoundException(`Game #${gameId} not found`);

    const teams = await this.teamRepo.find();
    if (teams.length < 2) throw new BadRequestException('At least 2 teams are required');

    if (game.format === GameFormat.ROUND_ROBIN) {
      return this.generateRoundRobin(game, teams);
    } else {
      return this.generateElimination(game, teams);
    }
  }

  async createMatchesFromDraw(gameId: number): Promise<Match[]> {
    const game = await this.gameRepo.findOne({ where: { id: gameId } });
    if (!game) throw new NotFoundException(`Game #${gameId} not found`);

    const teams = await this.teamRepo.find();
    if (teams.length < 2) throw new BadRequestException('At least 2 teams are required');

    // Clear existing pending matches and history for this game
    const existingMatches = await this.matchRepo.find({ where: { gameId } });
    const pendingMatches = existingMatches.filter((m) => m.status === MatchStatus.PENDING);
    for (const m of pendingMatches) {
      await this.matchRepo.remove(m);
    }
    await this.historyRepo.delete({ gameId });

    let drawResult: DrawResult;
    if (game.format === GameFormat.ROUND_ROBIN) {
      drawResult = await this.generateRoundRobin(game, teams);
    } else {
      drawResult = await this.generateElimination(game, teams);
    }

    const createdMatches: Match[] = [];

    for (const roundData of drawResult.rounds) {
      for (const matchData of roundData.matches) {
        if (matchData.isBye) continue;

        const match = this.matchRepo.create({
          gameId,
          status: MatchStatus.PENDING,
          round: roundData.round,
        });
        const savedMatch = await this.matchRepo.save(match);

        for (const team of matchData.teams) {
          const mt = this.matchTeamRepo.create({
            matchId: savedMatch.id,
            teamId: team.id,
          });
          await this.matchTeamRepo.save(mt);

          // Record history for round-robin
          if (game.format === GameFormat.ROUND_ROBIN && matchData.teams.length === 2) {
            const history = this.historyRepo.create({
              team1Id: matchData.teams[0].id,
              team2Id: matchData.teams[1].id,
              gameId,
            });
            await this.historyRepo.save(history);
          }
        }

        createdMatches.push(await this.matchRepo.findOne({
          where: { id: savedMatch.id },
          relations: { matchTeams: { team: true }, game: true },
        }) as Match);
      }
    }

    return createdMatches;
  }

  private async generateRoundRobin(game: Game, teams: Team[]): Promise<DrawResult> {
    const history = await this.historyRepo.find({ where: { gameId: game.id } });
    const confrontationCount = new Map<string, number>();

    for (const h of history) {
      const key = `${Math.min(h.team1Id, h.team2Id)}-${Math.max(h.team1Id, h.team2Id)}`;
      confrontationCount.set(key, (confrontationCount.get(key) ?? 0) + 1);
    }

    // Generate all possible pairs
    const allPairs: [Team, Team][] = [];
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        allPairs.push([teams[i], teams[j]]);
      }
    }

    // For each match slot, find the pair that minimizes confrontations
    const matchesPerRound = Math.floor(teams.length / 2);
    const totalRounds = teams.length % 2 === 0 ? teams.length - 1 : teams.length;
    const rounds: DrawResult['rounds'] = [];

    const usedPairs = new Set<string>();

    for (let round = 1; round <= totalRounds; round++) {
      const roundMatches: DrawResult['rounds'][0]['matches'] = [];
      const usedTeamsInRound = new Set<number>();

      // Greedy assignment: for each slot, pick best available pair
      for (let slot = 0; slot < matchesPerRound; slot++) {
        let bestPair: [Team, Team] | null = null;
        let bestScore = Infinity;

        // Try up to 100 combinations
        const candidates = allPairs
          .filter(([a, b]) => {
            const pairKey = `${Math.min(a.id, b.id)}-${Math.max(a.id, b.id)}-${round}`;
            return (
              !usedTeamsInRound.has(a.id) &&
              !usedTeamsInRound.has(b.id) &&
              !usedPairs.has(pairKey)
            );
          })
          .slice(0, 100);

        for (const [a, b] of candidates) {
          const key = `${Math.min(a.id, b.id)}-${Math.max(a.id, b.id)}`;
          const score = confrontationCount.get(key) ?? 0;
          if (score < bestScore) {
            bestScore = score;
            bestPair = [a, b];
          }
        }

        if (bestPair) {
          const [a, b] = bestPair;
          const pairKey = `${Math.min(a.id, b.id)}-${Math.max(a.id, b.id)}-${round}`;
          usedPairs.add(pairKey);
          usedTeamsInRound.add(a.id);
          usedTeamsInRound.add(b.id);

          const confrontKey = `${Math.min(a.id, b.id)}-${Math.max(a.id, b.id)}`;
          confrontationCount.set(confrontKey, (confrontationCount.get(confrontKey) ?? 0) + 1);

          roundMatches.push({ teams: [a, b] });
        }
      }

      // Handle bye if odd number of teams
      if (teams.length % 2 !== 0) {
        const byeTeam = teams.find((t) => !usedTeamsInRound.has(t.id));
        if (byeTeam) {
          roundMatches.push({ teams: [byeTeam], isBye: true });
        }
      }

      rounds.push({ round, matches: roundMatches });
    }

    return { rounds };
  }

  private generateElimination(game: Game, teams: Team[]): DrawResult {
    // Find next power of 2
    const bracketSize = Math.pow(2, Math.ceil(Math.log2(teams.length)));
    const byeCount = bracketSize - teams.length;

    // Shuffle teams for seeding
    const shuffled = [...teams].sort(() => Math.random() - 0.5);

    // Fill byes
    const bracket: (Team | null)[] = [...shuffled];
    for (let i = 0; i < byeCount; i++) {
      bracket.push(null);
    }

    const rounds: DrawResult['rounds'] = [];
    let currentRound = bracket;
    let roundNumber = 1;

    while (currentRound.length >= 2) {
      const matches: DrawResult['rounds'][0]['matches'] = [];

      for (let i = 0; i < currentRound.length; i += 2) {
        const teamA = currentRound[i];
        const teamB = currentRound[i + 1];

        if (teamA === null && teamB === null) {
          // Both byes - skip
        } else if (teamA === null) {
          matches.push({ teams: [teamB as Team], isBye: true });
        } else if (teamB === null) {
          matches.push({ teams: [teamA], isBye: true });
        } else {
          matches.push({ teams: [teamA, teamB] });
        }
      }

      rounds.push({ round: roundNumber, matches });
      roundNumber++;

      // Next round has half the participants (placeholders)
      const nextRoundSize = currentRound.length / 2;
      currentRound = new Array(nextRoundSize).fill(null);
    }

    return { rounds };
  }
}
