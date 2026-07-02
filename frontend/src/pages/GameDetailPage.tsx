import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { gamesService, rankingsService, matchesService, teamsService } from '../services';
import { Game, GameRanking, Match, Team, MatchStatus, GameType } from '../types';
import { Loading, ErrorMessage } from '../components';

export function GameDetailPage() {
  const { id } = useParams<{ id: string }>();
  const gameId = parseInt(id!);

  const [game, setGame] = useState<Game | null>(null);
  const [ranking, setRanking] = useState<GameRanking | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [gameId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [gamesData, rankingData, matchesData, teamsData] = await Promise.all([
        gamesService.getAll(),
        rankingsService.getRankingByGame(gameId),
        matchesService.getAll(gameId),
        teamsService.getAll(),
      ]);
      const found = gamesData.find((g) => g.id === gameId);
      if (!found) {
        setError('Épreuve introuvable');
        return;
      }
      setGame(found);
      setRanking(rankingData);
      setMatches(matchesData);
      setTeams(teamsData);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTeamName = (teamId: number) => teams.find((t) => t.id === teamId)?.name || 'Équipe inconnue';
  const getTeamColor = (teamId: number) => teams.find((t) => t.id === teamId)?.color || '#888';

  const getStatusBadge = (status: MatchStatus) => {
    const map = {
      [MatchStatus.PENDING]: { label: 'En attente', cls: 'bg-zinc-500/20 text-zinc-400' },
      [MatchStatus.IN_PROGRESS]: { label: 'En cours', cls: 'bg-blue-500/20 text-blue-400' },
      [MatchStatus.COMPLETED]: { label: 'Terminé', cls: 'bg-emerald-500/20 text-emerald-400' },
    };
    const { label, cls } = map[status];
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{label}</span>;
  };

  const getTypeLabel = (type: GameType) => {
    const map = { [GameType.TIME]: 'Temps', [GameType.SCORE]: 'Score', [GameType.POINTS]: 'Points' };
    return map[type];
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!game) return null;

  return (
    <div>
      {/* Back */}
      <Link to="/games" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm mb-6 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Retour aux épreuves
      </Link>

      {/* Game header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{game.name}</h1>
        <div className="flex items-center gap-3 mt-2">
          <span className="px-2.5 py-1 bg-primary-500/15 text-primary-400 rounded-lg text-xs font-medium border border-primary-500/20">
            {getTypeLabel(game.gameType)}
          </span>
          <span className="px-2.5 py-1 bg-surface-300 text-zinc-400 rounded-lg text-xs font-medium border border-surface-border">
            {game.gameFormat === 'ROUND_ROBIN' ? 'Round-Robin' : 'Élimination'}
          </span>
          <span className="px-2.5 py-1 bg-surface-300 text-zinc-400 rounded-lg text-xs font-medium border border-surface-border">
            {game.teamsPerMatch} équipes/match
          </span>
        </div>
        {game.description && (
          <p className="text-zinc-500 text-sm mt-3">{game.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ranking */}
        <div>
          <h2 className="text-base font-semibold text-white mb-4">Classement</h2>
          <div className="bg-surface-200 border border-surface-border rounded-2xl overflow-hidden">
            {!ranking || ranking.entries.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-zinc-500 text-sm">Aucun résultat</p>
              </div>
            ) : (
              <div className="divide-y divide-surface-border">
                {ranking.entries.map((entry, index) => (
                  <div key={entry.teamId} className="flex items-center gap-4 px-5 py-3 hover:bg-surface-300 transition-colors">
                    <span className="text-lg w-7 text-center">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : <span className="text-zinc-500 text-sm font-bold">{index + 1}</span>}
                    </span>
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: entry.teamColor }}
                    />
                    <span className="text-white font-medium flex-1">{entry.teamName}</span>
                    <span className="text-primary-400 font-bold">{entry.totalPoints} pts</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Matches */}
        <div>
          <h2 className="text-base font-semibold text-white mb-4">Rencontres ({matches.length})</h2>
          {matches.length === 0 ? (
            <div className="bg-surface-200 border border-surface-border rounded-2xl p-10 text-center">
              <p className="text-zinc-500 text-sm">Aucune rencontre</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {matches.map((match) => (
                <div key={match.id} className="bg-surface-200 border border-surface-border rounded-xl p-4 hover:border-surface-border-light transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm font-medium">Match #{match.matchNumber}</span>
                    {getStatusBadge(match.status)}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {match.matchTeams
                      .sort((a, b) => (a.rank || 999) - (b.rank || 999))
                      .map((mt) => (
                        <div key={mt.id} className="flex items-center gap-1.5 bg-surface-400 rounded-lg px-2.5 py-1.5">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: getTeamColor(mt.teamId) }}
                          />
                          <span className="text-zinc-300 text-xs">{getTeamName(mt.teamId)}</span>
                          {mt.rawScore != null && (
                            <span className="text-primary-400 text-xs font-bold ml-1">{mt.rawScore}</span>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
