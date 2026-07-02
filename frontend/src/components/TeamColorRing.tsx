interface TeamColorRingProps {
  color: string;
  size?: "sm" | "md" | "lg";
}

export function TeamColorRing({ color, size = "md" }: TeamColorRingProps) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-6 h-6",
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex-shrink-0 border-2`}
      style={{ backgroundColor: color + "30", borderColor: color }}
    />
  );
}
