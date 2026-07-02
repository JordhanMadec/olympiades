import { ArrowLeft, Medal } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ErrorMessage, Loading } from "../components";
import { gamesService, matchesService, teamsService } from "../services";
import { Game, Match, MatchStatus, Team } from "../types";

export function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const teamId = parseInt(id!);

  const [team, setTeam] = useState<Team | null>(null);
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
      const [teamsData, matchesData, gamesData] = await Promise.all([
        teamsService.getAll(),
        matchesService.getAll(),
        gamesService.getAll(),
      ]);
      const found = teamsData.find((t) => t.id === teamId);
      if (!found) {
        setError("Équipe introuvable");
        return;
      }
      setTeam(found);
      setMatches(matchesData.filter((m) => m.matchTeams.some((mt) => mt.teamId === teamId)));
      setGames(gamesData);
      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getGameName = (gameId: number) => games.find((g) => g.id === gameId)?.name || "Jeu inconnu";

  const getStatusBadge = (status: MatchStatus) => {
    const map = {
      [MatchStatus.PENDING]: { label: "En attente", cls: "bg-zinc-500/20 text-zinc-400" },
      [MatchStatus.IN_PROGRESS]: { label: "En cours", cls: "bg-blue-500/20 text-blue-400" },
      [MatchStatus.COMPLETED]: { label: "Terminé", cls: "bg-emerald-500/20 text-emerald-400" },
    };
    const { label, cls } = map[status];
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{label}</span>;
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!team) return null;

  const completedMatches = matches.filter((m) => m.status === MatchStatus.COMPLETED);
  const totalPoints = completedMatches.reduce((sum, m) => {
    const mt = m.matchTeams.find((x) => x.teamId === teamId);
    return sum + (mt?.points || 0);
  }, 0);

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
      <div className="flex items-center gap-4 mb-8">
        <div
          className="w-12 h-12 rounded-full flex-shrink-0 border-4"
          style={{ backgroundColor: team.color, borderColor: team.color + "40" }}
        />
        <div>
          <h1 className="text-2xl font-bold text-white">{team.name}</h1>
          <p className="text-zinc-500 text-sm">{matches.length} rencontres</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Matchs joués", value: completedMatches.length },
          { label: "Total points", value: totalPoints },
          {
            label: "Moy. points",
            value: completedMatches.length > 0 ? (totalPoints / completedMatches.length).toFixed(1) : "—",
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface-100 border border-surface-border rounded-xl p-4">
            <p className="text-zinc-500 text-xs mb-1">{stat.label}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Matches */}
      <h2 className="text-base font-semibold text-white mb-4">Rencontres</h2>
      {matches.length === 0 ? (
        <div className="bg-surface-100 border border-surface-border rounded-xl p-12 text-center">
          <p className="text-zinc-500">Aucune rencontre</p>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => {
            const myTeamEntry = match.matchTeams.find((mt) => mt.teamId === teamId);
            const opponents = match.matchTeams.filter((mt) => mt.teamId !== teamId);
            return (
              <div
                key={match.id}
                className="bg-surface-100 border border-surface-border rounded-xl p-4 hover:border-surface-border-light transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-white">{getGameName(match.gameId)}</span>
                    <span className="text-zinc-600 text-sm">Match #{match.matchNumber}</span>
                    {getStatusBadge(match.status)}
                  </div>
                  {myTeamEntry?.rank === 1 && match.status === MatchStatus.COMPLETED && (
                    <Medal className="h-5 w-5 text-yellow-400" />
                  )}
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <span className="text-zinc-500 text-xs">Score</span>
                    <p className="text-zinc-200 font-medium">
                      {myTeamEntry?.rawScore != null ? myTeamEntry.rawScore : "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-xs">Points</span>
                    <p className="text-primary-400 font-bold">
                      {myTeamEntry?.points != null ? myTeamEntry.points : "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-xs">Rang</span>
                    <p className="text-zinc-200 font-medium">
                      {myTeamEntry?.rank != null ? `#${myTeamEntry.rank}` : "—"}
                    </p>
                  </div>
                  {opponents.length > 0 && (
                    <div>
                      <span className="text-zinc-500 text-xs">Adversaires</span>
                      <p className="text-zinc-400 text-xs">
                        {opponents
                          .map((o) => {
                            return o.team?.name || `Équipe ${o.teamId}`;
                          })
                          .join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
