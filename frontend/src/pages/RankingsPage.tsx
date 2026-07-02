import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, ErrorMessage, Loading, RankingTable } from "../components";
import { gamesService, rankingsService } from "../services";
import { Game, GameRanking } from "../types";

export function RankingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [ranking, setRanking] = useState<GameRanking | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGames();
  }, []);

  useEffect(() => {
    const gameId = searchParams.get("gameId");
    if (gameId) {
      setSelectedGameId(parseInt(gameId));
    } else {
      setSelectedGameId(null);
    }
  }, [searchParams]);

  useEffect(() => {
    loadRankings();
  }, [selectedGameId]);

  const loadGames = async () => {
    try {
      const data = await gamesService.getAll();
      setGames(data);
    } catch (err) {
      console.error("Erreur lors du chargement des jeux", err);
    }
  };

  const loadRankings = async () => {
    try {
      setLoading(true);
      const data = selectedGameId
        ? await rankingsService.getRankingByGame(selectedGameId)
        : await rankingsService.getGeneralRanking();
      setRanking(data);
      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement du classement");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGameChange = (gameId: string) => {
    if (gameId === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ gameId });
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={loadRankings} />;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Classement</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {selectedGameId ? games.find((g) => g.id === selectedGameId)?.name || "Par épreuve" : "Classement général"}
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 bg-surface-100 border border-surface-border rounded-xl p-1">
          <button
            onClick={() => handleGameChange("all")}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              !selectedGameId
                ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Général
          </button>
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => handleGameChange(game.id.toString())}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
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

      {/* Ranking table */}
      <Card padding="none" className="overflow-hidden">
        <RankingTable entries={ranking?.entries || []} />
      </Card>
    </div>
  );
}
