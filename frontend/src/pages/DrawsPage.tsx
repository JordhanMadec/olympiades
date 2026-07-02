import { useEffect, useState } from 'react';
import { drawsService, gamesService, teamsService, matchesService } from '../services';
import { Game, Team, GameFormat, RoundRobinMatch, BracketMatch } from '../types';
import { Loading, ErrorMessage, Button, Select, Input } from '../components';

export function DrawsPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [selectedTeamIds, setSelectedTeamIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Round-robin params
  const [numberOfMatches, setNumberOfMatches] = useState(5);
  
  // Generated draws
  const [roundRobinDraws, setRoundRobinDraws] = useState<RoundRobinMatch[]>([]);
  const [bracketDraws, setBracketDraws] = useState<BracketMatch[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [gamesData, teamsData] = await Promise.all([
        gamesService.getAll(),
        teamsService.getAll(),
      ]);
      setGames(gamesData);
      setTeams(teamsData);
    } catch (err) {
      console.error('Erreur lors du chargement', err);
    }
  };

  const selectedGame = games.find((g) => g.id === selectedGameId);

  const toggleTeam = (teamId: number) => {
    if (selectedTeamIds.includes(teamId)) {
      setSelectedTeamIds(selectedTeamIds.filter((id) => id !== teamId));
    } else {
      setSelectedTeamIds([...selectedTeamIds, teamId]);
    }
  };

  const handleGenerateRoundRobin = async () => {
    if (!selectedGameId || selectedTeamIds.length < (selectedGame?.teamsPerMatch || 2)) {
      alert(`Sélectionnez au moins ${selectedGame?.teamsPerMatch || 2} équipes`);
      return;
    }

    try {
      setLoading(true);
      const draws = await drawsService.generateRoundRobin({
        gameId: selectedGameId,
        teamIds: selectedTeamIds,
        numberOfMatches,
        teamsPerMatch: selectedGame!.teamsPerMatch,
      });
      setRoundRobinDraws(draws);
      setBracketDraws([]);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la génération du tirage');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBracket = async () => {
    if (!selectedGameId || selectedTeamIds.length < 2) {
      alert('Sélectionnez au moins 2 équipes');
      return;
    }

    try {
      setLoading(true);
      const draws = await drawsService.generateBracket({
        gameId: selectedGameId,
        teamIds: selectedTeamIds,
        useSeeding: false,
      });
      setBracketDraws(draws);
      setRoundRobinDraws([]);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la génération du bracket');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMatches = async () => {
    if (!selectedGameId) return;

    const isRoundRobin = selectedGame?.gameFormat === GameFormat.ROUND_ROBIN;
    const draws = isRoundRobin ? roundRobinDraws : bracketDraws;

    if (draws.length === 0) {
      alert('Générez d\'abord un tirage');
      return;
    }

    if (!confirm(`Créer ${draws.length} matchs pour ce jeu ?`)) return;

    try {
      setLoading(true);
      
      for (const draw of draws) {
        await matchesService.create({
          gameId: selectedGameId,
          matchNumber: draw.matchNumber,
          status: 'PENDING' as any,
          round: 'round' in draw ? draw.round : undefined,
          bracketPosition: 'bracketPosition' in draw ? draw.bracketPosition : undefined,
        });

        // Note: Team assignment would be handled by the backend
        // when creating matches from the draw results
      }

      alert('Matchs créés avec succès !');
      setRoundRobinDraws([]);
      setBracketDraws([]);
      setSelectedTeamIds([]);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la création des matchs');
    } finally {
      setLoading(false);
    }
  };

  const getTeamName = (teamId: number) => {
    return teams.find((t) => t.id === teamId)?.name || 'Équipe inconnue';
  };

  const getTeamColor = (teamId: number) => {
    return teams.find((t) => t.id === teamId)?.color || '#gray';
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Tirages au sort</h1>

      {/* Game Selection */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">1. Sélectionner un jeu</h2>
        <Select
          value={selectedGameId?.toString() || ''}
          onChange={(e) => {
            setSelectedGameId(e.target.value ? parseInt(e.target.value) : null);
            setSelectedTeamIds([]);
            setRoundRobinDraws([]);
            setBracketDraws([]);
          }}
        >
          <option value="">-- Choisir un jeu --</option>
          {games.map((game) => (
            <option key={game.id} value={game.id}>
              {game.name} ({game.gameFormat === GameFormat.ROUND_ROBIN ? 'Round-Robin' : 'Bracket'})
            </option>
          ))}
        </Select>
      </div>

      {selectedGameId && (
        <>
          {/* Team Selection */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              2. Sélectionner les équipes ({selectedTeamIds.length} sélectionnées)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => toggleTeam(team.id)}
                  className={`p-3 rounded border-2 transition ${
                    selectedTeamIds.includes(team.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: team.color }}
                    ></div>
                    <span className="font-medium text-sm">{team.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Draw Configuration */}
          {selectedGame?.gameFormat === GameFormat.ROUND_ROBIN ? (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">3. Configurer le tirage</h2>
              <Input
                label="Nombre de matchs à générer"
                type="number"
                min="1"
                value={numberOfMatches}
                onChange={(e) => setNumberOfMatches(parseInt(e.target.value))}
              />
              <Button onClick={handleGenerateRoundRobin} disabled={loading}>
                Générer le tirage Round-Robin
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">3. Générer le bracket</h2>
              <Button onClick={handleGenerateBracket} disabled={loading}>
                Générer le bracket d'élimination
              </Button>
            </div>
          )}
        </>
      )}

      {loading && <Loading />}
      {error && <ErrorMessage message={error} />}

      {/* Round-Robin Results */}
      {roundRobinDraws.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Tirage généré ({roundRobinDraws.length} matchs)</h2>
            <Button variant="success" onClick={handleCreateMatches}>
              Créer les matchs
            </Button>
          </div>

          <div className="space-y-3">
            {roundRobinDraws.map((draw) => (
              <div key={draw.matchNumber} className="border rounded p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="font-bold text-lg">Match #{draw.matchNumber}</span>
                    {draw.teamIds.map((teamId) => (
                      <div key={teamId} className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getTeamColor(teamId) }}
                        ></div>
                        <span className="font-medium">{getTeamName(teamId)}</span>
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    Score de confrontation: {draw.confrontationScore}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bracket Results */}
      {bracketDraws.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Bracket généré ({bracketDraws.length} matchs)</h2>
            <Button variant="success" onClick={handleCreateMatches}>
              Créer les matchs
            </Button>
          </div>

          <div className="space-y-6">
            {Array.from(new Set(bracketDraws.map((d) => d.round)))
              .sort((a, b) => b - a)
              .map((round) => (
                <div key={round}>
                  <h3 className="font-semibold mb-3">
                    {round === 1
                      ? 'Finale'
                      : round === 2
                      ? 'Demi-finales'
                      : round === 3
                      ? 'Quarts de finale'
                      : `Round ${round}`}
                  </h3>
                  <div className="space-y-2">
                    {bracketDraws
                      .filter((d) => d.round === round)
                      .map((draw) => (
                        <div key={draw.matchNumber} className="border rounded p-3 hover:bg-gray-50">
                          <div className="flex items-center space-x-4">
                            <span className="font-bold">Match #{draw.matchNumber}</span>
                            {draw.isBye ? (
                              <span className="text-gray-500 italic">Bye</span>
                            ) : draw.teamIds.length > 0 ? (
                              draw.teamIds.map((teamId) => (
                                <div key={teamId} className="flex items-center space-x-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: getTeamColor(teamId) }}
                                  ></div>
                                  <span className="font-medium">{getTeamName(teamId)}</span>
                                </div>
                              ))
                            ) : (
                              <span className="text-gray-400 italic">À déterminer</span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
