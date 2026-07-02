import { useEffect, useState } from 'react';
import { teamsService } from '../../services';
import { Team, CreateTeamDto } from '../../types';
import { Loading, ErrorMessage, Button, Input, Modal } from '../../components';

export function TeamsSettings() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState<CreateTeamDto>({ name: '', color: '#f97316' });

  useEffect(() => { loadTeams(); }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const data = await teamsService.getAll();
      setTeams(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des équipes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    try {
      setSaving(true);
      if (editingTeam) {
        await teamsService.update(editingTeam.id, formData);
      } else {
        await teamsService.create(formData);
      }
      await loadTeams();
      handleCloseModal();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette équipe ?')) return;
    if (saving) return;
    try {
      setSaving(true);
      await teamsService.delete(id);
      await loadTeams();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenModal = (team?: Team) => {
    if (team) {
      setEditingTeam(team);
      setFormData({ name: team.name, color: team.color });
    } else {
      setEditingTeam(null);
      setFormData({ name: '', color: '#f97316' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTeam(null);
    setFormData({ name: '', color: '#f97316' });
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={loadTeams} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-zinc-400 text-sm">{teams.length} équipe{teams.length !== 1 ? 's' : ''}</p>
        <Button onClick={() => handleOpenModal()}>+ Nouvelle équipe</Button>
      </div>

      {teams.length === 0 ? (
        <div className="bg-surface-200 border border-surface-border rounded-2xl p-12 text-center">
          <p className="text-zinc-500">Aucune équipe pour le moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <div key={team.id} className="bg-surface-200 border border-surface-border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: team.color }} />
                <h3 className="text-white font-medium">{team.name}</h3>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => handleOpenModal(team)} className="flex-1 text-xs">
                  Modifier
                </Button>
                <Button variant="danger" onClick={() => handleDelete(team.id)} className="flex-1 text-xs">
                  Supprimer
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingTeam ? "Modifier l'équipe" : 'Nouvelle équipe'}>
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
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Couleur</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-11 h-11 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <Input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="#f97316"
                className="flex-1"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? 'Enregistrement...' : editingTeam ? 'Mettre à jour' : 'Créer'}
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
