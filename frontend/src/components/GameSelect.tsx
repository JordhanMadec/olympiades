import { ChevronDown } from "lucide-react";
import { Game } from "../types";

interface GameSelectProps {
  games: Game[];
  selectedGameId: number | null;
  onChange: (gameId: number | null) => void;
  label?: string;
  showAllOption?: boolean;
  allOptionLabel?: string;
}

export function GameSelect({
  games,
  selectedGameId,
  onChange,
  label = "Épreuve",
  showAllOption = true,
  allOptionLabel = "Toutes les épreuves",
}: GameSelectProps) {
  return (
    <div className="relative">
      {label && <label className="block text-sm font-medium text-zinc-400 mb-2">{label}</label>}
      <div className="relative">
        <select
          value={selectedGameId?.toString() || "all"}
          onChange={(e) => onChange(e.target.value === "all" ? null : parseInt(e.target.value))}
          className="w-full appearance-none bg-surface-100 border border-surface-border rounded-xl px-4 py-2 pr-10 text-white text-sm font-medium cursor-pointer hover:bg-surface-200 focus:outline-none focus:ring-2 transition-all"
        >
          {showAllOption && <option value="all">{allOptionLabel}</option>}
          {games.map((game) => (
            <option key={game.id} value={game.id}>
              {game.name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
      </div>
    </div>
  );
}
