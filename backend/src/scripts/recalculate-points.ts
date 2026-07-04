import { DataSource } from 'typeorm';
import { Match } from '../matches/match.entity';
import { MatchTeam } from '../matches/match-team.entity';
import { Game } from '../games/game.entity';
import { GameFormat, GameType, ScoringDirection } from '../games/game.enums';
import { Team } from '../teams/team.entity';
import { MatchStatus } from '../matches/match.enums';

// Detect database type
const usePostgres = process.env.DATABASE_TYPE === 'postgres' && process.env.DATABASE_HOST;
const databaseType = usePostgres ? 'postgres' : 'sqlite';

console.log(`📍 Database Type: ${databaseType.toUpperCase()}`);
if (usePostgres) {
  console.log(`🌐 Database Host: ${process.env.DATABASE_HOST}`);
} else {
  console.log(`📁 Database File: olympiades.sqlite`);
}

// Create appropriate DataSource
const AppDataSource = new DataSource(
  usePostgres
    ? {
        type: 'postgres',
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT || '5432'),
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
        entities: [Match, MatchTeam, Game, Team],
        synchronize: false,
      }
    : {
        type: 'sqlite',
        database: 'olympiades.sqlite',
        entities: [Match, MatchTeam, Game, Team],
        synchronize: false,
      }
);

/**
 * Calculate points for a team based on their rank and game settings
 */
function calculatePoints(
  rank: number,
  game: Game,
  totalTeams: number
): number {
  // Check game format first (not game type!)
  if (game.gameFormat === GameFormat.ROUND_ROBIN) {
    // Round Robin: ALWAYS use Olympic system for all types (TIME, SCORE, POINTS)
    // This ensures fair ranking where everyone participates and all performances count
    const olympicPoints = [10, 8, 6, 5, 4, 3, 2, 1];
    return olympicPoints[rank - 1] || 0;
  } else {
    // Elimination: Depends on game type
    if (game.gameType === GameType.SCORE) {
      // SCORE type in elimination: Winner takes all
      return rank === 1 ? (game.winPoints || 10) : 0;
    } else {
      // Other types in elimination: Use Olympic system
      const olympicPoints = [10, 8, 6, 5, 4, 3, 2, 1];
      return olympicPoints[rank - 1] || 0;
    }
  }
}

/**
 * Recalculate points for all completed matches
 */
