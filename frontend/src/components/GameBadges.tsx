import { GameFormat, GameType, ScoringDirection } from "../types";

interface GameTypeBadgeProps {
  type: GameType;
  size?: "sm" | "md";
}

interface GameFormatBadgeProps {
  format: GameFormat;
  size?: "sm" | "md";
}

interface ScoringDirectionBadgeProps {
  direction: ScoringDirection;
  size?: "sm" | "md";
}

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
};

export function GameTypeBadge({ type, size = "md" }: GameTypeBadgeProps) {
  const typeLabels = {
    [GameType.TIME]: "Temps",
    [GameType.SCORE]: "Score",
    [GameType.POINTS]: "Points",
  };

  return (
    <span className={`bg-primary-500/15 text-primary-400 rounded-lg font-medium border border-primary-500/20 ${sizeClasses[size]}`}>
      {typeLabels[type]}
    </span>
  );
}

export function GameFormatBadge({ format, size = "md" }: GameFormatBadgeProps) {
  const formatLabels = {
    [GameFormat.ROUND_ROBIN]: "Round-Robin",
    [GameFormat.ELIMINATION]: "Élimination",
  };

  return (
    <span className={`bg-surface-300 text-zinc-400 rounded-lg font-medium border border-surface-border ${sizeClasses[size]}`}>
      {formatLabels[format]}
    </span>
  );
}

export function ScoringDirectionBadge({ direction, size = "md" }: ScoringDirectionBadgeProps) {
  const directionLabels = {
    [ScoringDirection.ASC]: "Croissant",
    [ScoringDirection.DESC]: "Décroissant",
  };

  return (
    <span className={`bg-surface-300 text-zinc-400 rounded-lg font-medium border border-surface-border ${sizeClasses[size]}`}>
      {directionLabels[direction]}
    </span>
  );
}
