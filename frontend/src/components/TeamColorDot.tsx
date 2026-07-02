interface TeamColorDotProps {
  color: string;
  size?: "sm" | "md" | "lg";
}

export function TeamColorDot({ color, size = "md" }: TeamColorDotProps) {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
  };

  return <div className={`${sizeClasses[size]} rounded-full flex-shrink-0`} style={{ backgroundColor: color }} />;
}
