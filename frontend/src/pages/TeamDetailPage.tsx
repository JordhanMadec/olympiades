import { TeamColorRing } from "@/components/TeamColorRing.tsx";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, ErrorMessage, Loading, MatchCard, StatCard } from "../components";
import { gamesService, matchesService, rankingsService, teamsService } from "../services";
import { Game, GameRanking, Match, MatchStatus, Team } from "../types";

export function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const teamId = parseInt(id!);

  const [team, setTeam] = useState<Team | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [ranking, setRanking] = useState<GameRanking | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [teamId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [teamsData, matchesData, gamesData, rankingData] = await Promise.all([
        teamsService.getAll(),
        matchesService.getAll(),
        gamesService.getAll(),
        rankingsService.getGeneralRanking(),
      ]);
      const found = teamsData.find((t) => t.id === teamId);
      if (!found) {
        setError("Équipe introuvable");
        return;
      }
      setTeam(found);
      setTeams(teamsData);
      setMatches(matchesData.filter((m) => m.matchTeams.some((mt) => mt.teamId === teamId)));
      setGames(gamesData);
      setRanking(rankingData);
      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!team) return null;

  const completedMatches = matches.filter((m) => m.status === MatchStatus.COMPLETED);
  const totalPoints =
    completedMatches.reduce((sum, m) => {
      const mt = m.matchTeams.find((x) => x.teamId === teamId);
      return sum + (mt?.points || 0);
    }, 0) + " pts";
  const rank = (ranking?.entries.findIndex((entry) => entry.teamId === teamId) || 0) + 1;

  return (
    <div>
      {/* Back */}
      <Link
        to="/teams"
        className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux équipes
      </Link>

      {/* Team header */}
      <div className="flex items-center gap-2 mb-8">
        <TeamColorRing color={team.color} size="md" />
        <h1 className="text-2xl font-bold text-white">{team.name}</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Rencontres" value={completedMatches.length + " / " + matches.length} />
        <StatCard label="Points" value={totalPoints} />
        <StatCard label="Classement" value={rank} />
      </div>

      {/* Matches */}
      <div>
        <h2 className="text-base font-semibold text-white mb-4">Rencontres ({matches.length})</h2>
        {matches.length === 0 ? (
          <Card className="p-10 text-center">
            <p className="text-zinc-500 text-sm">Aucune rencontre</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {matches.map((match) => (
              <Link to={`/games/${match.gameId}`}>
                <MatchCard key={match.id} match={match} teams={teams} games={games} showGameName hover />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
