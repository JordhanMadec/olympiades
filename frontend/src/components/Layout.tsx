import { MobileMenuBar } from "@/components/MobileMenuBar.tsx";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-surface-50 flex">
      {/* Sidebar - Desktop: toujours visible, Mobile: overlay */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Overlay pour mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-56 min-h-screen w-full">
        {/* Mobile header avec burger menu */}
        <div className="lg:hidden sticky top-0 z-20 bg-surface-100 border-b border-surface-border px-4 py-3 flex items-center justify-between">
          {isAuthenticated && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-surface-200 transition-colors"
              aria-label="Ouvrir le menu"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">Olympiades 2026</span>
          </div>
          <div className="w-10"></div> {/* Spacer pour centrer le titre */}
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 min-h-screen">{children}</div>

        {/* Mobile menu */}
        <MobileMenuBar />
      </main>
    </div>
  );
}
