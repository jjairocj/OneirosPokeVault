import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Sidebar from './Sidebar';

interface Props {
  children: React.ReactNode;
  /** Top bar content specific to the current page (title, actions, stats) */
  topBar?: React.ReactNode;
  onAuthClick?: () => void;
}

export default function AppShell({ children, topBar, onAuthClick }: Props) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-gray-900/90 backdrop-blur border-b border-gray-800 flex items-center gap-3 px-4 py-3">
          {/* Hamburger — mobile only */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-400 hover:text-white p-1"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Page-specific content injected here */}
          <div className="flex-1 min-w-0">
            {topBar}
          </div>

          {/* Sign in button for guests */}
          {!user && onAuthClick && (
            <button
              type="button"
              onClick={onAuthClick}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0"
            >
              Sign in
            </button>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
