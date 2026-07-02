import React from 'react';
import { Match, Team } from '../types';

interface BracketProps {
  matches: Match[];
  teams: Team[];
  onUpdateScore?: (matchId: number, teamId: number, score: number) => void;
  readOnly?: boolean;
}

interface BracketNode {
  match: Match;
  round: number;
  position: number;
  teams: (Team | null)[];
}

export function Bracket({ matches, teams, onUpdateScore, readOnly = false }: BracketProps) {
  // Group matches by round
  const rounds = React.useMemo(() => {
    const roundMap = new Map<number, BracketNode[]>();
    
    matches.forEach(match => {
      const round = match.round || 1;
      if (!roundMap.has(round)) {
        roundMap.set(round, []);
      }

      const matchTeams = match.matchTeams.map(mt => {
        return teams.find(t => t.id === mt.teamId) || null;
      });

      roundMap.get(round)!.push({
        match,
        round,
        position: match.bracketPosition || 0,
        teams: matchTeams,
      });
    });

    // Sort rounds descending (highest round = earliest stage)
    const sortedRounds = Array.from(roundMap.entries())
      .sort(([a], [b]) => b - a)
      .map(([round, nodes]) => ({
        round,
        nodes: nodes.sort((a, b) => a.position - b.position),
      }));

    return sortedRounds;
  }, [matches, teams]);

  if (matches.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Aucun bracket généré pour ce jeu
      </div>
    );
  }

  const getRoundLabel = (round: number) => {
    if (round === 1) return 'Finale';
    if (round === 2) return 'Demi-finales';
    if (round === 3) return 'Quarts de finale';
    return `Round ${round}`;
  };

  const getTeamScore = (match: Match, teamId: number) => {
    const matchTeam = match.matchTeams.find(mt => mt.teamId === teamId);
    return matchTeam?.rawScore ?? null;
  };

  const getWinner = (match: Match) => {
    if (match.status !== 'COMPLETED') return null;
    const winner = match.matchTeams
      .filter(mt => !mt.isEliminated)
      .sort((a, b) => (a.rank || 999) - (b.rank || 999))[0];
    return winner?.teamId || null;
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="inline-flex gap-8 min-w-full p-4">
        {rounds.map(({ round, nodes }) => (
          <div key={round} className="flex flex-col justify-around min-w-[280px]">
            {/* Round Label */}
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-gray-700">
                {getRoundLabel(round)}
              </h3>
              <p className="text-sm text-gray-500">{nodes.length} match(s)</p>
            </div>

            {/* Matches */}
            <div className="space-y-8">
              {nodes.map(({ match, teams: nodeTeams }) => {
                const winnerId = getWinner(match);
                const isBye = match.matchTeams.length === 1;

                return (
                  <div
                    key={match.id}
                    className={`bg-white rounded-lg shadow-md border-2 ${
                      match.status === 'COMPLETED'
                        ? 'border-green-300'
                        : match.status === 'IN_PROGRESS'
                        ? 'border-blue-400'
                        : 'border-gray-200'
                    }`}
                  >
                    {/* Match Header */}
                    <div className="bg-gray-50 px-4 py-2 border-b flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-600">
                        Match #{match.matchNumber}
                      </span>
                      {isBye && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          BYE
                        </span>
                      )}
                      {match.status === 'COMPLETED' && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          ✓ Terminé
                        </span>
                      )}
                    </div>

                    {/* Teams */}
                    <div className="divide-y divide-gray-100">
                      {match.matchTeams.map((matchTeam, idx) => {
                        const team = nodeTeams[idx];
                        const isWinner = winnerId === matchTeam.teamId;
                        const score = getTeamScore(match, matchTeam.teamId);

                        return (
                          <div
                            key={matchTeam.id}
                            className={`flex items-center justify-between px-4 py-3 ${
                              isWinner ? 'bg-green-50 font-bold' : ''
                            } ${matchTeam.isEliminated ? 'opacity-50' : ''}`}
                          >
                            {/* Team Info */}
                            <div className="flex items-center gap-3 flex-1">
                              {team ? (
                                <>
                                  <div
                                    className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0"
                                    style={{ backgroundColor: team.color }}
                                  />
                                  <span className={isWinner ? 'font-bold' : ''}>
                                    {team.name}
                                  </span>
                                  {isWinner && (
                                    <span className="text-green-600 text-xl ml-2">🏆</span>
                                  )}
                                </>
                              ) : (
                                <span className="text-gray-400 italic">À déterminer</span>
                              )}
                            </div>

                            {/* Score */}
                            {team && (
                              <div className="flex items-center gap-2">
                                {!readOnly && match.status !== 'COMPLETED' && onUpdateScore ? (
                                  <input
                                    type="number"
                                    value={score ?? ''}
                                    onChange={(e) => {
                                      const value = parseFloat(e.target.value);
                                      if (!isNaN(value)) {
                                        onUpdateScore(match.id, matchTeam.teamId, value);
                                      }
                                    }}
                                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                                    placeholder="-"
                                  />
                                ) : (
                                  <span className="text-lg font-mono w-16 text-center">
                                    {score ?? '-'}
                                  </span>
                                )}
                                {matchTeam.rank && (
                                  <span className="text-xs text-gray-500 ml-1">
                                    (#{matchTeam.rank})
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Bye Message */}
                    {isBye && (
                      <div className="px-4 py-2 bg-yellow-50 text-sm text-yellow-800 border-t">
                        Cette équipe est qualifiée d'office pour le prochain tour
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
