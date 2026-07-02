import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { rankingsService, gamesService } from '../services';
import { RankingEntry, Game } from '../types';
import { Loading, ErrorMessage, Select } from '../components';

export function RankingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
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
      setRankings(data);
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
      setSelectedGameId(null);
      setSearchParams({});
    } else {
      const id = parseInt(gameId);
      setSelectedGameId(id);
      setSearchParams({ gameId: id.toString() });
    }
  };

  const getRankMedal = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}`;
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={loadRankings} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Classements</h1>
        <div className="w-64">
          <Select
            value={selectedGameId?.toString() || 'all'}
            onChange={(e) => handleGameChange(e.target.value)}
          >
            <option value="all">Classement général</option>
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        {rankings.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">Aucun résultat pour le moment</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rang
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Équipe
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Matchs joués
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Moyenne
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rankings.map((entry, index) => (
                  <tr
                    key={entry.teamId}
                    className={`${
                      index < 3 ? 'bg-yellow-50' : ''
                    } hover:bg-gray-50 transition`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-2xl font-bold">{getRankMedal(index)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: entry.teamColor }}
                        ></div>
                        <span className="font-semibold">{entry.teamName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-xl font-bold text-blue-600">
                        {entry.totalPoints}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-gray-600">
                      {entry.matchesPlayed}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-gray-600">
                      {entry.matchesPlayed > 0
                        ? (entry.totalPoints / entry.matchesPlayed).toFixed(1)
                        : '0.0'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
