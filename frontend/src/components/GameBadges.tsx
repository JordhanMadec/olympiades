import { GameFormat, GameType } from "../types";

interface GameTypeBadgeProps {
  type: GameType;
  size?: "sm" | "md";
}

interface GameFormatBadgeProps {
  format: GameFormat;
  size?: "sm" | "md";
}

interface GameParticipantsBadgeProps {
  teamsPerMatch: number;
  size?: "sm" | "md";
}

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
};

export function GameTypeBadge({ type, size = "md" }: GameTypeBadgeProps) {
  const typeLabels = {
    [GameType.TIME]: "Meilleurs temps",
    [GameType.SCORE]: "Match à élimination",
    [GameType.POINTS]: "Meilleur score",
  };

  return (
    <span
      className={`bg-primary-500/15 text-primary-400 rounded-lg font-medium border border-primary-500/20 ${sizeClasses[size]}`}
    >
      {typeLabels[type]}
    </span>
  );
}

export function GameFormatBadge({ format, size = "md" }: GameFormatBadgeProps) {
  const formatLabels = {
    [GameFormat.ROUND_ROBIN]: "Championnat",
    [GameFormat.ELIMINATION]: "Élimination directe",
  };

  return (
    <span
      className={`bg-primary-500/15 text-primary-400 rounded-lg font-medium border border-primary-500/20 ${sizeClasses[size]}`}
    >
      {formatLabels[format]}
    </span>
  );
}

export function GameParticipantsBadge({ teamsPerMatch, size = "md" }: GameParticipantsBadgeProps) {
  return (
    <span
      className={`bg-primary-500/15 text-primary-400 rounded-lg font-medium border border-primary-500/20 ${sizeClasses[size]}`}
    >
      {teamsPerMatch} équipes / rencontre
    </span>
  );
}
