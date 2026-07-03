import { Pen, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Card, ErrorMessage, Input, Loading, Modal, Select, Textarea } from "../../components";
import { gamesService } from "../../services";
import { CreateGameDto, Game, GameFormat, GameType, ScoringDirection } from "../../types";

export function GamesSettings() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [formData, setFormData] = useState<CreateGameDto>({
    name: "",
    description: "",
    gameType: GameType.TIME,
    gameFormat: GameFormat.ROUND_ROBIN,
    scoringDirection: ScoringDirection.ASC,
    teamsPerMatch: 1,
    unit: undefined,
    winPoints: undefined,
  });

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
      setError("Erreur lors du chargement des épreuves");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    try {
      setSaving(true);
      if (editingGame) {
        await gamesService.update(editingGame.id, formData);
      } else {
        await gamesService.create(formData);
      }
      await loadGames();
      handleCloseModal();
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce jeu ?")) return;
    if (saving) return;
    try {
      setSaving(true);
      await gamesService.delete(id);
      await loadGames();
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de la suppression");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenModal = (game?: Game) => {
    if (game) {
      setEditingGame(game);
      setFormData({
        name: game.name,
        description: game.description,
        gameType: game.gameType,
        gameFormat: game.gameFormat,
        scoringDirection: game.scoringDirection,
        teamsPerMatch: game.teamsPerMatch,
        unit: game.unit,
        winPoints: game.winPoints,
      });
    } else {
      setEditingGame(null);
      setFormData({
        name: "",
        description: "",
        gameType: GameType.TIME,
        gameFormat: GameFormat.ROUND_ROBIN,
        scoringDirection: ScoringDirection.ASC,
        teamsPerMatch: 1,
        unit: undefined,
        winPoints: 10, // Default win points for SCORE games
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGame(null);
  };

  const getTypeLabel = (type: GameType) => {
    return {
      [GameType.TIME]: "Meilleurs temps",
      [GameType.SCORE]: "Match 1V1",
      [GameType.POINTS]: "Meilleur score",
    }[type];
  };

  const getFormatLabel = (format: GameFormat) => {
    return format === GameFormat.ROUND_ROBIN ? "Round-Robin" : "Élimination directe";
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={loadGames} />;

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <div className="font-bold">Épreuves</div>
          <p className="text-zinc-400 text-sm">
            {games.length} épreuve{games.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>+ Nouvelle épreuve</Button>
      </div>

      {games.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-zinc-500">Aucune épreuve pour le moment</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {games.map((game) => {
            const typeLabel = getTypeLabel(game.gameType);
            return (
              <Card key={game.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium mb-1">{game.name}</h3>
                    {game.description && <p className="text-zinc-400 text-sm mb-3">{game.description}</p>}
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-0.5 bg-primary-500/10 text-primary-400 rounded text-xs border border-primary-500/20 flex items-center gap-1">
                        {typeLabel}
                      </span>
                      <span className="px-2 py-0.5 bg-primary-500/10 text-primary-400 rounded text-xs border border-primary-500/20 flex items-center gap-1">
                        {getFormatLabel(game.gameFormat)}
                      </span>
                      <span className="px-2 py-0.5 bg-primary-500/10 text-primary-400 rounded text-xs border border-primary-500/20 flex items-center gap-1">
                        {game.teamsPerMatch} participants
                      </span>
                      {game.winPoints && (
                        <span className="px-2 py-0.5 bg-primary-500/10 text-primary-400 rounded text-xs border border-primary-500/20 flex items-center gap-1">
                          {game.winPoints} points
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="secondary" size="small" onClick={() => handleOpenModal(game)} className="text-xs">
                      <Pen className="h-4 w-4" />
                    </Button>
                    <Button variant="danger" size="small" onClick={() => handleDelete(game.id)} className="text-xs">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingGame ? "Modifier l'épreuve" : "Nouvelle épreuve"}
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Nom"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Ex: Course en sac"
          />
          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            placeholder="Courte description"
            rows={2}
          />
          <Select
            label="Type de scoring"
            value={formData.gameType}
            onChange={(e) => {
              const gameType = e.target.value as GameType;
              let newData: Partial<CreateGameDto> = { gameType };

              // Auto-set scoring direction
              if (gameType === GameType.TIME) {
                newData.scoringDirection = ScoringDirection.ASC;
              } else {
                newData.scoringDirection = ScoringDirection.DESC;
              }

              // Auto-set format based on game type
              if (gameType === GameType.SCORE) {
                newData.gameFormat = GameFormat.ELIMINATION;
                newData.teamsPerMatch = 2;
                if (!formData.winPoints) {
                  newData.winPoints = 10;
                }
              } else {
                // TIME or POINTS
                newData.gameFormat = GameFormat.ROUND_ROBIN;
              }

              setFormData({ ...formData, ...newData });
            }}
            required
          >
            <option value={GameType.TIME}>Meilleur temps</option>
            <option value={GameType.SCORE}>Match 1V1</option>
            <option value={GameType.POINTS}>Meilleur score (ex: mL, kg, ...)</option>
          </Select>

          <Select
            label="Format"
            value={formData.gameFormat}
            onChange={(e) => setFormData({ ...formData, gameFormat: e.target.value as GameFormat })}
            required
            disabled={
              formData.gameType === GameType.SCORE ||
              formData.gameType === GameType.TIME ||
              formData.gameType === GameType.POINTS
            }
            title={
              formData.gameType === GameType.SCORE
                ? "Les jeux de type SCORE sont toujours en élimination directe"
                : formData.gameType === GameType.TIME || formData.gameType === GameType.POINTS
                  ? "Les jeux de type TEMPS et QUANTITÉ sont toujours en round-robin"
                  : ""
            }
          >
            <option value={GameFormat.ROUND_ROBIN}>Round-Robin (tous contre tous)</option>
            <option value={GameFormat.ELIMINATION}>Élimination directe (bracket)</option>
          </Select>

          <Input
            label="Équipes par match"
            type="number"
            min={formData.gameType === GameType.TIME || formData.gameType === GameType.POINTS ? "1" : "2"}
            value={formData.teamsPerMatch}
            onChange={(e) => setFormData({ ...formData, teamsPerMatch: parseInt(e.target.value) })}
            required
            disabled={formData.gameType === GameType.SCORE}
            title={formData.gameType === GameType.SCORE ? "Les jeux de type SCORE ont toujours 2 équipes" : ""}
            helperText={
              formData.gameType === GameType.TIME || formData.gameType === GameType.POINTS
                ? "Peut être 1 pour les jeux acceptant un seul participant"
                : undefined
            }
          />

          {formData.gameType === GameType.SCORE && (
            <Input
              label="Points pour une victoire"
              type="number"
              min="1"
              value={formData.winPoints || 10}
              onChange={(e) => setFormData({ ...formData, winPoints: parseInt(e.target.value) })}
              required
              helperText="Points attribués au vainqueur (et aux byes). Le perdant reçoit 0 points."
            />
          )}

          {formData.gameType === GameType.POINTS && (
            <Input
              label="Unité"
              type="text"
              value={formData.unit || ""}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              placeholder="Ex: mL, kg, m, ..."
              helperText="Unité de mesure pour afficher les résultats (optionnel)"
            />
          )}
          <div className="flex gap-3 mt-6">
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? "Enregistrement..." : editingGame ? "Mettre à jour" : "Créer"}
            </Button>
            <Button type="button" variant="secondary" onClick={handleCloseModal} className="flex-1" disabled={saving}>
              Annuler
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
