import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, ErrorMessage, GameSelect, Loading, RankingTable } from "../components";
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

  const handleGameChange = (gameId: number | null) => {
    if (gameId === null) {
      setSearchParams({});
    } else {
      setSearchParams({ gameId: gameId.toString() });
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={loadRankings} />;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Classement</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {selectedGameId ? games.find((g) => g.id === selectedGameId)?.name || "Par épreuve" : "Classement général"}
          </p>
        </div>

        {/* Game filter dropdown */}
        <div className="w-full sm:w-64">
          <GameSelect
            games={games}
            selectedGameId={selectedGameId}
            onChange={handleGameChange}
            label=""
            allOptionLabel="Classement général"
          />
        </div>
      </div>

      {/* Ranking table */}
      <Card padding="none" className="overflow-hidden">
        <RankingTable entries={ranking?.entries || []} />
      </Card>
    </div>
  );
}
