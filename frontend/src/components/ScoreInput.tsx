import React from "react";
import { Game, GameType } from "../types";
import { formatTime, parseTime } from "../utils/formatters";

interface ScoreInputProps {
  game: Game;
  value: number | null;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
}

export const ScoreInput: React.FC<ScoreInputProps> = ({ game, value, onChange, placeholder, className = "" }) => {
  const [timeString, setTimeString] = React.useState("");

  React.useEffect(() => {
    if (game.gameType === GameType.TIME && value !== null) {
      setTimeString(formatTime(value));
    }
  }, [value, game.gameType]);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setTimeString(input);

    // Try to parse and update the value
    const seconds = parseTime(input);
    onChange(seconds);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseFloat(e.target.value) || 0;
    onChange(num);
  };

  if (game.gameType === GameType.TIME) {
    return (
      <div className="relative">
        <input
          type="text"
          value={timeString}
          onChange={handleTimeChange}
          placeholder={placeholder || "MM:SS ou HH:MM:SS"}
          className={`w-full px-3 py-2 border bg-surface-200 border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">⏱️</span>
      </div>
    );
  }

  if (game.gameType === GameType.POINTS) {
    return (
      <div className="relative">
        <input
          type="number"
          value={value ?? ""}
          onChange={handleNumberChange}
          step="0.01"
          placeholder={placeholder || "0"}
          className={`w-full px-3 py-2 border bg-surface-200 border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        />
        {game.unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
            {game.unit}
          </span>
        )}
      </div>
    );
  }

  // SCORE type - simple number input
  return (
    <input
      type="number"
      value={value ?? ""}
      onChange={handleNumberChange}
      placeholder={placeholder || "0"}
      className={`w-full px-3 py-2 border bg-surface-200 border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    />
  );
};
