import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({ children, className = "", hover = false, padding = "md" }: CardProps) {
  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <div
      className={`bg-surface-100 border border-surface-border rounded-xl ${paddingClasses[padding]} ${
        hover ? "hover:border-surface-border-light hover:bg-surface-200 transition-colors" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
