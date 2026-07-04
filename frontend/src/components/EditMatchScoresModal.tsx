import React, { useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../services/api';
import { Match } from '../types';

interface EditMatchScoresModalProps {
  match: Match;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditMatchScoresModal: React.FC<EditMatchScoresModalProps> = ({
  match,
  onClose,
  onSuccess,
}) => {
  const [scores, setScores] = useState<Record<number, string>>(
    match.matchTeams.reduce((acc, mt) => ({
      ...acc,
      [mt.teamId]: mt.rawScore?.toString() || '',
    }), {})
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScoreChange = (teamId: number, value: string) => {
    setScores(prev => ({ ...prev, [teamId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Convert scores to numbers and create DTO
      const scoresDto = match.matchTeams.map(mt => ({
        teamId: mt.teamId,
        rawScore: scores[mt.teamId] ? parseFloat(scores[mt.teamId]) : null,
      }));

      // Validate all scores are filled
      const allFilled = scoresDto.every(s => s.rawScore !== null && !isNaN(s.rawScore));
      if (!allFilled) {
        setError('Tous les scores doivent être remplis');
        setLoading(false);
        return;
      }

      await api.put(`/matches/${match.id}/scores`, { scores: scoresDto });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour des scores');
      setLoading(false);
    }
  };

  const game = match.game;
  if (!game) {
    return null; // Should never happen if match is properly loaded
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Modifier les Scores</h2>
            <p className="text-gray-400 text-sm mt-1">
              {game.name} - Match #{match.matchNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500 bg-opacity-10 border border-red-500 rounded text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            {match.matchTeams.map((matchTeam) => (
              <div key={matchTeam.teamId}>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {matchTeam.team?.name || 'Équipe inconnue'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={scores[matchTeam.teamId] || ''}
                  onChange={(e) => handleScoreChange(matchTeam.teamId, e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                  placeholder={`Score ${game.unit ? `(${game.unit})` : ''}`}
                  required
                />
              </div>
            ))}
          </div>

          {/* Info */}
          <div className="mb-6 p-3 bg-blue-500 bg-opacity-10 border border-blue-500 rounded text-blue-400 text-sm">
            {game.gameFormat === 'ROUND_ROBIN' ? (
              <p>
                ℹ️ En cas d'égalité, les équipes recevront le même nombre de points.
              </p>
            ) : (
              <p>
                ℹ️ Le classement sera recalculé automatiquement après la modification.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
