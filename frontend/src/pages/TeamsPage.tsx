import { useEffect, useState } from 'react';
import { teamsService } from '../services';
import { Team, CreateTeamDto } from '../types';
import { Loading, ErrorMessage, Button, Input, Modal } from '../components';

export function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState<CreateTeamDto>({
    name: '',
    color: '#3B82F6',
  });

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const data = await teamsService.getAll();
      setTeams(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des équipes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTeam) {
        await teamsService.update(editingTeam.id, formData);
      } else {
        await teamsService.create(formData);
      }
      await loadTeams();
      handleCloseModal();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette équipe ?')) return;
    try {
      await teamsService.delete(id);
      await loadTeams();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleOpenModal = (team?: Team) => {
    if (team) {
      setEditingTeam(team);
      setFormData({ name: team.name, color: team.color });
    } else {
      setEditingTeam(null);
      setFormData({ name: '', color: '#3B82F6' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTeam(null);
    setFormData({ name: '', color: '#3B82F6' });
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={loadTeams} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Équipes</h1>
        <Button onClick={() => handleOpenModal()}>
          + Nouvelle équipe
        </Button>
      </div>

      {teams.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 mb-4">Aucune équipe pour le moment</p>
          <Button onClick={() => handleOpenModal()}>Créer la première équipe</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div
              key={team.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: team.color }}
                  ></div>
                  <h3 className="text-lg font-semibold">{team.name}</h3>
                </div>
              </div>

              <div className="flex space-x-2 mt-4">
                <Button
                  variant="secondary"
                  onClick={() => handleOpenModal(team)}
                  className="flex-1"
                >
                  Modifier
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(team.id)}
                  className="flex-1"
                >
                  Supprimer
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTeam ? 'Modifier l\'équipe' : 'Nouvelle équipe'}
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Nom de l'équipe"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Ex: Les Lions"
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Couleur
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-12 h-12 rounded cursor-pointer"
              />
              <Input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="#3B82F6"
                className="flex-1"
              />
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <Button type="submit" className="flex-1">
              {editingTeam ? 'Mettre à jour' : 'Créer'}
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
