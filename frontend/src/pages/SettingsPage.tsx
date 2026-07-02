import { useState } from 'react';
import { TeamsSettings } from './settings/TeamsSettings';
import { GamesSettings } from './settings/GamesSettings';
import { MatchesSettings } from './settings/MatchesSettings';

type Tab = 'teams' | 'games' | 'matches';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('teams');

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'teams', label: 'Équipes', icon: '👥' },
    { id: 'games', label: 'Épreuves', icon: '🎮' },
    { id: 'matches', label: 'Rencontres', icon: '📋' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Paramètres</h1>
        <p className="text-zinc-500 text-sm mt-1">Gérer les équipes, les épreuves et les rencontres</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-100 border border-surface-border rounded-xl p-1 w-fit mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'teams' && <TeamsSettings />}
      {activeTab === 'games' && <GamesSettings />}
      {activeTab === 'matches' && <MatchesSettings />}
    </div>
  );
}
