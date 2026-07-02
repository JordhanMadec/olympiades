import { ArrowRight, BowArrow } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ErrorMessage, Loading } from "../components";
import { gamesService } from "../services";
import { Game } from "../types";

export function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      setLoading(true);
      const data = await gamesService.getAll();
      setGames(data);
      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement des épreuves");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={loadGames} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Épreuves</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {games.length} épreuve{games.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {games.length === 0 ? (
        <div className="bg-surface-100 border border-surface-border rounded-2xl p-16 text-center">
          <BowArrow className="h-16 w-16 mx-auto mb-4 text-zinc-500" />
          <p className="text-zinc-500">Aucune épreuve pour le moment</p>
          <p className="text-zinc-600 text-sm mt-1">Créez des épreuves dans les paramètres</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {games.map((game) => {
            return (
              <Link
                key={game.id}
                to={`/games/${game.id}`}
                className="bg-surface-100 border border-surface-border rounded-2xl p-4 hover:border-surface-border-light hover:bg-surface-200 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold truncate group-hover:text-primary-400 transition-colors">
                      {game.name}
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-primary-400 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
