import { DataSource } from "typeorm";
import { config } from "dotenv";
import { Match } from "../src/matches/match.entity";
import { MatchTeam } from "../src/matches/match-team.entity";
import { Game } from "../src/games/game.entity";
import { Team } from "../src/teams/team.entity";
import { TeamMatchHistory } from "../src/database/team-match-history.entity";
import { MatchStatus } from "../src/matches/match.enums";
import { GameFormat, ScoringDirection } from "../src/games/game.enums";

// Load environment variables
config();

// Determine if we should use PostgreSQL or SQLite
const usePostgres = process.env.DATABASE_TYPE === "postgres" && process.env.DATABASE_HOST;
const databaseType = usePostgres ? "postgres" : "sqlite";

console.log(`📍 Database Type: ${databaseType.toUpperCase()}`);
if (databaseType === "sqlite") {
  console.log(`📁 Database File: olympiades.sqlite`);
} else {
  console.log(`🌐 Database Host: ${process.env.DATABASE_HOST}`);
}
console.log();

// Create DataSource
const AppDataSource = new DataSource(
  databaseType === "postgres"
    ? {
        type: "postgres",
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT || "5432"),
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        entities: [Team, Game, Match, MatchTeam, TeamMatchHistory],
        synchronize: false,
        logging: false,
        ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
      }
    : {
        type: "sqlite",
        database: "olympiades.sqlite",
        entities: [Team, Game, Match, MatchTeam, TeamMatchHistory],
        synchronize: false,
        logging: false,
      }
);

interface PointsChange {
  matchId: number;
  matchNumber: number;
  gameName: string;
  gameFormat: string;
  changes: {
    teamName: string;
    rank: number;
    oldPoints: number;
    newPoints: number;
  }[];
}

async function recalculateAllMatchPoints() {
  console.log("🚀 Starting match points recalculation...\n");

  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log("✅ Database connection established\n");

    const matchRepository = AppDataSource.getRepository(Match);
    const matchTeamRepository = AppDataSource.getRepository(MatchTeam);
    const gameRepository = AppDataSource.getRepository(Game);

    // Get all completed matches
    const matches = await matchRepository.find({
      where: { status: MatchStatus.COMPLETED },
      relations: ["matchTeams", "matchTeams.team", "game"],
      order: { id: "ASC" },
    });

    console.log(`📊 Found ${matches.length} completed matches\n`);

    if (matches.length === 0) {
      console.log("ℹ️  No completed matches to recalculate");
      await AppDataSource.destroy();
      return;
    }

    const allChanges: PointsChange[] = [];
    let totalMatchesUpdated = 0;
    let totalTeamsUpdated = 0;

    for (const match of matches) {
      const game = match.game;
      if (!game) continue;

      const matchTeams = match.matchTeams;
      if (matchTeams.length === 0) continue;

      // Sort match teams by rank (should already be set)
      const sortedMatchTeams = [...matchTeams].sort((a, b) => {
        if (a.rank === null || a.rank === undefined) return 1;
        if (b.rank === null || b.rank === undefined) return -1;
        return a.rank - b.rank;
      });

      // Calculate new points based on game format
      const pointsMap = [10, 8, 6, 5, 4, 3, 2, 1];
      const matchChanges: PointsChange = {
        matchId: match.id,
        matchNumber: match.matchNumber,
        gameName: game.name,
        gameFormat: game.gameFormat,
        changes: [],
      };

      let hasChanges = false;

      for (const matchTeam of sortedMatchTeams) {
        const oldPoints = matchTeam.points || 0;
        let newPoints = 0;

        // Apply new logic
        if (game.gameFormat === GameFormat.ROUND_ROBIN) {
          // Round Robin: always Olympic system
          newPoints = pointsMap[(matchTeam.rank || 1) - 1] || 0;
        } else if (game.gameFormat === GameFormat.ELIMINATION) {
          // Elimination: depends on game type
          if (game.gameType === "SCORE") {
            const winPoints = game.winPoints || 10;
            newPoints = matchTeam.rank === 1 ? winPoints : 0;
          } else {
            newPoints = pointsMap[(matchTeam.rank || 1) - 1] || 0;
          }
        } else {
          // Fallback: Olympic system
          newPoints = pointsMap[(matchTeam.rank || 1) - 1] || 0;
        }

        // Update if different
        if (oldPoints !== newPoints) {
          matchTeam.points = newPoints;
          await matchTeamRepository.save(matchTeam);

          matchChanges.changes.push({
            teamName: matchTeam.team?.name || `Team ${matchTeam.teamId}`,
            rank: matchTeam.rank || 0,
            oldPoints,
            newPoints,
          });

          hasChanges = true;
          totalTeamsUpdated++;
        }
      }

      if (hasChanges) {
        allChanges.push(matchChanges);
        totalMatchesUpdated++;
      }
    }

    // Display results
    console.log("═".repeat(80));
    console.log("📈 RECALCULATION SUMMARY");
    console.log("═".repeat(80));
    console.log(
      `Total matches analyzed: ${matches.length}`
    );
    console.log(
      `Matches updated: ${totalMatchesUpdated}`
    );
    console.log(
      `Teams updated: ${totalTeamsUpdated}`
    );
    console.log("═".repeat(80));

    if (allChanges.length > 0) {
      console.log("\n📋 DETAILED CHANGES:\n");

      for (const change of allChanges) {
        console.log(`\n${"─".repeat(80)}`);
        console.log(
          `🎮 Match #${change.matchNumber} - ${change.gameName} (${change.gameFormat})`
        );
        console.log(`${"─".repeat(80)}`);

        for (const teamChange of change.changes) {
          const emoji = teamChange.newPoints > teamChange.oldPoints ? "📈" : "📉";
          console.log(
            `  ${emoji} ${teamChange.teamName.padEnd(20)} | Rank: ${teamChange.rank} | Points: ${teamChange.oldPoints} → ${teamChange.newPoints}`
          );
        }
      }

      console.log(`\n${"═".repeat(80)}`);
      console.log("✅ All points have been recalculated successfully!");
      console.log("═".repeat(80));
      console.log(
        "\n💡 Next steps:"
      );
      console.log(
        "   1. Check the rankings to verify the changes"
      );
      console.log(
        "   2. Inform users that points have been updated"
      );
      console.log(
        "   3. Review the general ranking"
      );
    } else {
      console.log("\n✅ No changes needed - all points are already correct!");
    }

    // Close connection
    await AppDataSource.destroy();
    console.log("\n🔌 Database connection closed\n");
  } catch (error) {
    console.error("❌ Error during recalculation:", error);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(1);
  }
}

// Run the script
recalculateAllMatchPoints();
