import { DataSource } from 'typeorm';
import { Match } from '../matches/match.entity';
import { MatchTeam } from '../matches/match-team.entity';
import { Game } from '../games/game.entity';
import { GameFormat, GameType } from '../games/game.enums';
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

    const matchRepository = AppDataSource.getRepository(Match);
    const matchTeamRepository = AppDataSource.getRepository(MatchTeam);

    // Load all completed matches with relations
    const completedMatches = await matchRepository.find({
      where: { status: MatchStatus.COMPLETED },
      relations: ['game', 'matchTeams', 'matchTeams.team'],
      order: { id: 'ASC' },
    });

    console.log(`📊 Found ${completedMatches.length} completed matches\n`);

    if (completedMatches.length === 0) {
      console.log('ℹ️  No completed matches to recalculate\n');
      await AppDataSource.destroy();
      return;
    }

    let totalMatchesUpdated = 0;
    let totalTeamsUpdated = 0;
    const changes: any[] = [];

    // Process each match
    for (const match of completedMatches) {
      let matchHasChanges = false;
      const matchChanges: any = {
        matchId: match.id,
        gameName: match.game.name,
        gameFormat: match.game.gameFormat,
        gameType: match.game.gameType,
        teams: [],
      };

      // Sort teams by rank (already calculated and saved)
      const sortedTeams = [...match.matchTeams].sort((a, b) => a.rank - b.rank);

      // Recalculate points for each team
      for (const matchTeam of sortedTeams) {
        const oldPoints = matchTeam.points;
        const newPoints = calculatePoints(
          matchTeam.rank,
          match.game,
          sortedTeams.length
        );

        if (oldPoints !== newPoints) {
          matchHasChanges = true;
          totalTeamsUpdated++;

          matchChanges.teams.push({
            teamName: matchTeam.team.name,
            rank: matchTeam.rank,
            rawScore: matchTeam.rawScore,
            oldPoints,
            newPoints,
          });

          // Update the points
          matchTeam.points = newPoints;
          await matchTeamRepository.save(matchTeam);
        }
      }

      if (matchHasChanges) {
        totalMatchesUpdated++;
        changes.push(matchChanges);
      }
    }

    // Display summary
    console.log('════════════════════════════════════════════════════════════════════════════════');
    console.log('📈 RECALCULATION SUMMARY');
    console.log('════════════════════════════════════════════════════════════════════════════════');
    console.log(`Total matches analyzed: ${completedMatches.length}`);
    console.log(`Matches updated: ${totalMatchesUpdated}`);
    console.log(`Teams updated: ${totalTeamsUpdated}`);
    console.log('════════════════════════════════════════════════════════════════════════════════');

    if (changes.length > 0) {
      console.log('\n📋 DETAILED CHANGES:\n');
      for (const change of changes) {
        console.log(`\n🎮 Match #${change.matchId} - ${change.gameName}`);
        console.log(`   Format: ${change.gameFormat}, Type: ${change.gameType}`);
        console.log('   ────────────────────────────────────────────────────────────');
        for (const team of change.teams) {
          console.log(`   ${team.teamName}`);
          console.log(`     Rank: #${team.rank} | Score: ${team.rawScore}`);
          console.log(`     Points: ${team.oldPoints} → ${team.newPoints} (${team.newPoints > team.oldPoints ? '+' : ''}${team.newPoints - team.oldPoints})`);
        }
      }
      console.log('\n════════════════════════════════════════════════════════════════════════════════\n');
      console.log('✅ Points recalculation completed successfully!');
    } else {
      console.log('\n✅ No changes needed - all points are already correct!');
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
