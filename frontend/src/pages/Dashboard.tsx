import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { teamsService, gamesService, rankingsService } from '../services';
import { Team, Game, GameRanking } from '../types';
import { Loading, ErrorMessage } from '../components';

export function Dashboard() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [ranking, setRanking] = useState<GameRanking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [teamsData, gamesData, rankingData] = await Promise.all([
        teamsService.getAll(),
        gamesService.getAll(),
        rankingsService.getGeneralRanking(),
      ]);
      setTeams(teamsData);
      setGames(gamesData);
      setRanking(rankingData);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={loadData} />;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Tableau de bord</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Stats Cards */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Équipes</p>
              <p className="text-3xl font-bold text-blue-600">{teams.length}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Jeux</p>
              <p className="text-3xl font-bold text-green-600">{games.length}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Rencontres jouées</p>
              <p className="text-3xl font-bold text-purple-600">
                {ranking?.entries.reduce((sum, r) => sum + r.matchesPlayed, 0) || 0}
              </p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Rankings */}
      {ranking && ranking.entries.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">🏆 Top 3</h2>
          <div className="space-y-3">
            {ranking.entries.slice(0, 3).map((entry, index) => (
              <div
                key={entry.teamId}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  index === 0
                    ? 'bg-yellow-50 border-2 border-yellow-400'
                    : index === 1
                    ? 'bg-gray-50 border-2 border-gray-400'
                    : 'bg-orange-50 border-2 border-orange-400'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <span className="text-2xl font-bold">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </span>
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: entry.teamColor }}
                  ></div>
                  <span className="font-semibold text-lg">{entry.teamName}</span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">{entry.totalPoints} pts</p>
                  <p className="text-sm text-gray-500">{entry.matchesPlayed} matchs</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            to="/rankings"
            className="block mt-4 text-center text-blue-600 hover:text-blue-800 font-medium"
          >
            Voir le classement complet →
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/teams"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition group"
        >
          <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600">Gérer les équipes</h3>
          <p className="text-gray-600">Ajouter, modifier ou supprimer des équipes</p>
        </Link>

        <Link
          to="/games"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition group"
        >
          <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600">Gérer les jeux</h3>
          <p className="text-gray-600">Configurer les jeux et leurs règles</p>
        </Link>

        <Link
          to="/matches"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition group"
        >
          <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600">Rencontres</h3>
          <p className="text-gray-600">Gérer les matchs et enregistrer les scores</p>
        </Link>

        <Link
          to="/slideshow"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition group"
        >
          <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600">Mode diaporama</h3>
          <p className="text-gray-600">Afficher les classements sur grand écran</p>
        </Link>
      </div>
    </div>
  );
}
