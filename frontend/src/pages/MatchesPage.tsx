import { useEffect, useState } from 'react';
import { matchesService, gamesService, teamsService } from '../services';
import { Match, Game, Team, MatchStatus, UpdateScoresDto } from '../types';
import { Loading, ErrorMessage, Button, Select, Modal, Input } from '../components';

export function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scoringMatch, setScoringMatch] = useState<Match | null>(null);
  const [scores, setScores] = useState<{ [teamId: number]: string }>({});

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (games.length > 0 || teams.length > 0) {
      loadMatches();
    }
  }, [selectedGameId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [gamesData, teamsData] = await Promise.all([
        gamesService.getAll(),
        teamsService.getAll(),
      ]);
      setGames(gamesData);
      setTeams(teamsData);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMatches = async () => {
    try {
      setLoading(true);
      const data = await matchesService.getAll(selectedGameId || undefined);
      setMatches(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des matchs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMatch = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce match ?')) return;
    try {
      await matchesService.delete(id);
      await loadMatches();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleOpenScoring = (match: Match) => {
    setScoringMatch(match);
    const initialScores: { [teamId: number]: string } = {};
    match.matchTeams.forEach((mt) => {
      initialScores[mt.teamId] = mt.rawScore?.toString() || '';
    });
    setScores(initialScores);
  };

  const handleSubmitScores = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scoringMatch) return;

    try {
      const dto: UpdateScoresDto = {
        scores: Object.entries(scores).map(([teamId, rawScore]) => ({
          teamId: parseInt(teamId),
          rawScore: parseFloat(rawScore),
        })),
      };

      await matchesService.updateScores(scoringMatch.id, dto);
      await loadMatches();
      setScoringMatch(null);
      setScores({});
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la sauvegarde des scores');
    }
  };

  const getTeamName = (teamId: number) => {
    return teams.find((t) => t.id === teamId)?.name || 'Équipe inconnue';
  };

  const getTeamColor = (teamId: number) => {
    return teams.find((t) => t.id === teamId)?.color || '#gray';
  };

  const getGameName = (gameId: number) => {
    return games.find((g) => g.id === gameId)?.name || 'Jeu inconnu';
  };

  const getStatusBadge = (status: MatchStatus) => {
    const badges = {
      [MatchStatus.PENDING]: 'bg-gray-100 text-gray-800',
      [MatchStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
      [MatchStatus.COMPLETED]: 'bg-green-100 text-green-800',
    };
    const labels = {
      [MatchStatus.PENDING]: 'En attente',
      [MatchStatus.IN_PROGRESS]: 'En cours',
      [MatchStatus.COMPLETED]: 'Terminé',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={loadMatches} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Rencontres</h1>
        <div className="w-64">
          <Select
            value={selectedGameId?.toString() || 'all'}
            onChange={(e) => setSelectedGameId(e.target.value === 'all' ? null : parseInt(e.target.value))}
          >
            <option value="all">Tous les jeux</option>
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">Aucun match pour le moment</p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <div key={match.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold">
                      {getGameName(match.gameId)} - Match #{match.matchNumber}
                    </h3>
                    {getStatusBadge(match.status)}
                  </div>
                  {match.round && (
                    <p className="text-sm text-gray-500">
                      Round {match.round} - Position {match.bracketPosition}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="primary"
                    onClick={() => handleOpenScoring(match)}
                    disabled={match.status === MatchStatus.COMPLETED}
                  >
                    {match.status === MatchStatus.COMPLETED ? 'Voir scores' : 'Enregistrer scores'}
                  </Button>
                  <Button variant="danger" onClick={() => handleDeleteMatch(match.id)}>
                    Supprimer
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {match.matchTeams
                  .sort((a, b) => (a.rank || 999) - (b.rank || 999))
                  .map((mt) => (
                    <div
                      key={mt.id}
                      className={`p-3 rounded border-2 ${
                        mt.rank === 1
                          ? 'border-yellow-400 bg-yellow-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getTeamColor(mt.teamId) }}
                        ></div>
                        <span className="font-semibold text-sm">{getTeamName(mt.teamId)}</span>
                      </div>
                      {mt.rawScore !== null && mt.rawScore !== undefined && (
                        <div className="text-xs text-gray-600">
                          <div>Score: {mt.rawScore}</div>
                          <div>Rang: {mt.rank}</div>
                          <div className="font-semibold text-blue-600">Points: {mt.points}</div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Scoring Modal */}
      {scoringMatch && (
        <Modal
          isOpen={true}
          onClose={() => setScoringMatch(null)}
          title={`Scores - ${getGameName(scoringMatch.gameId)} - Match #${scoringMatch.matchNumber}`}
        >
          <form onSubmit={handleSubmitScores}>
            <div className="space-y-4 mb-6">
              {scoringMatch.matchTeams.map((mt) => (
                <div key={mt.teamId}>
                  <div className="flex items-center space-x-2 mb-1">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: getTeamColor(mt.teamId) }}
                    ></div>
                    <label className="font-semibold">{getTeamName(mt.teamId)}</label>
                  </div>
                  <Input
                    type="number"
                    step="0.01"
                    value={scores[mt.teamId] || ''}
                    onChange={(e) => setScores({ ...scores, [mt.teamId]: e.target.value })}
                    placeholder="Score"
                    required
                    disabled={scoringMatch.status === MatchStatus.COMPLETED}
                  />
                  {mt.rank && (
                    <div className="text-xs text-gray-500 mt-1">
                      Rang actuel: {mt.rank} - Points: {mt.points}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex space-x-3">
              {scoringMatch.status !== MatchStatus.COMPLETED && (
                <Button type="submit" className="flex-1">
                  Enregistrer
                </Button>
              )}
              <Button
                type="button"
                variant="secondary"
                onClick={() => setScoringMatch(null)}
                className="flex-1"
              >
                {scoringMatch.status === MatchStatus.COMPLETED ? 'Fermer' : 'Annuler'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
