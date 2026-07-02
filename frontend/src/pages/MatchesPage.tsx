import React, { useEffect, useState } from 'react';
import { matchesService, type TeamScore } from '../services/matches.service';
import { gamesService } from '../services/games.service';
import { teamsService } from '../services/teams.service';
import type { Match, Game, Team, MatchStatus } from '../types';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { statusBadge } from '../components/Badge';
import { Spinner, EmptyState } from '../components/StatusComponents';

const STATUS_LABELS: MatchStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export const MatchesPage: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterGame, setFilterGame] = useState<number | null>(null);
  const [scoreMatch, setScoreMatch] = useState<Match | null>(null);
  const [scores, setScores] = useState<Record<number, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Match | null>(null);
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ gameId: '', teamIds: [] as number[] });

  const load = () =>
    Promise.all([
      matchesService.getAll(filterGame ?? undefined),
      gamesService.getAll(),
      teamsService.getAll(),
    ])
      .then(([m, g, t]) => { setMatches(m); setGames(g); setTeams(t); })
      .catch(() => setError('Impossible de charger les données'))
      .finally(() => setLoading(false));

  useEffect(() => {
    setLoading(true);
    load();
  }, [filterGame]);

  const openScoreModal = (match: Match) => {
    setScoreMatch(match);
    const init: Record<number, string> = {};
    for (const mt of match.matchTeams) {
      init[mt.teamId] = mt.rawScore !== null ? String(mt.rawScore) : '';
    }
    setScores(init);
  };

  const handleSubmitScores = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scoreMatch) return;
    const scoreList: TeamScore[] = scoreMatch.matchTeams.map((mt) => ({
      teamId: mt.teamId,
      rawScore: parseFloat(scores[mt.teamId] ?? '0'),
    }));
    setSaving(true);
    try {
      await matchesService.submitScores(scoreMatch.id, scoreList);
      setScoreMatch(null);
      load();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erreur lors de la soumission');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (match: Match, status: MatchStatus) => {
    try {
      await matchesService.update(match.id, { status });
      load();
    } catch {
      setError('Impossible de mettre à jour le statut');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await matchesService.delete(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch {
      setError('Impossible de supprimer ce match');
    }
  };

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.gameId || createForm.teamIds.length < 2) return;
    setSaving(true);
    try {
      await matchesService.create({
        gameId: +createForm.gameId,
        teams: createForm.teamIds.map((id) => ({ teamId: id, rawScore: 0 })),
      });
      setShowCreate(false);
      setCreateForm({ gameId: '', teamIds: [] });
      load();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erreur création');
    } finally {
      setSaving(false);
    }
  };

  const toggleTeam = (id: number) => {
    setCreateForm((prev) => ({
      ...prev,
      teamIds: prev.teamIds.includes(id)
        ? prev.teamIds.filter((t) => t !== id)
        : [...prev.teamIds, id],
    }));
  };

  const gameById = (id: number) => games.find((g) => g.id === id);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">⚔️ Matchs</h1>
          <p className="text-gray-500 text-sm">{matches.length} match(s)</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          + Nouveau match
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterGame(null)}
          className={`px-3 py-1.5 text-sm rounded-full border ${
            filterGame === null
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white text-gray-600 border-gray-300'
          }`}
        >
          Tous
        </button>
        {games.map((g) => (
          <button
            key={g.id}
            onClick={() => setFilterGame(g.id)}
            className={`px-3 py-1.5 text-sm rounded-full border ${
              filterGame === g.id
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-600 border-gray-300'
            }`}
          >
            {g.name}
          </button>
        ))}
      </div>

      {matches.length === 0 ? (
        <EmptyState
          message="Aucun match. Utilisez les tirages pour en générer automatiquement."
        />
      ) : (
        <div className="space-y-3">
          {matches.map((match) => {
            const game = gameById(match.gameId);
            return (
              <div
                key={match.id}
                className="bg-white border border-gray-200 rounded-xl p-4"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-800">
                      {game?.name ?? `Jeu #${match.gameId}`}
                    </span>
                    <span className="text-xs text-gray-400">Tour {match.round}</span>
                    {statusBadge(match.status)}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {match.status !== 'COMPLETED' && match.status !== 'CANCELLED' && (
                      <button
                        onClick={() => openScoreModal(match)}
                        className="text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded px-2 py-1"
                      >
                        Scores
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteTarget(match)}
                      className="text-xs text-gray-500 hover:text-red-600 border border-gray-200 rounded px-2 py-1"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-2">
                  {match.matchTeams.map((mt) => (
                    <div key={mt.id} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: mt.team?.color }}
                      />
                      <span className="text-sm text-gray-700">{mt.team?.name}</span>
                      {mt.rawScore !== null && (
                        <span className="text-xs text-gray-500">
                          ({mt.rawScore}
                          {mt.rank !== null && (
                            <> → #{mt.rank} • {mt.points}pts</>
                          )})
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {match.status === 'PENDING' && (
                  <div className="mt-2">
                    <select
                      value={match.status}
                      onChange={(e) => handleStatusChange(match, e.target.value as MatchStatus)}
                      className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-600"
                    >
                      {STATUS_LABELS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Score modal */}
      {scoreMatch && (
        <Modal title="Saisir les scores" onClose={() => setScoreMatch(null)}>
          <form onSubmit={handleSubmitScores} className="space-y-4">
            {scoreMatch.matchTeams.map((mt) => (
              <div key={mt.id}>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: mt.team?.color }}
                  />
                  {mt.team?.name}
                </label>
                <input
                  type="number"
                  step="any"
                  value={scores[mt.teamId] ?? ''}
                  onChange={(e) =>
                    setScores({ ...scores, [mt.teamId]: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Score brut"
                  required
                />
              </div>
            ))}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setScoreMatch(null)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? 'Envoi…' : 'Valider les scores'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Create match modal */}
      {showCreate && (
        <Modal title="Nouveau match" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreateMatch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jeu</label>
              <select
                value={createForm.gameId}
                onChange={(e) => setCreateForm({ ...createForm, gameId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                required
              >
                <option value="">Sélectionner…</option>
                {games.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Équipes (min. 2)
              </label>
              <div className="flex flex-wrap gap-2">
                {teams.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTeam(t.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      createForm.teamIds.includes(t.id)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-700 border-gray-300'
                    }`}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: t.color }}
                    />
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving || createForm.teamIds.length < 2}
                className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? 'Création…' : 'Créer'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message="Supprimer ce match ? Cette action est irréversible."
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
