import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components';
import { Dashboard, TeamsPage, GamesPage, RankingsPage } from './pages';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/rankings" element={<RankingsPage />} />
          
          {/* TODO: Implement remaining pages */}
          <Route path="/matches" element={<div className="text-center py-12 text-gray-500">Page Rencontres - À venir</div>} />
          <Route path="/slideshow" element={<div className="text-center py-12 text-gray-500">Page Diaporama - À venir</div>} />
          
          {/* 404 */}
          <Route path="*" element={
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">404 - Page non trouvée</h2>
              <p className="text-gray-600">La page que vous recherchez n'existe pas.</p>
            </div>
          } />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
