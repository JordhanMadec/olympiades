import { Medal } from "lucide-react";
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
  const roundNumbers = [...new Set(matches.map(m => m.round).filter(r => r !== undefined))].sort((a, b) => (b || 0) - (a || 0));

  roundNumbers.forEach(round => {
    rounds.push({
      round: round || 0,
      matches: matches.filter(m => m.round === round).sort((a, b) => (a.bracketPosition || 0) - (b.bracketPosition || 0)),
    });
  });

  const getTeamName = (teamId: number) => teams.find(t => t.id === teamId)?.name || "?";
  const getTeamColor = (teamId: number) => teams.find(t => t.id === teamId)?.color || "#888";

  const getRoundName = (round: number) => {
    const totalRounds = Math.max(...roundNumbers);
    if (round === 1) return "Finale";
    if (round === 2) return "Demi-finales";
    if (round === 3) return "Quarts de finale";
    return `Tour ${totalRounds - round + 1}`;
  };

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
                <div key={match.id} className="bg-surface-100 border border-surface-border rounded-lg overflow-hidden">
                  {/* Match header */}
                  <div className="px-3 py-2 bg-surface-200 border-b border-surface-border flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Match #{match.matchNumber}</span>
                    {match.status === MatchStatus.COMPLETED && (
                      <span className="text-xs text-emerald-400">Terminé</span>
                    )}
                    {match.status === MatchStatus.PENDING && match.matchTeams.length > 0 && (
                      <span className="text-xs text-zinc-500">En attente</span>
                    )}
                    {match.matchTeams.length === 0 && (
                      <span className="text-xs text-zinc-600 italic">À venir</span>
                    )}
                  </div>

                  {/* Teams */}
                  <div className="divide-y divide-surface-border">
                    {match.matchTeams.length === 0 ? (
                      <div className="px-3 py-3 text-center text-zinc-600 text-sm italic">
                        Vainqueur du tour précédent
                      </div>
                    ) : match.matchTeams.length === 1 ? (
                      <>
                        <div className="px-3 py-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: getTeamColor(match.matchTeams[0].teamId) }}
                            />
                            <span className="text-white text-sm font-medium">
                              {getTeamName(match.matchTeams[0].teamId)}
                            </span>
                          </div>
                          <span className="text-zinc-600 text-xs italic">Qualifié</span>
                        </div>
                        <div className="px-3 py-3 text-center text-zinc-600 text-sm italic">
                          En attente
                        </div>
                      </>
                    ) : (
                      match.matchTeams
                        .sort((a, b) => (a.rank || 999) - (b.rank || 999))
                        .map((mt) => (
                          <div
                            key={mt.id}
                            className={`px-3 py-2.5 flex items-center justify-between ${
                              mt.rank === 1 && match.status === MatchStatus.COMPLETED
                                ? "bg-primary-500/5"
                                : ""
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: getTeamColor(mt.teamId) }}
                              />
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
                                <span className="text-primary-400 text-sm font-bold">
                                  {mt.rawScore}
                                </span>
                              )}
                              {mt.rank === 1 && match.status === MatchStatus.COMPLETED && (
                                <Medal className="h-3.5 w-3.5 text-yellow-400" />
                              )}
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
