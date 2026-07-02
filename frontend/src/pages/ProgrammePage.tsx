import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, ErrorMessage, Loading, MatchCard } from "../components";
import { gamesService, matchesService, teamsService } from "../services";
import { Game, Match, Team } from "../types";

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
        <Card className="p-16 text-center">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-zinc-500" />
          <p className="text-zinc-500">Aucune rencontre pour le moment</p>
        </Card>
      ) : (
        <div className="space-y-8">
          {displayedGames.map((game) => {
            const gameMatches = matchesByGame[game.id] || [];
            return (
              <div key={game.id}>
                <h2 className="text-sm font-semibold text-zinc-400 mb-3">{game.name}</h2>
                <div className="flex flex-col gap-3">
                  {gameMatches.map((match) => (
                    <Link to={`/games/${match.gameId}`}>
                      <MatchCard key={match.id} match={match} teams={teams} hover />
                    </Link>
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
