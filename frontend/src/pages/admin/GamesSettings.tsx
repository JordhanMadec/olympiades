import { Target, Timer } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, ErrorMessage, Input, Loading, Modal, Select, Textarea } from "../../components";
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
    rules: "",
    gameType: GameType.SCORE,
    gameFormat: GameFormat.ROUND_ROBIN,
    scoringDirection: ScoringDirection.DESC,
    teamsPerMatch: 2,
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
        rules: game.rules,
        gameType: game.gameType,
        gameFormat: game.gameFormat,
        scoringDirection: game.scoringDirection,
        teamsPerMatch: game.teamsPerMatch,
      });
    } else {
      setEditingGame(null);
      setFormData({
        name: "",
        description: "",
        rules: "",
        gameType: GameType.SCORE,
        gameFormat: GameFormat.ROUND_ROBIN,
        scoringDirection: ScoringDirection.DESC,
        teamsPerMatch: 2,
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
      [GameType.TIME]: { label: "Temps", Icon: Timer },
      [GameType.SCORE]: { label: "Score", Icon: Target },
      [GameType.POINTS]: { label: "Points", Icon: Target },
    }[type];
  };

  const getFormatLabel = (format: GameFormat) => {
    return format === GameFormat.ROUND_ROBIN ? "Round-Robin" : "Élimination";
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={loadGames} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-zinc-400 text-sm">
          {games.length} épreuve{games.length !== 1 ? "s" : ""}
        </p>
        <Button onClick={() => handleOpenModal()}>+ Nouvelle épreuve</Button>
      </div>

      {games.length === 0 ? (
        <div className="bg-surface-100 border border-surface-border rounded-2xl p-12 text-center">
          <p className="text-zinc-500">Aucune épreuve pour le moment</p>
        </div>
      ) : (
        <div className="space-y-3">
          {games.map((game) => {
            const typeInfo = getTypeLabel(game.gameType);
            const IconComponent = typeInfo.Icon;
            return (
              <div key={game.id} className="bg-surface-100 border border-surface-border rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium mb-1">{game.name}</h3>
                    {game.description && <p className="text-zinc-500 text-sm mb-3">{game.description}</p>}
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-0.5 bg-primary-500/10 text-primary-400 rounded text-xs border border-primary-500/20 flex items-center gap-1">
                        <IconComponent className="h-3 w-3" />
                        {typeInfo.label}
                      </span>
                      <span className="px-2 py-0.5 bg-surface-400 text-zinc-400 rounded text-xs border border-surface-border">
                        {getFormatLabel(game.gameFormat)}
                      </span>
                      <span className="px-2 py-0.5 bg-surface-400 text-zinc-400 rounded text-xs border border-surface-border">
                        {game.teamsPerMatch} éq./match
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="secondary" onClick={() => handleOpenModal(game)} className="text-xs">
                      Modifier
                    </Button>
                    <Button variant="danger" onClick={() => handleDelete(game.id)} className="text-xs">
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
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
          <Textarea
            label="Règles"
            value={formData.rules}
            onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
            required
            placeholder="Règles complètes"
            rows={3}
          />
          <Select
            label="Type de scoring"
            value={formData.gameType}
            onChange={(e) => {
              const gameType = e.target.value as GameType;
              setFormData({
                ...formData,
                gameType,
                scoringDirection: gameType === GameType.TIME ? ScoringDirection.ASC : ScoringDirection.DESC,
              });
            }}
            required
          >
            <option value={GameType.TIME}>Temps (meilleur temps gagne)</option>
            <option value={GameType.SCORE}>Score (plus haut score gagne)</option>
            <option value={GameType.POINTS}>Points (plus de points gagne)</option>
          </Select>
          <Select
            label="Format"
            value={formData.gameFormat}
            onChange={(e) => setFormData({ ...formData, gameFormat: e.target.value as GameFormat })}
            required
          >
            <option value={GameFormat.ROUND_ROBIN}>Round-Robin (tous contre tous)</option>
            <option value={GameFormat.ELIMINATION}>Élimination directe (bracket)</option>
          </Select>
          <Input
            label="Équipes par match"
            type="number"
            min="2"
            value={formData.teamsPerMatch}
            onChange={(e) => setFormData({ ...formData, teamsPerMatch: parseInt(e.target.value) })}
            required
          />
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
