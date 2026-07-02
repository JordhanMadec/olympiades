import { Calendar, Trophy, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, ErrorMessage, Loading, MatchCard, RankingTable, StatCard } from "../components";
import { gamesService, matchesService, rankingsService, teamsService } from "../services";
import { GameRanking, Match, Team } from "../types";

export function Dashboard() {
  const [ranking, setRanking] = useState<GameRanking | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [gamesCount, setGamesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rankingData, matchesData, teamsData, gamesData] = await Promise.all([
        rankingsService.getGeneralRanking(),
        matchesService.getAll(),
        teamsService.getAll(),
        gamesService.getAll(),
      ]);
      setRanking(rankingData);
      setMatches(matchesData);
      setTeams(teamsData);
      setGamesCount(gamesData.length);
      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement des données");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={loadData} />;

  const topRankings = ranking?.entries.slice(0, 5) || [];
  const upcomingMatches = matches.slice(0, 5);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Tableau de bord</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <StatCard label="Équipes" value={teams.length} icon={Users} />
        <StatCard label="Épreuves" value={gamesCount} icon={Trophy} />
        <StatCard label="Rencontres" value={matches.length} icon={Calendar} />
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-2 gap-6">
        {/* Top teams */}
        <div>
          <h2 className="text-base font-semibold text-white mb-4">Top 5 équipes</h2>
          <Card padding="none" className="overflow-hidden">
            <RankingTable entries={topRankings} emptyMessage="Aucune donnée" />
          </Card>
        </div>

        {/* Upcoming matches */}
        <div>
          <h2 className="text-base font-semibold text-white mb-4">Prochaines rencontres</h2>
          {upcomingMatches.length === 0 ? (
            <Card className="p-10 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-zinc-500" />
              <p className="text-zinc-500 text-sm">Aucune rencontre</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {upcomingMatches.map((match) => (
                <MatchCard key={match.id} match={match} teams={teams} compact />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
