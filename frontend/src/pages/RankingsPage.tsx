import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Medal, Trophy } from 'lucide-react';
import { rankingsService, gamesService } from '../services';
import { GameRanking, Game } from '../types';
import { Loading, ErrorMessage } from '../components';

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
    const gameId = searchParams.get('gameId');
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
      console.error('Erreur lors du chargement des jeux', err);
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
      setError('Erreur lors du chargement du classement');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGameChange = (gameId: string) => {
    if (gameId === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ gameId });
    }
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return { color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' };
    if (index === 1) return { color: 'text-zinc-300', bg: 'bg-zinc-400/10 border-zinc-400/20' };
    if (index === 2) return { color: 'text-orange-600', bg: 'bg-orange-700/10 border-orange-700/20' };
    return { color: 'text-zinc-500', bg: '' };
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
            {selectedGameId
              ? games.find((g) => g.id === selectedGameId)?.name || 'Par épreuve'
              : 'Classement général'}
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 bg-surface-100 border border-surface-border rounded-xl p-1">
          <button
            onClick={() => handleGameChange('all')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              !selectedGameId
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                : 'text-zinc-400 hover:text-white'
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
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {game.name}
            </button>
          ))}
        </div>
      </div>

      {/* Ranking table */}
      <div className="bg-surface-100 border border-surface-border rounded-2xl overflow-hidden">
        {!ranking || ranking.entries.length === 0 ? (
          <div className="p-16 text-center">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-zinc-500" />
            <p className="text-zinc-500">Aucun résultat pour le moment</p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-surface-border text-xs font-medium text-zinc-500 uppercase tracking-wider">
              <div className="col-span-1">Rang</div>
              <div className="col-span-5">Équipe</div>
              <div className="col-span-2 text-right">Points</div>
              <div className="col-span-2 text-right">Matchs</div>
              <div className="col-span-2 text-right">Moyenne</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-surface-border">
              {ranking.entries.map((entry, index) => {
                const badge = getRankBadge(index);
                return (
                  <div
                    key={entry.teamId}
                    className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-surface-300 transition-colors ${
                      index < 3 ? 'border-l-2 border-primary-500/40' : ''
                    }`}
                  >
                    {/* Rank */}
                    <div className="col-span-1">
                      {index < 3 ? (
                        <Medal className={`h-6 w-6 ${badge.color}`} />
                      ) : (
                        <span className="text-zinc-500 font-bold text-sm">{index + 1}</span>
                      )}
                    </div>

                    {/* Team */}
                    <div className="col-span-5 flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: entry.teamColor }}
                      />
                      <span className="font-medium text-white">{entry.teamName}</span>
                    </div>

                    {/* Points */}
                    <div className="col-span-2 text-right">
                      <span className="text-primary-400 font-bold text-lg">{entry.totalPoints}</span>
                    </div>

                    {/* Matches */}
                    <div className="col-span-2 text-right text-zinc-400 text-sm">{entry.matchesPlayed}</div>

                    {/* Average */}
                    <div className="col-span-2 text-right text-zinc-400 text-sm">
                      {entry.matchesPlayed > 0
                        ? (entry.totalPoints / entry.matchesPlayed).toFixed(1)
                        : '—'}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
