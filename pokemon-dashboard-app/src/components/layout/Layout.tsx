'use client'

import { Navigation } from './Navigation'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <Navigation />
      <main className="flex-1">{children}</main>
      <footer className="glass border-t-2 py-4 px-6" style={{ borderColor: 'var(--card-border)' }}>
        <div
          className="max-w-7xl mx-auto flex items-center justify-between text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          <span className="font-[family-name:var(--font-pixel)] tracking-wider text-[10px]">
            CYBERDEX v1.0
          </span>
        </div>
      </footer>
    </div>
  )
}
