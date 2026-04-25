'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { type PokemonType } from '@/lib/design-tokens'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  pokemonType: PokemonType
  description: string
}

const navItems: NavItem[] = [
  {
    label: 'Pokedex',
    href: '/pokedex',
    pokemonType: 'fire',
    description: 'Browse all Pokemon',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
  },
  {
    label: 'Type Matchup',
    href: '/type-matchup',
    pokemonType: 'grass',
    description: 'Type effectiveness matrix',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 6h16M4 12h16M4 18h16M8 4v16M16 4v16"
        />
      </svg>
    ),
  },
  {
    label: 'Pokemon Matchup',
    href: '/analysis',
    pokemonType: 'dragon',
    description: 'Stat comparison & radar charts',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
  {
    label: 'Quiz',
    href: '/quiz',
    pokemonType: 'ghost',
    description: "Who's That Pokemon?",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.271 2.28-2.534 2.782-.715.271-1.466.529-1.466 1.178M12 17h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    label: 'Team Builder',
    href: '/tools',
    pokemonType: 'electric',
    description: 'Build & analyze teams',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 20h5v-2a3 3 0 00-5.354-1.853M17 20H7m10 0v-2c0-.656-.126-1.283-.354-1.853M7 20H2v-2a3 3 0 015.354-1.853M7 20v-2c0-.656.126-1.283.354-1.853m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
  },
]

export function Navigation() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav
      className="glass sticky top-0 z-50 border-b-2"
      style={{ borderColor: 'var(--card-border)' }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
            <Image
              src="/pokeball.png"
              alt="Pokédex"
              width={32}
              height={32}
              className="w-7 h-7 sm:w-8 sm:h-8"
            />
            <span
              className="font-[family-name:var(--font-pixel)] text-[10px] sm:text-xs tracking-wider"
              style={{ color: 'var(--text-primary)' }}
            >
              Pokédex
            </span>
          </Link>

          <div className="hidden xl:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    'flex items-center gap-1.5 px-3 py-2 rounded-md font-[family-name:var(--font-pixel)] text-[9px] tracking-wider transition-all duration-300 relative',
                    isActive
                      ? ''
                      : 'after:absolute after:bottom-1 after:left-3 after:right-3 after:h-0.5 after:bg-current after:scale-x-0 hover:after:scale-x-100 after:origin-left',
                  ].join(' ')}
                  style={
                    {
                      '--glow': `var(--type-${item.pokemonType})`,
                      color: isActive ? `var(--type-${item.pokemonType})` : 'var(--text-secondary)',
                    } as React.CSSProperties
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="xl:hidden p-2 rounded-md transition-colors"
            style={{ color: 'var(--text-primary)' }}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          className="xl:hidden glass border-t-2 animate-[slide-in_0.3s_ease-out]"
          style={{ borderColor: 'var(--card-border)' }}
        >
          <div className="px-3 py-2 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={[
                    'flex items-center gap-3 px-3 py-2.5 rounded-md font-[family-name:var(--font-pixel)] text-[10px] tracking-wider transition-all duration-300',
                    isActive ? 'bg-[var(--surface-light)]' : 'hover:bg-[var(--surface-light)]',
                  ].join(' ')}
                  style={{
                    color: isActive ? `var(--type-${item.pokemonType})` : 'var(--text-primary)',
                  }}
                >
                  {item.icon}
                  <div className="flex flex-col">
                    <span>{item.label}</span>
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {item.description}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}
