import { BowArrow, ClipboardList, Users } from "lucide-react";
import { useState } from "react";
import { GamesSettings } from "./settings/GamesSettings";
import { MatchesSettingsSimple } from "./settings/MatchesSettingsSimple";
import { TeamsSettings } from "./settings/TeamsSettings";

type Tab = "teams" | "games" | "matches";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("teams");

  const tabs: { id: Tab; label: string; Icon: any }[] = [
    { id: "teams", label: "Équipes", Icon: Users },
    { id: "games", label: "Épreuves", Icon: BowArrow },
    { id: "matches", label: "Rencontres", Icon: ClipboardList },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Paramètres</h1>
        <p className="text-zinc-500 text-sm mt-1">Gérer les équipes, les épreuves et les rencontres</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-100 border border-surface-border rounded-xl p-1 w-fit mb-8">
        {tabs.map((tab) => {
          const IconComponent = tab.Icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <IconComponent className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "teams" && <TeamsSettings />}
      {activeTab === "games" && <GamesSettings />}
      {activeTab === "matches" && <MatchesSettingsSimple />}
    </div>
  );
}
