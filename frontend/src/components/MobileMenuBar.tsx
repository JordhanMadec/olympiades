import { BowArrow, Calendar, LucideIcon, Trophy, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { path: "/rankings", label: "Classement", icon: Trophy },
  { path: "/teams", label: "Équipes", icon: Users },
  { path: "/games", label: "Épreuves", icon: BowArrow },
  { path: "/programme", label: "Rencontres", icon: Calendar },
];

export function MobileMenuBar() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/rankings" && location.pathname === "/") return true;
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <nav className="lg:hidden sticky bottom-0 z-20 bg-surface-100 border-t border-surface-border px-4 py-2 flex items-center justify-around">
      {navItems.map(({ path, label, icon: Icon }) => {
        const active = isActive(path);
        return (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center justify-center text-center gap-1 h-12 w-12 rounded-lg transition-all duration-150 ${
              active ? "text-primary-500 " : "text-zinc-400 hover:text-white"
            }`}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="text-[8px]">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
