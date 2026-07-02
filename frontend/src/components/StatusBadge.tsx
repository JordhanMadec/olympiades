import { MatchStatus } from "../types";

interface StatusBadgeProps {
  status: MatchStatus;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const statusConfig = {
    [MatchStatus.PENDING]: {
      label: "En attente",
      className: "bg-zinc-500/20 text-zinc-400 border-zinc-500/20",
    },
    [MatchStatus.IN_PROGRESS]: {
      label: "En cours",
      className: "bg-blue-500/20 text-blue-400 border-blue-500/20",
    },
    [MatchStatus.COMPLETED]: {
      label: "Terminé",
      className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
    },
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-xs",
  };

  const config = statusConfig[status];

  return (
    <span className={`rounded-full font-medium border ${sizeClasses[size]} ${config.className}`}>
      {config.label}
    </span>
  );
}
