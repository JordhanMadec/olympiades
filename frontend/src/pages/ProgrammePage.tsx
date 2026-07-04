import { Calendar, Edit2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, EditMatchScoresModal, ErrorMessage, GameSelect, Loading, MatchCard } from "../components";
import { gamesService, matchesService, teamsService } from "../services";
import { Game, Match, MatchStatus, Team } from "../types";
import { useAuth } from "../contexts/AuthContext";

type StatusFilter = "completed" | "pending";

export function ProgrammePage() {
  const { isAuthenticated } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);

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

  // Filter matches by status (completed or pending)
  const filteredByStatus = matches.filter((match) => {
    const isCompleted = match.status === MatchStatus.COMPLETED;
    return selectedStatus === "completed" ? isCompleted : !isCompleted;
  });

  // Group matches by game
  const matchesByGame = games.reduce<Record<number, Match[]>>((acc, game) => {
    const gameMatches = filteredByStatus.filter((m) => m.gameId === game.id);
    if (gameMatches.length > 0) acc[game.id] = gameMatches;
    return acc;
  }, {});

  const displayedGames = selectedGameId
    ? games.filter((g) => g.id === selectedGameId)
    : games.filter((g) => matchesByGame[g.id]);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-white">Rencontres</h1>
            <p className="text-zinc-500 text-sm mt-1">
              {filteredByStatus.length} rencontre{filteredByStatus.length !== 1 ? "s" : ""}{" "}
              {selectedStatus === "completed" ? "terminée" : "en attente"}
              {filteredByStatus.length > 1 ? "s" : ""}
            </p>
          </div>

          {/* Game filter dropdown */}
          <div className="w-full sm:w-auto">
            <GameSelect
              games={games}
              selectedGameId={selectedGameId}
              onChange={setSelectedGameId}
              label=""
              allOptionLabel="Toutes les épreuves"
            />
          </div>

          {/* Status filter tabs */}
          <div className="w-full sm:w-auto flex items-center gap-2 bg-surface-100 border border-surface-border rounded-xl p-1">
            <button
              onClick={() => setSelectedStatus("pending")}
              className={`flex-1 px-4 py-1 rounded-lg text-sm font-medium transition-all ${
                selectedStatus === "pending"
                  ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              En attente
            </button>
            <button
              onClick={() => setSelectedStatus("completed")}
              className={`flex-1 px-4 py-1 rounded-lg text-sm font-medium transition-all ${
                selectedStatus === "completed"
                  ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Terminées
            </button>
          </div>
        </div>
      </div>

      {filteredByStatus.length === 0 ? (
        <Card className="p-16 text-center">
          <Calendar className="w-12 h-12 sm:h-16 sm:w-16 mx-auto mb-2 text-zinc-500" />
          <p className="text-zinc-500">
            Aucune rencontre {selectedStatus === "completed" ? "terminée" : "en attente"} pour le moment
          </p>
        </Card>
      ) : (
        <div className="space-y-8">
          {displayedGames.map((game) => {
            const gameMatches = matchesByGame[game.id] || [];
            return (
              <div key={game.id}>
                <h2 className="text-sm font-semibold text-zinc-400 mb-3">{game.name}</h2>
                <div className="flex flex-col gap-3">
                  {gameMatches.map((match) => {
                    const isCompleted = match.status === MatchStatus.COMPLETED;
                    const canEdit = isAuthenticated && isCompleted;

                    return (
                      <div key={match.id} className="flex gap-2">
                        <Link to={`/games/${match.gameId}`} className="flex-1">
                          <MatchCard match={match} teams={teams} games={games} hover />
                        </Link>
                        
                        {canEdit && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setEditingMatch(match);
                            }}
                            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
                            title="Modifier les scores"
                          >
                            <Edit2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Modifier</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Scores Modal */}
      {editingMatch && (
        <EditMatchScoresModal
          match={editingMatch}
          onClose={() => setEditingMatch(null)}
          onSuccess={() => {
            loadMatches();
          }}
        />
      )}
    </div>
  );
}
