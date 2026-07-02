import { useEffect, useState } from 'react';
import { rankingsService } from '../services';
import { GameRanking } from '../types';
import { Loading, ErrorMessage, Button } from '../components';

export function SlideshowPage() {
  const [allRankings, setAllRankings] = useState<GameRanking[]>([]);
  const [generalRanking, setGeneralRanking] = useState<GameRanking | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [interval, setIntervalValue] = useState(5000); // 5 seconds
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRankings();
  }, []);

  useEffect(() => {
    if (isPlaying) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => {
          const totalSlides = 1 + allRankings.length;
          return (prev + 1) % totalSlides;
        });
      }, interval);

      return () => clearInterval(timer);
    }
  }, [isPlaying, interval, allRankings.length]);

  const loadRankings = async () => {
    try {
      setLoading(true);
      const [general, byGame] = await Promise.all([
        rankingsService.getGeneralRanking(),
        rankingsService.getAllGameRankings(),
      ]);
      setGeneralRanking(general);
      setAllRankings(byGame);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des classements');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRankMedal = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}`;
  };

  const handlePrevious = () => {
    const totalSlides = 1 + allRankings.length;
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNext = () => {
    const totalSlides = 1 + allRankings.length;
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={loadRankings} />;

  const currentRankings = currentSlide === 0 
    ? { title: 'Classement Général', entries: generalRanking?.entries || [] }
    : { title: allRankings[currentSlide - 1].gameName, entries: allRankings[currentSlide - 1].entries };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-900 text-white">
      {/* Controls - Hidden in fullscreen mode */}
      <div className="absolute top-4 right-4 z-50 print:hidden">
        <div className="bg-black bg-opacity-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center space-x-2">
            <Button
              variant={isPlaying ? 'danger' : 'success'}
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-sm"
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </Button>
            <Button variant="secondary" onClick={handlePrevious} className="text-sm">
              ←
            </Button>
            <Button variant="secondary" onClick={handleNext} className="text-sm">
              →
            </Button>
          </div>
          <select
            value={interval}
            onChange={(e) => setIntervalValue(parseInt(e.target.value))}
            className="w-full px-3 py-2 rounded text-black text-sm"
          >
            <option value="3000">3 secondes</option>
            <option value="5000">5 secondes</option>
            <option value="10000">10 secondes</option>
            <option value="15000">15 secondes</option>
          </select>
          <Button
            variant="secondary"
            onClick={() => document.documentElement.requestFullscreen()}
            className="w-full text-sm"
          >
            Plein écran
          </Button>
        </div>
      </div>

      {/* Slide Content */}
      <div className="container mx-auto px-8 py-12 flex flex-col justify-center min-h-screen">
        {/* Title */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-6xl font-bold mb-4">🏆 OLYMPIADES</h1>
          <h2 className="text-4xl font-semibold">{currentRankings.title}</h2>
          <div className="mt-4 text-lg opacity-75">
            Slide {currentSlide + 1} / {1 + allRankings.length}
          </div>
        </div>

        {/* Rankings Table */}
        {currentRankings.entries.length === 0 ? (
          <div className="text-center text-2xl opacity-75">
            Aucun résultat pour le moment
          </div>
        ) : (
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
            <table className="w-full">
              <thead className="bg-white bg-opacity-20">
                <tr>
                  <th className="px-8 py-6 text-left text-2xl font-bold">Rang</th>
                  <th className="px-8 py-6 text-left text-2xl font-bold">Équipe</th>
                  <th className="px-8 py-6 text-center text-2xl font-bold">Points</th>
                  <th className="px-8 py-6 text-center text-2xl font-bold">Matchs</th>
                </tr>
              </thead>
              <tbody>
                {currentRankings.entries.slice(0, 10).map((entry, index) => (
                  <tr
                    key={entry.teamId}
                    className={`border-t border-white border-opacity-20 ${
                      index < 3 ? 'bg-yellow-500 bg-opacity-20' : ''
                    }`}
                  >
                    <td className="px-8 py-6">
                      <span className="text-5xl font-bold">{getRankMedal(index)}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <div
                          className="w-8 h-8 rounded-full border-2 border-white"
                          style={{ backgroundColor: entry.teamColor }}
                        ></div>
                        <span className="text-3xl font-bold">{entry.teamName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-4xl font-bold text-yellow-300">
                        {entry.totalPoints}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center text-2xl opacity-90">
                      {entry.matchesPlayed}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Podium for top 3 (General ranking only) */}
        {currentSlide === 0 && currentRankings.entries.length >= 3 && (
          <div className="mt-12 flex items-end justify-center space-x-8">
            {/* 2nd place */}
            <div className="flex flex-col items-center">
              <div className="text-6xl mb-2">🥈</div>
              <div
                className="w-32 h-32 rounded-full border-4 border-white mb-4"
                style={{ backgroundColor: currentRankings.entries[1].teamColor }}
              ></div>
              <div className="text-2xl font-bold">{currentRankings.entries[1].teamName}</div>
              <div className="text-3xl font-bold text-yellow-300">
                {currentRankings.entries[1].totalPoints} pts
              </div>
            </div>

            {/* 1st place */}
            <div className="flex flex-col items-center -mt-8">
              <div className="text-8xl mb-2">🥇</div>
              <div
                className="w-40 h-40 rounded-full border-4 border-yellow-400 mb-4 shadow-2xl"
                style={{ backgroundColor: currentRankings.entries[0].teamColor }}
              ></div>
              <div className="text-3xl font-bold">{currentRankings.entries[0].teamName}</div>
              <div className="text-4xl font-bold text-yellow-300">
                {currentRankings.entries[0].totalPoints} pts
              </div>
            </div>

            {/* 3rd place */}
            <div className="flex flex-col items-center">
              <div className="text-6xl mb-2">🥉</div>
              <div
                className="w-32 h-32 rounded-full border-4 border-white mb-4"
                style={{ backgroundColor: currentRankings.entries[2].teamColor }}
              ></div>
              <div className="text-2xl font-bold">{currentRankings.entries[2].teamName}</div>
              <div className="text-3xl font-bold text-yellow-300">
                {currentRankings.entries[2].totalPoints} pts
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
