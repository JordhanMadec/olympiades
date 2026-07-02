import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: '🏠 Accueil', end: true },
  { to: '/teams', label: '👥 Équipes' },
  { to: '/games', label: '🎮 Jeux' },
  { to: '/matches', label: '⚔️ Matchs' },
  { to: '/draws', label: '🎲 Tirages' },
  { to: '/rankings', label: '🏆 Classements' },
  { to: '/slideshow', label: '📺 Diaporama' },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <span className="text-xl font-bold text-indigo-700">🏅 Olympiades</span>
          <div className="flex gap-1 overflow-x-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
    <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">{children}</main>
  </div>
);
