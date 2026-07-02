import { TeamColorRing } from "@/components/TeamColorRing.tsx";
import { Medal, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { RankingEntry } from "../types";

interface RankingTableProps {
  entries: RankingEntry[];
  emptyMessage?: string;
  showMatchCount?: boolean;
  showAverage?: boolean;
  size?: "sm" | "md" | "lg";
}

export function RankingTable({ entries, emptyMessage = "Aucun résultat pour le moment" }: RankingTableProps) {
  const getRankBadge = (index: number) => {
    if (index === 0) return { color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30" };
    if (index === 1) return { color: "text-zinc-300", bg: "bg-zinc-400/10 border-zinc-400/20" };
    if (index === 2) return { color: "text-orange-600", bg: "bg-orange-700/10 border-orange-700/20" };
    return { color: "text-zinc-500", bg: "" };
  };

  if (entries.length === 0) {
    return (
      <div className="p-16 text-center">
        <Trophy className="h-16 w-16 mx-auto mb-4 text-zinc-500" />
        <p className="text-zinc-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-surface-border">
      {entries.map((entry, index) => {
        const badge = getRankBadge(index);
        return (
          <Link
            key={entry.teamId}
            to={`/teams/${entry.teamId}`}
            className="flex items-center gap-4 p-4 hover:bg-surface-200 transition-colors grid-cols-12"
          >
            {/* Rank */}
            <div className="w-6 flex justify-center">
              {index < 3 ? (
                <Medal className={`w-6 h-6 ${badge.color}`} />
              ) : (
                <span className="text-zinc-500 ">{index + 1}</span>
              )}
            </div>

            {/* Team */}
            <div className="flex items-center gap-2 flex-1">
              <TeamColorRing color={entry.teamColor} size="sm" />
              <span className="font-semibold text-white">{entry.teamName}</span>
            </div>

            {/* Points */}
            <div className="text-right">
              <span>{entry.totalPoints} pts</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
