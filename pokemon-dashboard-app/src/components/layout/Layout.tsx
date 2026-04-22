'use client'

import { Navigation } from './Navigation'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useDuckDB } from '@/app/DuckDBProvider'

export function Layout({ children }: { children: React.ReactNode }) {
  const { loading, error } = useDuckDB()

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <Navigation />
      <main className="flex-1">
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <LoadingSpinner size={64} />
            <p className="text-white/60 text-sm font-[family-name:var(--font-pixel)] tracking-wider">
              INITIALIZING DATABASE...
            </p>
          </div>
        )}
        {error && (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <p className="text-red-400 text-sm">Failed to initialize DuckDB</p>
            <p className="text-white/40 text-xs">{error.message}</p>
          </div>
        )}
        {!loading && !error && children}
      </main>
      <footer className="glass border-t border-white/10 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-white/40">
          <span className="font-[family-name:var(--font-pixel)] tracking-wider">CYBERDEX v1.0</span>
          <span>Powered by DuckDB WASM</span>
        </div>
      </footer>
    </div>
  )
}
