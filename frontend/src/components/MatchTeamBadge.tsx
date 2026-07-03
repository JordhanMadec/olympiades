import { Medal } from "lucide-react";
import { TeamColorDot } from "./TeamColorDot";
import { Game } from "../types";
import { formatScore } from "../utils/formatters";

interface MatchTeamBadgeProps {
  name: string;
  color: string;
  score?: number;
  rank?: number;
  isWinner?: boolean;
  size?: "sm" | "md" | "lg";
  game?: Game; // Optional game for score formatting
}

export function MatchTeamBadge({ 
  name, 
  color, 
  score, 
  isWinner = false, 
  size = "md",
  game 
}: MatchTeamBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-2.5 py-1.5",
    lg: "text-base px-3 py-2",
  };

  const formattedScore = game && score != null ? formatScore(score, game) : score?.toString();

  return (
    <div
      className={`flex items-center gap-2 rounded-lg border ${sizeClasses[size]} ${
        isWinner
          ? "bg-primary-500/10 border-primary-500/30"
          : "bg-surface-400 border-surface-border"
      }`}
    >
      <TeamColorDot color={color} size="sm" />
      <span className="text-zinc-300">{name}</span>
      {formattedScore != null && <span className="text-primary-400 font-bold">{formattedScore}</span>}
      {isWinner && <Medal className="h-3.5 w-3.5 text-yellow-400" />}
    </div>
  );
}
