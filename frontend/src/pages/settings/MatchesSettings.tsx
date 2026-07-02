import { useEffect, useState } from "react";
import { Button, ErrorMessage, Input, Loading, Modal, Select } from "../../components";
import { drawsService, gamesService, matchesService, teamsService } from "../../services";
import {
  BracketMatch,
  Game,
  GameFormat,
  Match,
  MatchStatus,
  RoundRobinMatch,
  Team,
  UpdateScoresDto,
} from "../../types";

export function MatchesSettings() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scoringMatch, setScoringMatch] = useState<Match | null>(null);
  const [scores, setScores] = useState<{ [teamId: number]: string }>({});

  // Draw state
  const [showDrawPanel, setShowDrawPanel] = useState(false);
  const [drawGameId, setDrawGameId] = useState<number | null>(null);
  const [selectedTeamIds, setSelectedTeamIds] = useState<number[]>([]);
  const [numberOfMatches, setNumberOfMatches] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [roundRobinDraws, setRoundRobinDraws] = useState<RoundRobinMatch[]>([]);
  const [bracketDraws, setBracketDraws] = useState<BracketMatch[]>([]);

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
      const [gamesData, teamsData] = await Promise.all([gamesService.getAll(), teamsService.getAll()]);
      setGames(gamesData);
      setTeams(teamsData);
      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement");
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
      setError("Erreur lors du chargement des matchs");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMatch = async (id: number) => {
    if (!confirm("Supprimer ce match ?")) return;
    if (saving) return;
    try {
      setSaving(true);
      await matchesService.delete(id);
      await loadMatches();
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de la suppression");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenScoring = (match: Match) => {
    setScoringMatch(match);
    const initialScores: { [teamId: number]: string } = {};
    match.matchTeams.forEach((mt) => {
      initialScores[mt.teamId] = mt.rawScore?.toString() || "";
    });
    setScores(initialScores);
  };

  const handleSubmitScores = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scoringMatch || saving) return;
    try {
      setSaving(true);
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
      alert(err.response?.data?.message || "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const getTeamName = (teamId: number) => teams.find((t) => t.id === teamId)?.name || "Équipe inconnue";
  const getTeamColor = (teamId: number) => teams.find((t) => t.id === teamId)?.color || "#888";
  const getGameName = (gameId: number) => games.find((g) => g.id === gameId)?.name || "Jeu inconnu";

  const drawGame = games.find((g) => g.id === drawGameId);

  const toggleTeam = (teamId: number) => {
    setSelectedTeamIds((prev) => (prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]));
  };

  const handleGenerateRoundRobin = async () => {
    if (!drawGameId || selectedTeamIds.length < (drawGame?.teamsPerMatch || 2)) {
      alert(`Sélectionnez au moins ${drawGame?.teamsPerMatch || 2} équipes`);
      return;
    }
    if (generating) return;
    try {
      setGenerating(true);
      const draws = await drawsService.generateRoundRobin({
        gameId: drawGameId,
        teamIds: selectedTeamIds,
        numberOfMatches,
        teamsPerMatch: drawGame!.teamsPerMatch,
      });
      setRoundRobinDraws(draws);
      setBracketDraws([]);
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de la génération");
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateBracket = async () => {
    if (!drawGameId || selectedTeamIds.length < 2) {
      alert("Sélectionnez au moins 2 équipes");
      return;
    }
    if (generating) return;
    try {
      setGenerating(true);
      const draws = await drawsService.generateBracket({
        gameId: drawGameId,
        teamIds: selectedTeamIds,
        useSeeding: false,
      });
      setBracketDraws(draws);
      setRoundRobinDraws([]);
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de la génération");
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateMatches = async () => {
    if (!drawGameId) return;
    const isRoundRobin = drawGame?.gameFormat === GameFormat.ROUND_ROBIN;
    const draws = isRoundRobin ? roundRobinDraws : bracketDraws;
    if (draws.length === 0) {
      alert("Générez d'abord un tirage");
      return;
    }
    if (!confirm(`Créer ${draws.length} matchs ?`)) return;
    if (creating) return;
    try {
      setCreating(true);
      for (const draw of draws) {
        await matchesService.create({
          gameId: drawGameId,
          matchNumber: draw.matchNumber,
          teamIds: draw.teamIds,
          round: "round" in draw ? draw.round : undefined,
          bracketPosition: "bracketPosition" in draw ? draw.bracketPosition : undefined,
        });
      }
      alert("Matchs créés avec succès !");
      setRoundRobinDraws([]);
      setBracketDraws([]);
      setSelectedTeamIds([]);
      setShowDrawPanel(false);
      await loadMatches();
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de la création");
    } finally {
      setCreating(false);
    }
  };

  const getStatusBadge = (status: MatchStatus) => {
    const map = {
      [MatchStatus.PENDING]: { label: "En attente", cls: "bg-zinc-500/20 text-zinc-400" },
      [MatchStatus.IN_PROGRESS]: { label: "En cours", cls: "bg-blue-500/20 text-blue-400" },
      [MatchStatus.COMPLETED]: { label: "Terminé", cls: "bg-emerald-500/20 text-emerald-400" },
    };
    const { label, cls } = map[status];
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{label}</span>;
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={loadMatches} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Select
            value={selectedGameId?.toString() || "all"}
            onChange={(e) => setSelectedGameId(e.target.value === "all" ? null : parseInt(e.target.value))}
            className="mb-0"
          >
            <option value="all">Tous les jeux</option>
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </Select>
        </div>
        <Button onClick={() => setShowDrawPanel(!showDrawPanel)}>
          {showDrawPanel ? "Masquer tirage" : "+ Tirage au sort"}
        </Button>
      </div>

      {/* Draw panel */}
      {showDrawPanel && (
        <div className="bg-surface-100 border border-surface-border rounded-2xl p-6 mb-6">
          <h3 className="text-white font-semibold mb-4">Tirage au sort</h3>

          <div className="mb-4">
            <Select
              label="Épreuve"
              value={drawGameId?.toString() || ""}
              onChange={(e) => {
                setDrawGameId(e.target.value ? parseInt(e.target.value) : null);
                setSelectedTeamIds([]);
                setRoundRobinDraws([]);
                setBracketDraws([]);
              }}
            >
              <option value="">-- Choisir une épreuve --</option>
              {games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.name}
                </option>
              ))}
            </Select>
          </div>

          {drawGameId && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Équipes ({selectedTeamIds.length} sélectionnées)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {teams.map((team) => (
                    <button
                      key={team.id}
                      onClick={() => toggleTeam(team.id)}
                      className={`p-2.5 rounded-lg border text-sm transition-all flex items-center gap-2 ${
                        selectedTeamIds.includes(team.id)
                          ? "border-primary-500 bg-primary-500/10 text-white"
                          : "border-surface-border text-zinc-400 hover:border-surface-border-light hover:text-white"
                      }`}
                    >
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: team.color }} />
                      <span className="truncate">{team.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {drawGame?.gameFormat === GameFormat.ROUND_ROBIN ? (
                <div className="flex items-end gap-3 mb-4">
                  <Input
                    label="Nombre de matchs"
                    type="number"
                    min="1"
                    value={numberOfMatches}
                    onChange={(e) => setNumberOfMatches(parseInt(e.target.value))}
                    className="w-40 mb-0"
                  />
                  <Button onClick={handleGenerateRoundRobin} disabled={generating}>
                    {generating ? "Génération..." : "Générer Round-Robin"}
                  </Button>
                </div>
              ) : (
                <div className="mb-4">
                  <Button onClick={handleGenerateBracket} disabled={generating}>
                    {generating ? "Génération..." : "Générer Bracket"}
                  </Button>
                </div>
              )}

              {(roundRobinDraws.length > 0 || bracketDraws.length > 0) && (
                <div className="bg-surface-300 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white text-sm font-medium">
                      {roundRobinDraws.length || bracketDraws.length} matchs générés
                    </span>
                    <Button variant="success" onClick={handleCreateMatches} disabled={creating}>
                      {creating ? "Création..." : "Créer les matchs"}
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {roundRobinDraws.map((draw) => (
                      <div key={draw.matchNumber} className="flex items-center gap-3 text-sm text-zinc-400">
                        <span className="text-zinc-600">#{draw.matchNumber}</span>
                        {draw.teamIds.map((tid) => (
                          <span key={tid} className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getTeamColor(tid) }} />
                            {getTeamName(tid)}
                          </span>
                        ))}
                      </div>
                    ))}
                    {bracketDraws.map((draw) => (
                      <div key={draw.matchNumber} className="flex items-center gap-3 text-sm text-zinc-400">
                        <span className="text-zinc-600">#{draw.matchNumber}</span>
                        <span className="text-zinc-600 text-xs">R{draw.round}</span>
                        {draw.isBye ? (
                          <span className="italic">Bye</span>
                        ) : (
                          draw.teamIds.map((tid) => (
                            <span key={tid} className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getTeamColor(tid) }} />
                              {getTeamName(tid)}
                            </span>
                          ))
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Matches list */}
      {matches.length === 0 ? (
        <div className="bg-surface-100 border border-surface-border rounded-2xl p-12 text-center">
          <p className="text-zinc-500">Aucun match pour le moment</p>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => (
            <div key={match.id} className="bg-surface-100 border border-surface-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-white font-medium text-sm">
                    {getGameName(match.gameId)} — Match #{match.matchNumber}
                  </span>
                  {getStatusBadge(match.status)}
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" onClick={() => handleOpenScoring(match)} className="text-xs">
                    {match.status === MatchStatus.COMPLETED ? "Voir scores" : "Scores"}
                  </Button>
                  <Button variant="danger" onClick={() => handleDeleteMatch(match.id)} className="text-xs">
                    Supprimer
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {match.matchTeams
                  .sort((a, b) => (a.rank || 999) - (b.rank || 999))
                  .map((mt) => (
                    <div
                      key={mt.id}
                      className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 border text-xs ${
                        mt.rank === 1
                          ? "bg-primary-500/10 border-primary-500/30"
                          : "bg-surface-400 border-surface-border"
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getTeamColor(mt.teamId) }} />
                      <span className="text-zinc-300">{getTeamName(mt.teamId)}</span>
                      {mt.rawScore != null && <span className="text-primary-400 font-bold">{mt.rawScore}</span>}
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
          title={`Scores — ${getGameName(scoringMatch.gameId)} #${scoringMatch.matchNumber}`}
        >
          <form onSubmit={handleSubmitScores}>
            <div className="space-y-3 mb-6">
              {scoringMatch.matchTeams.map((mt) => (
                <div key={mt.teamId}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getTeamColor(mt.teamId) }} />
                    <label className="text-zinc-200 text-sm font-medium">{getTeamName(mt.teamId)}</label>
                  </div>
                  <Input
                    type="number"
                    step="0.01"
                    value={scores[mt.teamId] || ""}
                    onChange={(e) => setScores({ ...scores, [mt.teamId]: e.target.value })}
                    placeholder="Score"
                    required
                    disabled={scoringMatch.status === MatchStatus.COMPLETED}
                  />
                  {mt.rank && (
                    <p className="text-xs text-zinc-500 -mt-3">
                      Rang: {mt.rank} — Points: {mt.points}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              {scoringMatch.status !== MatchStatus.COMPLETED && (
                <Button type="submit" className="flex-1" disabled={saving}>
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </Button>
              )}
              <Button
                type="button"
                variant="secondary"
                onClick={() => setScoringMatch(null)}
                className="flex-1"
                disabled={saving}
              >
                {scoringMatch.status === MatchStatus.COMPLETED ? "Fermer" : "Annuler"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
