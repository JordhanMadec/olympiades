import { Card } from "@/components/Card.tsx";
import { TeamColorRing } from "@/components/TeamColorRing.tsx";
import { getRoundName } from "@/utils/formatters.ts";
import { Match, MatchStatus, Team } from "../types";

interface BracketViewerProps {
  matches: Match[];
  teams: Team[];
}

interface BracketRound {
  round: number;
  matches: Match[];
}

export function BracketViewer({ matches, teams }: BracketViewerProps) {
  // Group matches by round
  const rounds: BracketRound[] = [];
  const roundNumbers = [...new Set(matches.map((m) => m.round).filter((r) => r !== undefined))].sort(
    (a, b) => (b || 0) - (a || 0),
  );

  roundNumbers.forEach((round) => {
    rounds.push({
      round: round || 0,
      matches: matches
        .filter((m) => m.round === round)
        .sort((a, b) => (a.bracketPosition || 0) - (b.bracketPosition || 0)),
    });
  });

  const getTeamName = (teamId: number) => teams.find((t) => t.id === teamId)?.name || "?";
  const getTeamColor = (teamId: number) => teams.find((t) => t.id === teamId)?.color || "#888";

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-8 pb-4">
        {rounds.map((roundData) => (
          <div key={roundData.round} className="flex-shrink-0" style={{ width: "240px" }}>
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
              {getRoundName(roundData.round)}
            </h3>
            <div className="space-y-4">
              {roundData.matches.map((match) => (
                <Card padding="none" key={match.id} className="overflow-hidden">
                  {/* Teams */}
                  <div className="divide-y divide-surface-border">
                    {match.matchTeams.length === 0 ? (
                      <div className="px-3 py-3 text-center text-zinc-600 text-sm italic">
                        Vainqueur du tour précédent
                      </div>
                    ) : match.matchTeams.length === 1 ? (
                      <>
                        <div
                          className={`p-3 flex items-center justify-between ${
                            match.status === MatchStatus.COMPLETED ? "bg-primary-500/20" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <TeamColorRing color={getTeamColor(match.matchTeams[0].teamId)} size="sm" />
                            <span className="text-white text-sm font-medium">
                              {getTeamName(match.matchTeams[0].teamId)}
                            </span>
                          </div>
                          {match.status === MatchStatus.COMPLETED && (
                            <span className="text-primary-500 text-xs">Qualifié</span>
                          )}
                        </div>
                        {match.status === MatchStatus.COMPLETED ? (
                          <div className="px-3 py-3  text-sm ">Exempt</div>
                        ) : (
                          <div className="px-3 py-3 text-zinc-500 text-sm italic">En attente</div>
                        )}
                      </>
                    ) : (
                      match.matchTeams
                        .sort((a, b) => (a.rank || 999) - (b.rank || 999))
                        .map((mt) => (
                          <div
                            key={mt.id}
                            className={`p-3 flex items-center justify-between ${
                              mt.rank === 1 && match.status === MatchStatus.COMPLETED ? "bg-primary-500/20" : ""
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <TeamColorRing color={getTeamColor(mt.teamId)} size="sm" />

                              <span
                                className={`text-sm font-medium ${
                                  mt.rank === 1 && match.status === MatchStatus.COMPLETED
                                    ? "text-white"
                                    : "text-zinc-300"
                                }`}
                              >
                                {getTeamName(mt.teamId)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {mt.rawScore != null && (
                                <span
                                  className={`${mt.rank === 1 && match.status === MatchStatus.COMPLETED ? "text-primary-500" : ""} text-sm font-bold`}
                                >
                                  {mt.rawScore}
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
