import { ReactNode } from "react";
import { Match, MatchStatus, Team } from "../types";
import { Card } from "./Card";
import { MatchTeamBadge } from "./MatchTeamBadge";
import { StatusBadge } from "./StatusBadge";

interface MatchCardProps {
  match: Match;
  teams: Team[];
  gameName?: string;
  actions?: ReactNode;
  showGameName?: boolean;
  compact?: boolean;
  hover?: boolean;
}

export function MatchCard({ match, teams, gameName, actions, showGameName = false, hover = false }: MatchCardProps) {
  const getTeamName = (teamId: number) => teams.find((t) => t.id === teamId)?.name || "Équipe inconnue";
  const getTeamColor = (teamId: number) => teams.find((t) => t.id === teamId)?.color || "#888";

  return (
    <Card hover={hover}>
      <div className="flex items-center mb-3">
        <div className="flex-1 lex items-center gap-3">
          <span className="text-white font-medium text-sm">
            {showGameName && gameName && `${gameName} — `}Match #{match.matchNumber}
          </span>
          {match.round && <span className="text-zinc-600 text-xs">Tour {match.round}</span>}
        </div>
        <StatusBadge status={match.status} />
      </div>

      <div className="flex justify-between items-end">
        <div className="flex flex-wrap gap-2">
          {match.matchTeams
            .sort((a, b) => (a.rank || 999) - (b.rank || 999))
            .map((mt) => (
              <MatchTeamBadge
                key={mt.id}
                size="sm"
                name={getTeamName(mt.teamId)}
                color={getTeamColor(mt.teamId)}
                score={mt.rawScore ?? undefined}
                rank={mt.rank ?? undefined}
                isWinner={mt.rank === 1 && match.status === MatchStatus.COMPLETED}
              />
            ))}
        </div>

        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    </Card>
  );
}
