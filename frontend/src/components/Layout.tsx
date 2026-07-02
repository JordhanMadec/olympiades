import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-surface-100 flex">
      <Sidebar />
      <main className="flex-1 ml-56 min-h-screen">
        <div className="px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
