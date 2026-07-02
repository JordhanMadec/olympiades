import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { teamsService } from '../services';
import { Team } from '../types';
import { Loading, ErrorMessage } from '../components';

export function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const data = await teamsService.getAll();
      setTeams(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des équipes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={loadTeams} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Équipes</h1>
          <p className="text-zinc-500 text-sm mt-1">{teams.length} équipe{teams.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {teams.length === 0 ? (
        <div className="bg-surface-100 border border-surface-border rounded-2xl p-16 text-center">
          <div className="text-4xl mb-4">👥</div>
          <p className="text-zinc-500">Aucune équipe pour le moment</p>
          <p className="text-zinc-600 text-sm mt-1">Créez des équipes dans les paramètres</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <Link
              key={team.id}
              to={`/teams/${team.id}`}
              className="bg-surface-100 border border-surface-border rounded-2xl p-5 hover:border-surface-border-light hover:bg-surface-300 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-full flex-shrink-0 border-2"
                  style={{ backgroundColor: team.color + '30', borderColor: team.color }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold truncate group-hover:text-primary-400 transition-colors">
                    {team.name}
                  </h3>
                  <p className="text-zinc-600 text-xs mt-0.5">Voir les résultats →</p>
                </div>
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: team.color }}
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