async function recalculatePoints() {
  console.log('\n🚀 Starting match points recalculation...\n');

  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established\n');

    const gameRepository = AppDataSource.getRepository(Game);
    const matchRepository = AppDataSource.getRepository(Match);
    const matchTeamRepository = AppDataSource.getRepository(MatchTeam);

    // Get all games
    const games = await gameRepository.find();
    
    console.log(`📊 Found ${games.length} games\n`);

    let totalGamesProcessed = 0;
    let totalTeamsUpdated = 0;
    const changes: any[] = [];

    // Process each game
    for (const game of games) {
      // Get all completed matches for this game
      const completedMatches = await matchRepository.find({
        where: { gameId: game.id, status: MatchStatus.COMPLETED },
        relations: ['matchTeams', 'matchTeams.team'],
        order: { id: 'ASC' },
      });

      if (completedMatches.length === 0) continue;

      const gameChanges: any = {
        gameId: game.id,
        gameName: game.name,
        gameFormat: game.gameFormat,
        gameType: game.gameType,
        matchesCount: completedMatches.length,
        teams: [],
      };

      if (game.gameFormat === GameFormat.ROUND_ROBIN) {
        // ROUND ROBIN: Calculate points based on GLOBAL ranking
        const allPerformances: Array<{
          matchTeamId: number;
          teamId: number;
          teamName: string;
          rawScore: number;
          currentPoints: number;
        }> = [];

        // Collect all performances across all matches
        for (const match of completedMatches) {
          for (const matchTeam of match.matchTeams) {
            if (matchTeam.rawScore !== null && matchTeam.rawScore !== undefined) {
              allPerformances.push({
                matchTeamId: matchTeam.id,
                teamId: matchTeam.teamId,
                teamName: matchTeam.team.name,
                rawScore: matchTeam.rawScore,
                currentPoints: matchTeam.points,
              });
            }
          }
        }

        if (allPerformances.length > 0) {
          // Sort globally based on scoring direction
          const sortedPerformances = allPerformances.sort((a, b) => {
            if (game.scoringDirection === 'ASC') {
              return a.rawScore - b.rawScore; // Lower is better (TIME)
            } else {
              return b.rawScore - a.rawScore; // Higher is better (SCORE/POINTS)
            }
          });

          // Assign global ranks and points
          const pointsMap = [10, 8, 6, 5, 4, 3, 2, 1];
          for (let i = 0; i < sortedPerformances.length; i++) {
            const perf = sortedPerformances[i];
            const globalRank = i + 1;
            const newPoints = pointsMap[i] || 0;

            gameChanges.teams.push({
              teamName: perf.teamName,
              globalRank,
              rawScore: perf.rawScore,
              currentPoints: perf.currentPoints,
              calculatedPoints: newPoints,
              needsUpdate: perf.currentPoints !== newPoints,
            });

            if (perf.currentPoints !== newPoints) {
              totalTeamsUpdated++;
              await matchTeamRepository.update(
                { id: perf.matchTeamId },
                { points: newPoints }
              );
            }
          }
          totalGamesProcessed++;
        }
      } else {
        // ELIMINATION: Points are match-by-match
        for (const match of completedMatches) {
          const sortedTeams = [...match.matchTeams].sort((a, b) => a.rank - b.rank);

          for (const matchTeam of sortedTeams) {
            const oldPoints = matchTeam.points;
            const newPoints = calculatePoints(matchTeam.rank, game, sortedTeams.length);

            gameChanges.teams.push({
              teamName: matchTeam.team.name,
              rank: matchTeam.rank,
              rawScore: matchTeam.rawScore,
              currentPoints: oldPoints,
              calculatedPoints: newPoints,
              needsUpdate: oldPoints !== newPoints,
            });

            if (oldPoints !== newPoints) {
              totalTeamsUpdated++;
              matchTeam.points = newPoints;
              await matchTeamRepository.save(matchTeam);
            }
          }
        }
        if (gameChanges.teams.length > 0) {
          totalGamesProcessed++;
        }
      }

      if (gameChanges.teams.length > 0) {
        changes.push(gameChanges);
      }
    }

    // Display summary
    console.log('════════════════════════════════════════════════════════════════════════════════');
    console.log('📈 RECALCULATION SUMMARY');
    console.log('════════════════════════════════════════════════════════════════════════════════');
    console.log(`Total games processed: ${totalGamesProcessed}`);
    console.log(`Teams updated: ${totalTeamsUpdated}`);
    console.log('════════════════════════════════════════════════════════════════════════════════');

    // Always show diagnostic details
    console.log('\n📋 DIAGNOSTIC DETAILS (By Game):\n');
    for (const change of changes) {
      const hasUpdates = change.teams.some(t => t.needsUpdate);
      const symbol = hasUpdates ? '🔄' : '✅';
      console.log(`\n${symbol} ${change.gameName}`);
      console.log(`   Format: ${change.gameFormat}, Type: ${change.gameType}`);
      console.log(`   Matches: ${change.matchesCount}`);
      console.log('   ────────────────────────────────────────────────────────────');
      
      if (change.gameFormat === 'ROUND_ROBIN') {
        console.log('   📊 GLOBAL RANKING (all matches combined):');
      }
      
      for (const team of change.teams) {
        const status = team.needsUpdate ? '🔄 UPDATED' : '✅ OK';
        console.log(`   ${status} ${team.teamName}`);
        if (change.gameFormat === 'ROUND_ROBIN') {
          console.log(`     Global Rank: #${team.globalRank} | Score: ${team.rawScore}`);
        } else {
          console.log(`     Match Rank: #${team.rank} | Score: ${team.rawScore}`);
        }
        if (team.needsUpdate) {
          console.log(`     Points: ${team.currentPoints} → ${team.calculatedPoints} (${team.calculatedPoints > team.currentPoints ? '+' : ''}${team.calculatedPoints - team.currentPoints})`);
        } else {
          console.log(`     Points: ${team.currentPoints} (already correct)`);
        }
      }
    }
    console.log('\n════════════════════════════════════════════════════════════════════════════════\n');

    if (totalTeamsUpdated > 0) {
      console.log('✅ Points recalculation completed successfully!');
    } else {
      console.log('✅ No changes needed - all points are already correct!');
    }

    await AppDataSource.destroy();
    console.log('\n🔌 Database connection closed');
  } catch (error) {
    console.error('\n❌ Error during recalculation:', error);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(1);
  }
}

// Run the script
recalculatePoints();
