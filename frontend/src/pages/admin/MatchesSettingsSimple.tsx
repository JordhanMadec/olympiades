import { Dices, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, ErrorMessage, Loading, MatchCard, Modal, ScoreInput, Select } from "../../components";
import { gamesService, matchesService, teamsService } from "../../services";
import { Game, Match, MatchStatus, Team, UpdateScoresDto } from "../../types";

export function MatchesSettingsSimple() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Scoring modal
  const [scoringMatch, setScoringMatch] = useState<Match | null>(null);
  const [scores, setScores] = useState<{ [teamId: number]: string }>({});

  // Create manual match modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createGameId, setCreateGameId] = useState<number | null>(null);
  const [createTeamIds, setCreateTeamIds] = useState<number[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [gamesData, teamsData, matchesData] = await Promise.all([
        gamesService.getAll(),
        teamsService.getAll(),
        matchesService.getAll(),
      ]);
      setGames(gamesData);
      setTeams(teamsData);
      setMatches(matchesData);
      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAll = async () => {
    const hasMatches = matches.length > 0;
    const message = hasMatches
      ? `Cela va supprimer les ${matches.length} rencontre${matches.length > 1 ? "s" : ""} existante${matches.length > 1 ? "s" : ""} et les régénérer. Continuer ?`
      : "Générer toutes les rencontres pour toutes les épreuves ?";

    if (!confirm(message)) return;

    try {
      setSaving(true);
      if (hasMatches) {
        await matchesService.deleteAll();
      }
      const result = await matchesService.generateAll();
      alert(`${result.created} rencontre${result.created > 1 ? "s" : ""} créée${result.created > 1 ? "s" : ""} !`);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de la génération");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createGameId || createTeamIds.length === 0) {
      alert("Sélectionnez une épreuve et au moins une équipe");
      return;
    }

    try {
      setSaving(true);
      const maxMatchNumber = Math.max(0, ...matches.filter((m) => m.gameId === createGameId).map((m) => m.matchNumber));

      await matchesService.create({
        gameId: createGameId,
        matchNumber: maxMatchNumber + 1,
        teamIds: createTeamIds,
      });

      setShowCreateModal(false);
      setCreateGameId(null);
      setCreateTeamIds([]);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de la création");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMatch = async (id: number) => {
    if (!confirm("Supprimer cette rencontre ?")) return;

    try {
      setSaving(true);
      await matchesService.delete(id);
      await loadData();
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
      await loadData();
      setScoringMatch(null);
      setScores({});
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const toggleTeam = (teamId: number) => {
    setCreateTeamIds((prev) => (prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]));
  };

  const getTeamName = (teamId: number) => teams.find((t) => t.id === teamId)?.name || "Équipe inconnue";
  const getTeamColor = (teamId: number) => teams.find((t) => t.id === teamId)?.color || "#888";
  const getGameName = (gameId: number) => games.find((g) => g.id === gameId)?.name || "Jeu inconnu";

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={loadData} />;

  return (
    <div>
      {/* Action buttons */}
      <div className="flex justify-between items-center gap-2 mb-4">
        <div>
          <div className="font-bold">Rencontres</div>
          <div className="text-zinc-500 text-sm">
            {matches.length} rencontre{matches.length > 1 ? "s" : ""}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Créer une rencontre
          </Button>
          <Button onClick={handleGenerateAll} disabled={saving} className="flex items-center gap-2">
            <Dices className={`h-4 w-4 ${saving ? "animate-spin" : ""}`} />
            {saving ? "Génération..." : "Générer les rencontres"}
          </Button>
        </div>
      </div>

      {/* Matches list */}
      {matches.length === 0 ? (
        <div className="bg-surface-100 border border-surface-border rounded-2xl p-12 text-center">
          <p className="text-zinc-500">Aucune rencontre pour le moment</p>
          <p className="text-zinc-600 text-sm mt-2">Cliquez sur "Générer toutes les rencontres" pour commencer</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              teams={teams}
              games={games}
              showGameName
              actions={
                <div className="flex gap-2">
                  <Button variant="primary" size="small" onClick={() => handleOpenScoring(match)}>
                    Scores
                  </Button>
                  <Button variant="danger" size="small" onClick={() => handleDeleteMatch(match.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              }
            ></MatchCard>
          ))}
        </div>
      )}

      {/* Create Manual Match Modal */}
      {showCreateModal && (
        <Modal isOpen={true} onClose={() => setShowCreateModal(false)} title="Créer une rencontre manuellement">
          <form onSubmit={handleCreateManual}>
            <div className="space-y-4 mb-6">
              <Select
                label="Épreuve"
                value={createGameId?.toString() || ""}
                onChange={(e) => {
                  setCreateGameId(e.target.value ? parseInt(e.target.value) : null);
                  setCreateTeamIds([]);
                }}
                required
              >
                <option value="">-- Choisir une épreuve --</option>
                {games.map((game) => (
                  <option key={game.id} value={game.id}>
                    {game.name}
                  </option>
                ))}
              </Select>

              {createGameId && (
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Équipes ({createTeamIds.length} sélectionnée{createTeamIds.length > 1 ? "s" : ""})
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {teams.map((team) => (
                      <button
                        key={team.id}
                        type="button"
                        onClick={() => toggleTeam(team.id)}
                        className={`p-2.5 rounded-lg border text-sm transition-all flex items-center gap-2 ${
                          createTeamIds.includes(team.id)
                            ? "border-primary-500 bg-primary-500/10 text-white"
                            : "border-surface-border text-zinc-400 hover:border-surface-border-light hover:text-white"
                        }`}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: team.color }}
                        />
                        <span className="truncate">{team.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? "Création..." : "Créer"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowCreateModal(false)}
                className="flex-1"
                disabled={saving}
              >
                Annuler
              </Button>
            </div>
          </form>
        </Modal>
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
              {scoringMatch.matchTeams.map((mt) => {
                const game = games.find((g) => g.id === scoringMatch.gameId);
                return (
                  <div key={mt.teamId}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getTeamColor(mt.teamId) }} />
                      <label className="text-zinc-200 text-sm font-medium">{getTeamName(mt.teamId)}</label>
                    </div>
                    {game && (
                      <ScoreInput
                        game={game}
                        value={scores[mt.teamId] ? parseFloat(scores[mt.teamId]) : null}
                        onChange={(val) => setScores({ ...scores, [mt.teamId]: val.toString() })}
                        placeholder="Score"
                      />
                    )}
                    {mt.rank && (
                      <p className="text-xs text-zinc-500 -mt-3">
                        Rang: {mt.rank} — Points: {mt.points}
                      </p>
                    )}
                  </div>
                );
              })}
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
