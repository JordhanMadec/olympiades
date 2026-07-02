import { Calendar, Medal } from "lucide-react";
import { useEffect, useState } from "react";
import { ErrorMessage, Loading } from "../components";
import { gamesService, matchesService, teamsService } from "../services";
import { Game, Match, MatchStatus, Team } from "../types";

export function ProgrammePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadMatches();
  }, [selectedGameId, games.length, teams.length]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [gamesData, teamsData] = await Promise.all([gamesService.getAll(), teamsService.getAll()]);
      setGames(gamesData);
      setTeams(teamsData);
      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement des données");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMatches = async () => {
    try {
      setLoading(true);
      const data = await matchesService.getAll(selectedGameId || undefined);
      setMatches(data);
      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement des matchs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTeamName = (teamId: number) => teams.find((t) => t.id === teamId)?.name || "Équipe inconnue";
  const getTeamColor = (teamId: number) => teams.find((t) => t.id === teamId)?.color || "#888";

  const getStatusBadge = (status: MatchStatus) => {
    const map = {
      [MatchStatus.PENDING]: { label: "En attente", cls: "bg-zinc-500/20 text-zinc-400 border-zinc-500/20" },
      [MatchStatus.IN_PROGRESS]: { label: "En cours", cls: "bg-blue-500/20 text-blue-400 border-blue-500/20" },
      [MatchStatus.COMPLETED]: { label: "Terminé", cls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/20" },
    };
    const { label, cls } = map[status];
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls}`}>{label}</span>;
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={loadMatches} />;

  // Group matches by game
  const matchesByGame = games.reduce<Record<number, Match[]>>((acc, game) => {
    const gameMatches = matches.filter((m) => m.gameId === game.id);
    if (gameMatches.length > 0) acc[game.id] = gameMatches;
    return acc;
  }, {});

  const displayedGames = selectedGameId
    ? games.filter((g) => g.id === selectedGameId)
    : games.filter((g) => matchesByGame[g.id]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Programme</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {matches.length} rencontre{matches.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 bg-surface-100 border border-surface-border rounded-xl p-1 flex-wrap max-w-lg justify-end">
          <button
            onClick={() => setSelectedGameId(null)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              !selectedGameId
                ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Tous
          </button>
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => setSelectedGameId(game.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedGameId === game.id
                  ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {game.name}
            </button>
          ))}
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="bg-surface-100 border border-surface-border rounded-2xl p-16 text-center">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-zinc-500" />
          <p className="text-zinc-500">Aucune rencontre pour le moment</p>
        </div>
      ) : (
        <div className="space-y-8">
          {displayedGames.map((game) => {
            const gameMatches = matchesByGame[game.id] || [];
            return (
              <div key={game.id}>
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">{game.name}</h2>
                <div className="space-y-3">
                  {gameMatches.map((match) => (
                    <div
                      key={match.id}
                      className="bg-surface-100 border border-surface-border rounded-xl p-4 hover:border-surface-border-light transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-white font-medium">Match #{match.matchNumber}</span>
                        <div className="flex items-center gap-2">
                          {match.round && <span className="text-zinc-500 text-xs">Round {match.round}</span>}
                          {getStatusBadge(match.status)}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {match.matchTeams
                          .sort((a, b) => (a.rank || 999) - (b.rank || 999))
                          .map((mt) => (
                            <div
                              key={mt.id}
                              className={`flex items-center gap-2 rounded-xl px-3 py-2 border ${
                                mt.rank === 1 && match.status === MatchStatus.COMPLETED
                                  ? "bg-primary-500/10 border-primary-500/30"
                                  : "bg-surface-400 border-surface-border"
                              }`}
                            >
                              <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: getTeamColor(mt.teamId) }}
                              />
                              <span className="text-zinc-200 text-sm">{getTeamName(mt.teamId)}</span>
                              {mt.rawScore != null && (
                                <span className="text-primary-400 text-sm font-bold">{mt.rawScore}</span>
                              )}
                              {mt.rank === 1 && match.status === MatchStatus.COMPLETED && (
                                <Medal className="h-4 w-4 text-yellow-400" />
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
