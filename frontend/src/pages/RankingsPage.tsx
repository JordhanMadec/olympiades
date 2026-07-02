import React, { useEffect, useState } from 'react';
import { rankingsService } from '../services/rankings.service';
import type { TeamRanking, GameRanking } from '../types';
import { Spinner } from '../components/StatusComponents';

const MEDAL_ICONS = ['🥇', '🥈', '🥉'];

const RankingTable: React.FC<{ rankings: TeamRanking[] }> = ({ rankings }) => (
  <table className="w-full text-sm">
    <thead>
      <tr className="border-b border-gray-100">
        <th className="text-left py-2 text-gray-500 font-medium w-12">#</th>
        <th className="text-left py-2 text-gray-500 font-medium">Équipe</th>
        <th className="text-right py-2 text-gray-500 font-medium">Matchs</th>
        <th className="text-right py-2 text-gray-500 font-medium">Points</th>
      </tr>
    </thead>
    <tbody>
      {rankings.map((r) => (
        <tr key={r.team.id} className="border-b border-gray-50 hover:bg-gray-50">
          <td className="py-2.5 font-bold text-gray-700">
            {r.rank <= 3 ? MEDAL_ICONS[r.rank - 1] : r.rank}
          </td>
          <td className="py-2.5">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: r.team.color }}
              />
              <span className="font-medium text-gray-800">{r.team.name}</span>
            </div>
          </td>
          <td className="py-2.5 text-right text-gray-500">{r.matchesPlayed}</td>
          <td className="py-2.5 text-right font-bold text-indigo-600">{r.totalPoints}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export const RankingsPage: React.FC = () => {
  const [global, setGlobal] = useState<TeamRanking[]>([]);
  const [gameRankings, setGameRankings] = useState<GameRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'global' | 'games'>('global');

  const load = () =>
    Promise.all([rankingsService.getGlobal(), rankingsService.getAllGames()])
      .then(([g, gr]) => { setGlobal(g); setGameRankings(gr); })
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">🏆 Classements</h1>
        <button
          onClick={() => { setLoading(true); load(); }}
          className="text-sm text-gray-500 hover:text-indigo-600 border border-gray-300 rounded-lg px-3 py-1.5"
        >
          🔄 Actualiser
        </button>
      </div>

      <div className="flex gap-2">
        {(['global', 'games'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              tab === t
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t === 'global' ? '🌍 Général' : '🎮 Par jeu'}
          </button>
        ))}
      </div>

      {tab === 'global' ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Classement général</h2>
          {global.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucun résultat pour l'instant.</p>
          ) : (
            <RankingTable rankings={global} />
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {gameRankings.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucun jeu avec résultats.</p>
          ) : (
            gameRankings
              .filter((gr) => gr.rankings.length > 0)
              .map((gr) => (
                <div key={gr.game.id} className="bg-white border border-gray-200 rounded-xl p-6">
                  <h2 className="font-semibold text-gray-900 mb-4">{gr.game.name}</h2>
                  <RankingTable rankings={gr.rankings} />
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
};
