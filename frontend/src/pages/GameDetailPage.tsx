import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BracketViewer, Card, ErrorMessage, GameTypeBadge, Loading, MatchCard, RankingTable } from "../components";
import { gamesService, matchesService, rankingsService, teamsService } from "../services";
import { Game, GameFormat, GameRanking, Match, Team } from "../types";

export function GameDetailPage() {
  const { id } = useParams<{ id: string }>();
  const gameId = parseInt(id!);

  const [game, setGame] = useState<Game | null>(null);
  const [ranking, setRanking] = useState<GameRanking | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [gameId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [gamesData, rankingData, matchesData, teamsData] = await Promise.all([
        gamesService.getAll(),
        rankingsService.getRankingByGame(gameId),
        matchesService.getAll(gameId),
        teamsService.getAll(),
      ]);
      const found = gamesData.find((g) => g.id === gameId);
      if (!found) {
        setError("Épreuve introuvable");
        return;
      }
      setGame(found);
      setRanking(rankingData);
      setMatches(matchesData);
      setTeams(teamsData);
      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!game) return null;

  return (
    <div>
      {/* Back */}
      <Link
        to="/games"
        className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux épreuves
      </Link>

      {/* Game header */}
      <div className="flex flex-col items-start gap-3 mb-8">
        <h1 className="text-2xl font-bold text-white">{game.name}</h1>

        {game.description && <p>{game.description}</p>}

        <GameTypeBadge type={game.gameType} />
      </div>

      {/* Ranking */}
      <div className="mb-8">
        <h2 className="text-base font-semibold text-white mb-4">Classement</h2>
        <Card padding="none" className="overflow-hidden">
          <RankingTable entries={ranking?.entries || []} emptyMessage="Aucun résultat" />
        </Card>
      </div>

      {/* Matches */}
      <div>
        <h2 className="text-base font-semibold text-white mb-4">Rencontres ({matches.length})</h2>
        {matches.length === 0 ? (
          <Card className="p-10 text-center">
            <p className="text-zinc-500 text-sm">Aucune rencontre</p>
          </Card>
        ) : game.gameFormat === GameFormat.ELIMINATION ? (
          <div>
            <BracketViewer matches={matches} teams={teams} />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} teams={teams} games={[game]} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
