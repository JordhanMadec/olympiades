import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components";
import "./index.css";
import {
  AdminPage,
  GameDetailPage,
  GamesPage,
  ProgrammePage,
  RankingsPage,
  SlideshowPage,
  TeamDetailPage,
  TeamsPage,
} from "./pages";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Slideshow without layout (fullscreen) */}
        <Route path="/slideshow" element={<SlideshowPage />} />

        {/* Regular pages with sidebar layout */}
        <Route path="/" element={<Navigate to="/rankings" replace />} />
        <Route
          path="/rankings"
          element={
            <Layout>
              <RankingsPage />
            </Layout>
          }
        />
        <Route
          path="/teams"
          element={
            <Layout>
              <TeamsPage />
            </Layout>
          }
        />
        <Route
          path="/teams/:id"
          element={
            <Layout>
              <TeamDetailPage />
            </Layout>
          }
        />
        <Route
          path="/games"
          element={
            <Layout>
              <GamesPage />
            </Layout>
          }
        />
        <Route
          path="/games/:id"
          element={
            <Layout>
              <GameDetailPage />
            </Layout>
          }
        />
        <Route
          path="/programme"
          element={
            <Layout>
              <ProgrammePage />
            </Layout>
          }
        />
        <Route
          path="/admin"
          element={
            <Layout>
              <AdminPage />
            </Layout>
          }
        />

        {/* 404 */}
        <Route
          path="*"
          element={
            <Layout>
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-6xl font-bold text-surface-500 mb-4">404</p>
                <h2 className="text-xl font-semibold text-white mb-2">Page introuvable</h2>
                <p className="text-zinc-500">La page que vous recherchez n'existe pas.</p>
              </div>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
