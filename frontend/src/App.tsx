import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { TeamsPage } from './pages/TeamsPage';
import { GamesPage } from './pages/GamesPage';
import { MatchesPage } from './pages/MatchesPage';
import { DrawsPage } from './pages/DrawsPage';
import { RankingsPage } from './pages/RankingsPage';
import { SlideshowPage } from './pages/SlideshowPage';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/draws" element={<DrawsPage />} />
          <Route path="/rankings" element={<RankingsPage />} />
          <Route path="/slideshow" element={<SlideshowPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
