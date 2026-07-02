import React, { useEffect, useState } from 'react';
import { gamesService, type CreateGameData } from '../services/games.service';
import type { Game, GameType, GameFormat } from '../types';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Badge } from '../components/Badge';
import { Spinner, EmptyState } from '../components/StatusComponents';

const defaultForm = (): CreateGameData => ({
  name: '',
  type: 'SCORE',
  format: 'ROUND_ROBIN',
  scoringDirection: 'DESC',
  description: '',
});

const gameTypeLabel: Record<GameType, string> = {
  TIME: '⏱️ Temps',
  SCORE: '⚽ Score',
  POINTS: '🎯 Points',
};
const gameTypeVariant: Record<GameType, 'blue' | 'green' | 'yellow'> = {
  TIME: 'blue',
  SCORE: 'green',
  POINTS: 'yellow',
};
const formatLabel: Record<GameFormat, string> = {
  ROUND_ROBIN: 'Round-Robin',
  ELIMINATION: 'Élimination',
};

export const GamesPage: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Game | null>(null);
  const [form, setForm] = useState<CreateGameData>(defaultForm());
  const [deleteTarget, setDeleteTarget] = useState<Game | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () =>
    gamesService
      .getAll()
      .then(setGames)
      .catch(() => setError('Impossible de charger les jeux'))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm());
    setShowModal(true);
  };

  const openEdit = (game: Game) => {
    setEditing(game);
    setForm({
      name: game.name,
      type: game.type,
      format: game.format,
      scoringDirection: game.scoringDirection,
      description: game.description,
    });
    setShowModal(true);
  };

  const handleTypeChange = (type: GameType) => {
    setForm({ ...form, type, scoringDirection: type === 'TIME' ? 'ASC' : 'DESC' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await gamesService.update(editing.id, form);
      } else {
        await gamesService.create(form);
      }
      setShowModal(false);
      load();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await gamesService.delete(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch {
      setError('Impossible de supprimer ce jeu');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🎮 Jeux</h1>
          <p className="text-gray-500 text-sm">{games.length} jeu(x) configuré(s)</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          + Nouveau jeu
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      {games.length === 0 ? (
        <EmptyState
          message="Aucun jeu configuré."
          action={
            <button onClick={openCreate} className="text-indigo-600 hover:underline text-sm">
              Créer le premier jeu
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((game) => (
            <div
              key={game.id}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 truncate mr-2">{game.name}</h3>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEdit(game)}
                    className="text-xs text-gray-500 hover:text-indigo-600 border border-gray-200 rounded px-2 py-1"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => setDeleteTarget(game)}
                    className="text-xs text-gray-500 hover:text-red-600 border border-gray-200 rounded px-2 py-1"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge label={gameTypeLabel[game.type]} variant={gameTypeVariant[game.type]} />
                <Badge label={formatLabel[game.format]} variant="purple" />
                <Badge
                  label={game.scoringDirection === 'ASC' ? '↑ Ascendant' : '↓ Descendant'}
                  variant="gray"
                />
              </div>
              {game.description && (
                <p className="text-xs text-gray-500 mt-1 truncate">{game.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal
          title={editing ? 'Modifier le jeu' : 'Nouveau jeu'}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="ex: 100m sprint, Football…"
                required
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => handleTypeChange(e.target.value as GameType)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="SCORE">⚽ Score</option>
                  <option value="TIME">⏱️ Temps</option>
                  <option value="POINTS">🎯 Points</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                <select
                  value={form.format}
                  onChange={(e) => setForm({ ...form, format: e.target.value as GameFormat })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ROUND_ROBIN">Round-Robin</option>
                  <option value="ELIMINATION">Élimination</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Direction du score
              </label>
              <select
                value={form.scoringDirection}
                onChange={(e) =>
                  setForm({ ...form, scoringDirection: e.target.value as 'ASC' | 'DESC' })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="DESC">↓ Descendant (score le plus haut gagne)</option>
                <option value="ASC">↑ Ascendant (score le plus bas gagne, ex: temps)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optionnel)
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={2}
                placeholder="Règles du jeu…"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? 'Enregistrement…' : editing ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Supprimer le jeu "${deleteTarget.name}" et tous ses matchs ? Cette action est irréversible.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
