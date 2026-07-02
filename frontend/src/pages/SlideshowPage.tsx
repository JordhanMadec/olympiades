import React, { useEffect, useState, useCallback } from 'react';
import { rankingsService } from '../services/rankings.service';
import type { TeamRanking, GameRanking } from '../types';

const MEDAL_ICONS = ['🥇', '🥈', '🥉'];

// Tailwind height tokens mapped to pixel values for inline style
const PODIUM_PX = [128, 96, 80]; // h-32=8rem=128px, h-24=6rem=96px, h-20=5rem=80px

const PodiumSlide: React.FC<{ rankings: TeamRanking[]; title: string }> = ({ rankings, title }) => {
  const top3 = rankings.slice(0, 3);
  // Display order: 2nd (left), 1st (centre), 3rd (right)
  const displayOrder = [top3[1], top3[0], top3[2]];
  const actualRanks = [1, 0, 2]; // index into MEDAL_ICONS / PODIUM_PX

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8">
      <h2 className="text-4xl font-bold text-white drop-shadow">{title}</h2>
      <div className="flex items-end gap-4 justify-center">
        {displayOrder.map((r, i) => {
          if (!r) return null;
          const rank = actualRanks[i];
          const heightPx = PODIUM_PX[rank];
          return (
            <div key={r.team.id} className="flex flex-col items-center gap-2">
              <span className="text-5xl">{MEDAL_ICONS[rank]}</span>
              <div
                className="w-24 rounded-t-xl flex items-end justify-center pb-2"
                style={{ backgroundColor: r.team.color, height: heightPx }}
              >
                <span className="text-white font-bold text-xl drop-shadow">{r.totalPoints}</span>
              </div>
              <p className="text-white font-semibold text-lg drop-shadow max-w-[120px] text-center truncate">
                {r.team.name}
              </p>
            </div>
          );
        })}
      </div>
      <div className="w-full max-w-2xl bg-white/10 rounded-xl p-4">
        {rankings.slice(3).map((r) => (
          <div key={r.team.id} className="flex items-center gap-3 py-1.5 border-b border-white/10">
            <span className="text-white/60 w-8 text-right font-mono">{r.rank}</span>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.team.color }} />
            <span className="text-white flex-1">{r.team.name}</span>
            <span className="text-white font-bold">{r.totalPoints} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const SLIDE_INTERVAL_OPTIONS = [3, 5, 8, 10, 15];

const GRADIENT_CLASSES = [
  'from-indigo-900 via-purple-900 to-blue-900',
  'from-emerald-900 via-teal-900 to-cyan-900',
  'from-rose-900 via-pink-900 to-fuchsia-900',
  'from-amber-900 via-orange-900 to-red-900',
  'from-blue-900 via-indigo-900 to-violet-900',
];

interface SlideDisplayProps {
  slide: { title: string; rankings: TeamRanking[] };
  slides: { title: string; rankings: TeamRanking[] }[];
  currentSlide: number;
  gradient: string;
  fullscreen: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (i: number) => void;
}

const SlideDisplay: React.FC<SlideDisplayProps> = ({
  slide, slides, currentSlide, gradient, fullscreen, onClose, onPrev, onNext, onSelect,
}) => (
  <div
    className={`bg-gradient-to-br ${gradient} relative overflow-hidden`}
    style={
      fullscreen
        ? { position: 'fixed', inset: 0, zIndex: 9999 }
        : { minHeight: '70vh', borderRadius: '1rem' }
    }
  >
    {/* Decorative blobs */}
    <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
    <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none" />

    <div className="absolute top-4 right-4 flex items-center gap-2">
      <span className="text-white/50 text-sm">{currentSlide + 1} / {slides.length}</span>
      {fullscreen && (
        <button onClick={onClose} className="text-white/70 hover:text-white text-xl">✕</button>
      )}
    </div>

    <div className="h-full flex flex-col p-8">
      <PodiumSlide rankings={slide.rankings} title={slide.title} />
    </div>

    <button
      onClick={onPrev}
      className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-3xl"
    >
      ‹
    </button>
    <button
      onClick={onNext}
      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-3xl"
    >
      ›
    </button>

    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
      {slides.map((_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={`h-2 rounded-full transition-all ${
            i === currentSlide ? 'bg-white w-4' : 'bg-white/40 w-2'
          }`}
        />
      ))}
    </div>
  </div>
);

export const SlideshowPage: React.FC = () => {
  const [global, setGlobal] = useState<TeamRanking[]>([]);
  const [gameRankings, setGameRankings] = useState<GameRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [auto, setAuto] = useState(false);
  const [intervalSeconds, setIntervalSeconds] = useState(5);

  const load = () =>
    Promise.all([rankingsService.getGlobal(), rankingsService.getAllGames()])
      .then(([g, gr]) => {
        setGlobal(g);
        setGameRankings(gr.filter((r) => r.rankings.length > 0));
      })
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const slides = [
    { title: '🌍 Classement Général', rankings: global },
    ...gameRankings.map((gr) => ({ title: gr.game.name, rankings: gr.rankings })),
  ].filter((s) => s.rankings.length > 0);

  const next = useCallback(
    () => setCurrentSlide((s) => (s + 1) % Math.max(slides.length, 1)),
    [slides.length],
  );
  const prev = () =>
    setCurrentSlide((s) => (s - 1 + Math.max(slides.length, 1)) % Math.max(slides.length, 1));

  useEffect(() => {
    if (!auto || slides.length === 0) return;
    const timer = setInterval(next, intervalSeconds * 1000);
    return () => clearInterval(timer);
  }, [auto, intervalSeconds, next, slides.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'Escape') setFullscreen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-lg">Aucun classement disponible. Saisissez des scores d'abord.</p>
      </div>
    );
  }

  const slide = slides[currentSlide];
  const gradient = GRADIENT_CLASSES[currentSlide % GRADIENT_CLASSES.length];
  const slideProps: Omit<SlideDisplayProps, 'fullscreen'> = {
    slide,
    slides,
    currentSlide,
    gradient,
    onClose: () => setFullscreen(false),
    onPrev: prev,
    onNext: next,
    onSelect: setCurrentSlide,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📺 Diaporama</h1>
          <p className="text-gray-500 text-sm">Projection plein écran pour le public</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setLoading(true); load(); }}
            className="text-sm text-gray-500 border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50"
          >
            🔄 Actualiser
          </button>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={auto}
              onChange={(e) => setAuto(e.target.checked)}
              className="rounded"
            />
            Auto
          </label>
          <select
            value={intervalSeconds}
            onChange={(e) => setIntervalSeconds(+e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-2 py-1.5"
          >
            {SLIDE_INTERVAL_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}s</option>
            ))}
          </select>
          <button
            onClick={() => setFullscreen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium"
          >
            ⛶ Plein écran
          </button>
        </div>
      </div>

      {/* Inline preview (always visible) */}
      <SlideDisplay {...slideProps} fullscreen={false} />

      {/* Fullscreen overlay (portal-like, rendered on top) */}
      {fullscreen && <SlideDisplay {...slideProps} fullscreen={true} />}
    </div>
  );
};
