import React, { useEffect, useState } from 'react';
import { drawsService } from '../services/draws.service';
import { gamesService } from '../services/games.service';
import type { Game, DrawResult } from '../types';
import { Spinner } from '../components/StatusComponents';

export const DrawsPage: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<number | null>(null);
  const [preview, setPreview] = useState<DrawResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    gamesService
      .getAll()
      .then((g) => { setGames(g); if (g.length > 0) setSelectedGame(g[0].id); })
      .finally(() => setLoading(false));
  }, []);

  const loadPreview = async (gameId: number) => {
    setPreviewLoading(true);
    setError('');
    try {
      const result = await drawsService.preview(gameId);
      setPreview(result);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erreur lors de la prévisualisation');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSelectGame = (id: number) => {
    setSelectedGame(id);
    setPreview(null);
    setSuccess('');
  };

  const handleGenerate = async () => {
    if (!selectedGame) return;
    setGenerating(true);
    setError('');
    setSuccess('');
    try {
      const matches = await drawsService.generate(selectedGame);
      const count = matches.filter((m) => m.status !== 'CANCELLED').length;
      setSuccess(`${count} match(s) créé(s) avec succès !`);
      setPreview(null);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erreur lors de la génération');
    } finally {
      setGenerating(false);
    }
  };

  const selectedGameData = games.find((g) => g.id === selectedGame);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🎲 Tirages au sort</h1>
        <p className="text-gray-500 text-sm">Générez les matchs automatiquement</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm">
          ✅ {success}
        </div>
      )}

      {games.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 text-sm">
          Aucun jeu configuré. Créez d'abord des jeux dans la section "Jeux".
        </div>
      ) : (
        <>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Sélectionner un jeu</h2>
            <div className="flex flex-wrap gap-2">
              {games.map((g) => (
                <button
                  key={g.id}
                  onClick={() => handleSelectGame(g.id)}
                  className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                    selectedGame === g.id
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {g.name}
                  <span className="ml-2 text-xs opacity-75">
                    ({g.format === 'ROUND_ROBIN' ? 'RR' : 'Élim.'})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {selectedGame && selectedGameData && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">
                  {selectedGameData.name} —{' '}
                  {selectedGameData.format === 'ROUND_ROBIN'
                    ? 'Round-Robin (tous contre tous)'
                    : 'Élimination directe (bracket)'}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadPreview(selectedGame)}
                    disabled={previewLoading}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    {previewLoading ? '…' : '👁️ Prévisualiser'}
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="px-3 py-1.5 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {generating ? 'Génération…' : '🎲 Générer les matchs'}
                  </button>
                </div>
              </div>

              <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-2 mb-4">
                ⚠️ Générer les matchs supprimera les matchs "En attente" existants pour ce jeu.
              </p>

              {previewLoading && <Spinner />}

              {preview && !previewLoading && (
                <div className="space-y-4">
                  {preview.rounds.map((round) => (
                    <div key={round.round}>
                      <h3 className="text-sm font-semibold text-gray-600 mb-2">
                        Tour {round.round}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {round.matches
                          .filter((m) => !m.isBye)
                          .map((match, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
                            >
                              {match.teams.map((team, ti) => (
                                <React.Fragment key={team.id}>
                                  {ti > 0 && (
                                    <span className="text-gray-400 text-xs font-bold">VS</span>
                                  )}
                                  <div className="flex items-center gap-1.5">
                                    <div
                                      className="w-2.5 h-2.5 rounded-full"
                                      style={{ backgroundColor: team.color }}
                                    />
                                    <span className="text-sm text-gray-700">{team.name}</span>
                                  </div>
                                </React.Fragment>
                              ))}
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
