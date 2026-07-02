import { Calendar, Gamepad2, LucideIcon, Settings, Trophy, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { path: "/rankings", label: "Classement", icon: Trophy },
  { path: "/teams", label: "Équipes", icon: Users },
  { path: "/games", label: "Épreuves", icon: Gamepad2 },
  { path: "/programme", label: "Programme", icon: Calendar },
  { path: "/settings", label: "Paramètres", icon: Settings },
];

export function Sidebar() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/rankings" && location.pathname === "/") return true;
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-56 flex flex-col bg-surface-100 border-r border-surface-border z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-surface-border">
        <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center flex-shrink-0">
          <Trophy className="w-5 h-5 text-white" />
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-base font-bold text-white leading-none">Olympiades</div>
          <div className="text-xs text-gray leading-none">Coëtmieux</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = isActive(path);
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20"
                  : "text-zinc-400 hover:text-white hover:bg-surface-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-surface-border">
        <p className="text-xs text-zinc-600">Olympiades v1.0</p>
      </div>
    </aside>
  );
}
