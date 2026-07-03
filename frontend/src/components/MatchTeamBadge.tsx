import { TeamColorRing } from "@/components/TeamColorRing.tsx";
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

export function MatchTeamBadge({ name, color, score, isWinner = false, size = "md", game }: MatchTeamBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-2.5 py-1.5",
    lg: "text-base px-3 py-2",
  };

  const formattedScore = game && score != null ? formatScore(score, game) : score?.toString();

  return (
    <div
      className={`flex items-center gap-2 rounded-lg  ${sizeClasses[size]} ${
        isWinner ? "bg-primary-500/20 " : "bg-surface-200"
      }`}
    >
      <TeamColorRing color={color} size="sm" />
      <span className="font-semibold">{name}</span>
      {formattedScore != null && (
        <span className={isWinner ? "text-primary-400" : "text-zinc-400"}>{formattedScore}</span>
      )}
    </div>
  );
}
