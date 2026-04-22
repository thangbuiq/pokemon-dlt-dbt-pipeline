'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { useDuckDBQuery } from '@/lib/duckdb/hooks'
import { GET_ALL_POKEMON } from '@/lib/duckdb/queries'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { type PokemonType, typeColorMap } from '@/lib/design-tokens'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

// ─── Constants ───────────────────────────────────────────────────────────────

const ALL_TYPES: PokemonType[] = [
  'normal',
  'fire',
  'water',
  'grass',
  'electric',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
]

type SortKey = 'id' | 'name' | 'total_stats'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'id', label: '#' },
  { key: 'name', label: 'Name' },
  { key: 'total_stats', label: 'Stats' },
]

const STAT_META: {
  key: 'hp' | 'attack' | 'defense' | 'special_attack' | 'special_defense' | 'speed'
  label: string
}[] = [
  { key: 'hp', label: 'HP' },
  { key: 'attack', label: 'ATK' },
  { key: 'defense', label: 'DEF' },
  { key: 'special_attack', label: 'SP.ATK' },
  { key: 'special_defense', label: 'SP.DEF' },
  { key: 'speed', label: 'SPD' },
]

const STAT_MAX = 255

const OFFICIAL_ARTWORK = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`

// ─── Types ──────────────────────────────────────────────────────────────────

interface PokemonRow {
  id: number
  name: string
  height: number
  weight: number
  sprite_url: string
  color: string
  type_names: string
  hp: number
  attack: number
  defense: number
  special_attack: number
  special_defense: number
  speed: number
  total_stats: number
  types: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseTypes(p: PokemonRow): PokemonType[] {
  const raw = p.types || p.type_names || ''
  return raw
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter((t): t is PokemonType => t in typeColorMap)
}

function primaryTypeOf(p: PokemonRow): PokemonType {
  return parseTypes(p)[0] ?? 'normal'
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Home() {
  const [search, setSearch] = useState('')
  const [activeTypes, setActiveTypes] = useState<Set<PokemonType>>(new Set())
  const [sortBy, setSortBy] = useState<SortKey>('id')
  const [selected, setSelected] = useState<PokemonRow | null>(null)
  const [detailReady, setDetailReady] = useState(false)

  const { data, loading, error } = useDuckDBQuery<PokemonRow>(GET_ALL_POKEMON)

  // Animate detail stat bars after mount
  useEffect(() => {
    if (selected) {
      setDetailReady(false)
      const raf = requestAnimationFrame(() => setDetailReady(true))
      return () => cancelAnimationFrame(raf)
    }
    setDetailReady(false)
  }, [selected])

  const toggleType = useCallback((type: PokemonType) => {
    setActiveTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }, [])

  const filtered = useMemo(() => {
    if (!data) return []

    let result = data

    // Search filter
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((p) => p.name.toLowerCase().includes(q))
    }

    // Type filter
    if (activeTypes.size > 0) {
      result = result.filter((p) => parseTypes(p).some((t) => activeTypes.has(t)))
    }

    // Sort
    return [...result].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'total_stats') return b.total_stats - a.total_stats
      return a.id - b.id
    })
  }, [data, search, activeTypes, sortBy])

  // ─── Loading / Error ────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <LoadingSpinner size={64} />
        <p className="text-white/60 text-sm font-[family-name:var(--font-pixel)] tracking-wider">
          LOADING POKEMON...
        </p>
      </div>
    )
  }

  if (error) {
    return (
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
        <p className="text-red-400 text-sm">Failed to load Pokemon data</p>
        <p className="text-white/40 text-xs">{error.message}</p>
      </div>
    )
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">
          Cyberpunk{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--type-fire)] to-[var(--type-electric)]">
            Pokedex
          </span>
        </h1>
        <p className="text-white/40 text-sm">Browse and search the complete Pokemon database</p>
      </div>

      {/* ── Search & Sort ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Pokemon..."
            className="w-full pl-10 pr-10 py-2.5 rounded-lg glass text-white text-sm placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/30 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
              aria-label="Clear search"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex gap-1.5">
          {SORT_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={[
                'px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300 border',
                sortBy === key
                  ? 'glass text-white border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.08)]'
                  : 'text-white/40 hover:text-white/70 border-transparent hover:bg-white/5',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Type Filter Pills ──────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-6">
        {ALL_TYPES.map((type) => {
          const isActive = activeTypes.has(type)
          const color = typeColorMap[type]
          return (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className={[
                'px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 border',
                isActive ? 'scale-105' : 'opacity-50 hover:opacity-80',
              ].join(' ')}
              style={{
                backgroundColor: isActive ? `${color}30` : `${color}0a`,
                color,
                borderColor: isActive ? `${color}80` : `${color}25`,
                boxShadow: isActive ? `0 0 12px ${color}40, 0 0 4px ${color}20` : 'none',
              }}
            >
              {type}
            </button>
          )
        })}
      </div>

      {/* ── Results Count ──────────────────────────────────────────────── */}
      <p className="text-white/30 text-xs mb-4">{filtered.length} Pokemon found</p>

      {/* ── Pokemon Grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((pokemon) => {
          const types = parseTypes(pokemon)
          const primary = primaryTypeOf(pokemon)
          const primaryColor = typeColorMap[primary]

          return (
            <Card key={pokemon.id} pokemonType={primary} hover className="cursor-pointer group">
              <button
                onClick={() => setSelected(pokemon)}
                className="w-full text-left bg-transparent border-0 p-0 m-0"
              >
                <div className="relative w-full aspect-square mb-3 flex items-center justify-center overflow-hidden rounded-lg">
                  <div
                    className="absolute inset-0 opacity-20 group-hover:opacity-35 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle at center, ${primaryColor}50 0%, transparent 70%)`,
                    }}
                  />
                  <Image
                    src={OFFICIAL_ARTWORK(pokemon.id)}
                    alt={pokemon.name}
                    width={120}
                    height={120}
                    className="relative z-10 group-hover:scale-110 transition-transform duration-500"
                    unoptimized
                  />
                </div>

                <h3 className="text-white font-semibold text-sm capitalize mb-0.5 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/70 transition-all duration-300">
                  {pokemon.name}
                </h3>

                <p className="text-white/30 text-[10px] mb-2 font-[family-name:var(--font-pixel)] tracking-wider">
                  #{String(pokemon.id).padStart(3, '0')}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {types.map((type) => (
                    <Badge key={type} type={type} />
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-white/40 text-xs">Total</span>
                  <span className="text-sm font-bold" style={{ color: primaryColor }}>
                    {pokemon.total_stats}
                  </span>
                </div>
              </button>
            </Card>
          )
        })}
      </div>

      {/* ── Empty State ────────────────────────────────────────────────── */}
      {filtered.length === 0 && !loading && (
        <div className="text-center py-20">
          <p className="text-white/40 text-lg mb-2">No Pokemon found</p>
          <p className="text-white/20 text-sm">Try adjusting your search or filters</p>
        </div>
      )}

      {/* ── Detail Modal ───────────────────────────────────────────────── */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          <div
            className="relative glass rounded-2xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto animate-[slide-in_0.3s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition-colors z-10"
              aria-label="Close detail view"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4">
                <div
                  className="absolute inset-0 rounded-full opacity-30 scale-150"
                  style={{
                    background: `radial-gradient(circle at center, ${typeColorMap[primaryTypeOf(selected)]}60 0%, transparent 70%)`,
                  }}
                />
                <Image
                  src={OFFICIAL_ARTWORK(selected.id)}
                  alt={selected.name}
                  width={180}
                  height={180}
                  className="relative z-10"
                  unoptimized
                />
              </div>

              <h2 className="text-2xl font-bold text-white capitalize mb-1">{selected.name}</h2>
              <p className="text-white/40 text-sm font-[family-name:var(--font-pixel)] tracking-wider">
                #{String(selected.id).padStart(3, '0')}
              </p>

              <div className="flex gap-2 mt-3">
                {parseTypes(selected).map((type) => (
                  <Badge key={type} type={type} />
                ))}
              </div>

              <div className="flex gap-8 mt-4 text-sm">
                <div className="text-center">
                  <p className="text-white/40 text-xs mb-0.5">Height</p>
                  <p className="text-white font-semibold">{(selected.height / 10).toFixed(1)} m</p>
                </div>
                <div className="text-center">
                  <p className="text-white/40 text-xs mb-0.5">Weight</p>
                  <p className="text-white font-semibold">{(selected.weight / 10).toFixed(1)} kg</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">
                Base Stats
              </h3>

              {STAT_META.map(({ key, label }) => {
                const value = selected[key] as number
                const pct = Math.min((value / STAT_MAX) * 100, 100)
                const color = typeColorMap[primaryTypeOf(selected)]

                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-white/50 text-xs w-14 text-right font-semibold shrink-0">
                      {label}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: detailReady ? `${pct}%` : '0%',
                          background: `linear-gradient(90deg, ${color}80, ${color})`,
                          boxShadow: detailReady ? `0 0 8px ${color}40` : 'none',
                          transition: 'width 0.7s ease-out, box-shadow 0.7s ease-out',
                        }}
                      />
                    </div>
                    <span className="text-white/70 text-xs w-8 text-right font-mono shrink-0">
                      {value}
                    </span>
                  </div>
                )
              })}

              <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                <span className="text-white/70 text-xs w-14 text-right font-bold shrink-0">
                  TOTAL
                </span>
                <div className="flex-1" />
                <span
                  className="text-sm font-bold shrink-0"
                  style={{ color: typeColorMap[primaryTypeOf(selected)] }}
                >
                  {selected.total_stats}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
