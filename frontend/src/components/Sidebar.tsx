import { useAuth } from "@/contexts/AuthContext";
import { BowArrow, Calendar, LogOut, LucideIcon, ShieldCog, Trophy, Users, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems: NavItem[] = [
  { path: "/rankings", label: "Classement", icon: Trophy },
  { path: "/teams", label: "Équipes", icon: Users },
  { path: "/games", label: "Épreuves", icon: BowArrow },
  { path: "/programme", label: "Rencontres", icon: Calendar },
];

const adminItems: NavItem[] = [{ path: "/admin", label: "Admin", icon: ShieldCog }];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  const isActive = (path: string) => {
    if (path === "/rankings" && location.pathname === "/") return true;
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleLinkClick = () => {
    // Fermer le sidebar sur mobile après clic
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-screen w-64 sm:w-72 lg:w-56 flex flex-col bg-surface-100 border-r border-surface-border z-40 transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      {/* Header avec bouton fermer (mobile uniquement) */}
      <div className="flex items-center justify-between gap-3 px-5 py-5 border-b border-surface-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-4 h-4 text-white" />
          </div>

          <div className="flex flex-col gap-1">
            <div className="text-base font-bold text-white leading-none">Olympiades</div>
            <div className="text-xs text-gray leading-none">Coëtmieux</div>
          </div>
        </div>

        {/* Bouton fermer (mobile uniquement) */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg hover:bg-surface-200 transition-colors"
          aria-label="Fermer le menu"
        >
          <X className="w-5 h-5 text-zinc-400" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col px-4 py-2 gap-1 overflow-y-auto">
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = isActive(path);
          return (
            <Link
              key={path}
              to={path}
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                active ? "bg-primary-500 text-white" : "text-zinc-400 hover:text-white hover:bg-surface-200"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}

        <div className="flex-1"></div>

        {/* Admin section - visible seulement si authentifié */}
        {isAuthenticated && (
          <>
            {adminItems.map(({ path, label, icon: Icon }) => {
              const active = isActive(path);
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={handleLinkClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    active
                      ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20"
                      : "text-zinc-400 hover:text-white hover:bg-surface-200"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </Link>
              );
            })}

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-surface-200 transition-all duration-150"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              Déconnexion
            </button>
          </>
        )}
      </nav>
    </aside>
  );
}
