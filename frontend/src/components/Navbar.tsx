import { Link, useLocation } from 'react-router-dom';

export function Navbar() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-blue-700' : '';
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold">
            🏆 Olympiades
          </Link>
          
          <div className="flex space-x-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded hover:bg-blue-700 transition ${isActive('/')}`}
            >
              Tableau de bord
            </Link>
            <Link
              to="/teams"
              className={`px-4 py-2 rounded hover:bg-blue-700 transition ${isActive('/teams')}`}
            >
              Équipes
            </Link>
            <Link
              to="/games"
              className={`px-4 py-2 rounded hover:bg-blue-700 transition ${isActive('/games')}`}
            >
              Jeux
            </Link>
            <Link
              to="/matches"
              className={`px-4 py-2 rounded hover:bg-blue-700 transition ${isActive('/matches')}`}
            >
              Rencontres
            </Link>
            <Link
              to="/rankings"
              className={`px-4 py-2 rounded hover:bg-blue-700 transition ${isActive('/rankings')}`}
            >
              Classements
            </Link>
            <Link
              to="/slideshow"
              className={`px-4 py-2 rounded hover:bg-blue-700 transition ${isActive('/slideshow')}`}
            >
              Diaporama
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
