import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { gamesService } from '../services';
import { Game, GameType, GameFormat } from '../types';
import { Loading, ErrorMessage } from '../components';

export function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      setLoading(true);
      const data = await gamesService.getAll();
      setGames(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des épreuves');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: GameType) => {
    const map = {
      [GameType.TIME]: { label: 'Temps', icon: '⏱️' },
      [GameType.SCORE]: { label: 'Score', icon: '⚽' },
      [GameType.POINTS]: { label: 'Points', icon: '🎯' },
    };
    return map[type];
  };

  const getFormatLabel = (format: GameFormat) => {
    return format === GameFormat.ROUND_ROBIN ? 'Round-Robin' : 'Élimination';
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={loadGames} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Épreuves</h1>
          <p className="text-zinc-500 text-sm mt-1">{games.length} épreuve{games.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {games.length === 0 ? (
        <div className="bg-surface-200 border border-surface-border rounded-2xl p-16 text-center">
          <div className="text-4xl mb-4">🎮</div>
          <p className="text-zinc-500">Aucune épreuve pour le moment</p>
          <p className="text-zinc-600 text-sm mt-1">Créez des épreuves dans les paramètres</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {games.map((game) => {
            const typeInfo = getTypeLabel(game.gameType);
            return (
              <Link
                key={game.id}
                to={`/games/${game.id}`}
                className="bg-surface-200 border border-surface-border rounded-2xl p-6 hover:border-surface-border-light hover:bg-surface-300 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-white font-semibold text-lg group-hover:text-primary-400 transition-colors">
                    {game.name}
                  </h3>
                  <span className="text-xl">{typeInfo.icon}</span>
                </div>
                {game.description && (
                  <p className="text-zinc-500 text-sm mb-4 line-clamp-2">{game.description}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 bg-primary-500/10 text-primary-400 rounded-lg text-xs font-medium border border-primary-500/20">
                    {typeInfo.label}
                  </span>
                  <span className="px-2.5 py-1 bg-surface-400 text-zinc-400 rounded-lg text-xs font-medium border border-surface-border">
                    {getFormatLabel(game.gameFormat)}
                  </span>
                  <span className="px-2.5 py-1 bg-surface-400 text-zinc-400 rounded-lg text-xs font-medium border border-surface-border">
                    {game.teamsPerMatch} éq./match
                  </span>
                </div>
                <p className="text-zinc-600 text-xs mt-4">Voir classement et rencontres →</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
