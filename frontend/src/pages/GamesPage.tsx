import { useEffect, useState } from 'react';
import { gamesService } from '../services';
import { Game, CreateGameDto, GameType, GameFormat, ScoringDirection } from '../types';
import { Loading, ErrorMessage, Button, Input, Select, Textarea, Modal } from '../components';

export function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [formData, setFormData] = useState<CreateGameDto>({
    name: '',
    description: '',
    rules: '',
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
      setError('Erreur lors du chargement des jeux');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGame) {
        await gamesService.update(editingGame.id, formData);
      } else {
        await gamesService.create(formData);
      }
      await loadGames();
      handleCloseModal();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce jeu ?')) return;
    try {
      await gamesService.delete(id);
      await loadGames();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
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
        name: '',
        description: '',
        rules: '',
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

  const getGameTypeLabel = (type: GameType) => {
    const labels = {
      [GameType.TIME]: '⏱️ Temps',
      [GameType.SCORE]: '⚽ Score',
      [GameType.POINTS]: '🎯 Points',
    };
    return labels[type];
  };

  const getGameFormatLabel = (format: GameFormat) => {
    const labels = {
      [GameFormat.ROUND_ROBIN]: 'Round-Robin',
      [GameFormat.ELIMINATION]: 'Élimination directe',
    };
    return labels[format];
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={loadGames} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Jeux</h1>
        <Button onClick={() => handleOpenModal()}>
          + Nouveau jeu
        </Button>
      </div>

      {games.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 mb-4">Aucun jeu pour le moment</p>
          <Button onClick={() => handleOpenModal()}>Créer le premier jeu</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {games.map((game) => (
            <div
              key={game.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{game.name}</h3>
                  <p className="text-gray-600 mb-3">{game.description}</p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {getGameTypeLabel(game.gameType)}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {getGameFormatLabel(game.gameFormat)}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      {game.teamsPerMatch} équipes/match
                    </span>
                  </div>

                  {game.rules && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium">
                        Voir les règles
                      </summary>
                      <div className="mt-2 p-3 bg-gray-50 rounded text-sm whitespace-pre-wrap">
                        {game.rules}
                      </div>
                    </details>
                  )}
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <Button
                    variant="secondary"
                    onClick={() => handleOpenModal(game)}
                    className="whitespace-nowrap"
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(game.id)}
                    className="whitespace-nowrap"
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingGame ? 'Modifier le jeu' : 'Nouveau jeu'}
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Nom du jeu"
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
            placeholder="Courte description du jeu"
            rows={2}
          />

          <Textarea
            label="Règles"
            value={formData.rules}
            onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
            required
            placeholder="Règles complètes du jeu"
            rows={4}
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
            <option value={GameType.TIME}>⏱️ Temps (meilleur temps gagne)</option>
            <option value={GameType.SCORE}>⚽ Score (plus haut score gagne)</option>
            <option value={GameType.POINTS}>🎯 Points (plus de points gagne)</option>
          </Select>

          <Select
            label="Format du jeu"
            value={formData.gameFormat}
            onChange={(e) => setFormData({ ...formData, gameFormat: e.target.value as GameFormat })}
            required
          >
            <option value={GameFormat.ROUND_ROBIN}>Round-Robin (tous contre tous)</option>
            <option value={GameFormat.ELIMINATION}>Élimination directe (bracket)</option>
          </Select>

          <Input
            label="Nombre d'équipes par match"
            type="number"
            min="2"
            value={formData.teamsPerMatch}
            onChange={(e) => setFormData({ ...formData, teamsPerMatch: parseInt(e.target.value) })}
            required
          />

          <div className="flex space-x-3 mt-6">
            <Button type="submit" className="flex-1">
              {editingGame ? 'Mettre à jour' : 'Créer'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
              className="flex-1"
            >
              Annuler
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
