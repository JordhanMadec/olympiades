import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { teamsService } from '../services/teams.service';
import { gamesService } from '../services/games.service';
import { matchesService } from '../services/matches.service';
import { rankingsService } from '../services/rankings.service';
import type { TeamRanking } from '../types';

export const HomePage: React.FC = () => {
  const [stats, setStats] = useState({ teams: 0, games: 0, matches: 0, completed: 0 });
  const [topRankings, setTopRankings] = useState<TeamRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      teamsService.getAll(),
      gamesService.getAll(),
      matchesService.getAll(),
      rankingsService.getGlobal(),
    ])
      .then(([teams, games, matches, rankings]) => {
        setStats({
          teams: teams.length,
          games: games.length,
          matches: matches.length,
          completed: matches.filter((m) => m.status === 'COMPLETED').length,
        });
        setTopRankings(rankings.slice(0, 3));
      })
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { to: '/teams', icon: '👥', label: 'Équipes', value: stats.teams, color: 'bg-blue-500' },
    { to: '/games', icon: '🎮', label: 'Jeux', value: stats.games, color: 'bg-purple-500' },
    { to: '/matches', icon: '⚔️', label: 'Matchs', value: stats.matches, color: 'bg-orange-500' },
    { to: '/matches', icon: '✅', label: 'Terminés', value: stats.completed, color: 'bg-green-500' },
  ];

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">🏅 Olympiades</h1>
        <p className="mt-1 text-gray-500">Tableau de bord général</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.to}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div
              className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center text-white text-lg mb-3`}
            >
              {card.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? '—' : card.value}
            </p>
            <p className="text-sm text-gray-500">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">🏆 Classement général</h2>
        {loading ? (
          <p className="text-gray-400">Chargement…</p>
        ) : topRankings.length === 0 ? (
          <p className="text-gray-400">Aucun résultat encore. Commencez par créer des équipes !</p>
        ) : (
          <div className="space-y-3">
            {topRankings.map((r, i) => (
              <div key={r.team.id} className="flex items-center gap-3">
                <span className="text-2xl">{medals[i]}</span>
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: r.team.color }}
                />
                <span className="flex-1 font-medium text-gray-800">{r.team.name}</span>
                <span className="font-bold text-indigo-600">{r.totalPoints} pts</span>
              </div>
            ))}
          </div>
        )}
        <Link
          to="/rankings"
          className="mt-4 inline-block text-sm text-indigo-600 hover:underline"
        >
          Voir le classement complet →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { to: '/draws', icon: '🎲', title: 'Générer un tirage', desc: 'Round-robin ou élimination directe' },
          { to: '/matches', icon: '⚔️', title: 'Saisir des scores', desc: 'Entrer les résultats des matchs' },
          { to: '/slideshow', icon: '📺', title: 'Lancer le diaporama', desc: 'Affichage plein écran pour le public' },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow flex gap-4 items-start"
          >
            <span className="text-3xl">{item.icon}</span>
            <div>
              <p className="font-semibold text-gray-900">{item.title}</p>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
