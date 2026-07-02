import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components';
import { 
  Dashboard, 
  TeamsPage, 
  GamesPage, 
  RankingsPage, 
  MatchesPage, 
  DrawsPage, 
  SlideshowPage 
} from './pages';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Slideshow without layout (fullscreen) */}
        <Route path="/slideshow" element={<SlideshowPage />} />
        
        {/* Regular pages with layout */}
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/teams" element={<Layout><TeamsPage /></Layout>} />
        <Route path="/games" element={<Layout><GamesPage /></Layout>} />
        <Route path="/rankings" element={<Layout><RankingsPage /></Layout>} />
        <Route path="/matches" element={<Layout><MatchesPage /></Layout>} />
        <Route path="/draws" element={<Layout><DrawsPage /></Layout>} />
        
        {/* 404 */}
        <Route path="*" element={
          <Layout>
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">404 - Page non trouvée</h2>
              <p className="text-gray-600">La page que vous recherchez n'existe pas.</p>
            </div>
          </Layout>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
