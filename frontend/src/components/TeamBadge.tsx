import { TeamColorDot } from "./TeamColorDot";

interface TeamBadgeProps {
  name: string;
  color: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function TeamBadge({ name, color, size = "md", className = "" }: TeamBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-2.5 py-1.5",
    lg: "text-base px-3 py-2",
  };

  const dotSizeMap = {
    sm: "sm" as const,
    md: "sm" as const,
    lg: "md" as const,
  };

  return (
    <div className={`flex items-center gap-1.5 bg-surface-400 rounded-lg border border-surface-border ${sizeClasses[size]} ${className}`}>
      <TeamColorDot color={color} size={dotSizeMap[size]} />
      <span className="text-zinc-300">{name}</span>
    </div>
  );
}
