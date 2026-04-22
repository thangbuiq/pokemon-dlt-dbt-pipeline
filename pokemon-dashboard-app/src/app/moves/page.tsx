'use client'

import { useState, useMemo } from 'react'
import { useDuckDBQuery } from '@/lib/duckdb/hooks'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { type PokemonType, typeColorMap } from '@/lib/design-tokens'

// ─── Types ───────────────────────────────────────────────────────────────────

interface MoveData {
  id: number
  name: string
  type__name: string
  power: number | null
  accuracy: number | null
  pp: number
  damage_class__name: string
  meta__category__name: string
  effect_short: string | null
  effect_full: string | null
}

type SortKey = 'name' | 'power' | 'accuracy' | 'pp'
type SortDir = 'asc' | 'desc'
type DamageClass = 'physical' | 'special' | 'status'

// ─── Constants ───────────────────────────────────────────────────────────────

const ALL_TYPES: PokemonType[] = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
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

const DAMAGE_CLASS_CONFIG: Record<
  DamageClass,
  { label: string; color: string; icon: React.ReactNode }
> = {
  physical: {
    label: 'Physical',
    color: '#ef4444',
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M8 1l2 5h5l-4 3 1.5 5L8 11 3.5 14 5 9 1 6h5z" />
      </svg>
    ),
  },
  special: {
    label: 'Special',
    color: '#3b82f6',
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
        <circle cx="8" cy="8" r="3" />
        <path
          d="M8 1a7 7 0 017 7h-2a5 5 0 00-5-5V1zM1 8a7 7 0 017-7v2a5 5 0 00-5 5H1z"
          opacity="0.6"
        />
      </svg>
    ),
  },
  status: {
    label: 'Status',
    color: '#94a3b8',
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 2a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 4.5a3 3 0 00-3 3h6a3 3 0 00-3-3z" />
      </svg>
    ),
  },
}

const MOVES_QUERY = `
  SELECT
    m.id,
    m.name,
    m.type__name,
    m.power,
    m.accuracy,
    m.pp,
    m.damage_class__name,
    m.meta__category__name,
    e.short_effect as effect_short,
    e.effect as effect_full
  FROM pokemon_db.pokemon_moves m
  LEFT JOIN pokemon_db.pokemon_moves__effect_entries e
    ON m._dlt_id = e._dlt_parent_id AND e.language__name = 'en'
  ORDER BY m.id
`

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatMoveName(name: string): string {
  return name
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function toPokemonType(typeName: string): PokemonType {
  if (ALL_TYPES.includes(typeName as PokemonType)) {
    return typeName as PokemonType
  }
  return 'normal'
}

// ─── Damage Class Badge ──────────────────────────────────────────────────────

function DamageClassBadge({ damageClass }: { damageClass: string }) {
  const config = DAMAGE_CLASS_CONFIG[damageClass as DamageClass] ?? DAMAGE_CLASS_CONFIG.status

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
      style={{
        backgroundColor: `${config.color}20`,
        color: config.color,
        border: `1px solid ${config.color}40`,
      }}
    >
      {config.icon}
      {config.label}
    </span>
  )
}

// ─── Stat Bar ────────────────────────────────────────────────────────────────

function StatBar({
  label,
  value,
  max,
  color,
}: {
  label: string
  value: number | null
  max: number
  color: string
}) {
  if (value === null) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-white/40 text-xs w-14 text-right">{label}</span>
        <span className="text-white/20 text-xs">—</span>
      </div>
    )
  }

  const pct = Math.min((value / max) * 100, 100)

  return (
    <div className="flex items-center gap-2">
      <span className="text-white/50 text-xs w-14 text-right">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            backgroundColor: color,
            boxShadow: `0 0 6px ${color}60`,
          }}
        />
      </div>
      <span className="text-white/70 text-xs font-medium tabular-nums w-8 text-right">{value}</span>
    </div>
  )
}

// ─── Move Card ───────────────────────────────────────────────────────────────

function MoveCard({ move }: { move: MoveData }) {
  const pokemonType = toPokemonType(move.type__name)
  const typeColor = typeColorMap[pokemonType]
  const isStatus = move.damage_class__name === 'status'

  return (
    <Card pokemonType={isStatus ? undefined : pokemonType} className="h-full flex flex-col">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm truncate">{formatMoveName(move.name)}</h3>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Badge type={pokemonType} />
            <DamageClassBadge damageClass={move.damage_class__name} />
          </div>
        </div>
        {!isStatus && move.power !== null && (
          <div
            className="text-2xl font-bold tabular-nums shrink-0"
            style={{
              color: typeColor,
              textShadow: `0 0 12px ${typeColor}40`,
            }}
          >
            {move.power}
          </div>
        )}
      </div>

      <div className="space-y-1.5 flex-1">
        <StatBar label="Power" value={move.power} max={250} color={typeColor} />
        <StatBar label="Accuracy" value={move.accuracy} max={100} color="#22c55e" />
        <StatBar label="PP" value={move.pp} max={40} color="#facc15" />
      </div>

      {move.effect_short && (
        <div className="mt-3 pt-2 border-t border-white/5">
          <p className="text-white/40 text-xs leading-relaxed line-clamp-2">{move.effect_short}</p>
        </div>
      )}
    </Card>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MovesExplorerPage() {
  const { data: rawMoves, loading, error } = useDuckDBQuery<MoveData>(MOVES_QUERY)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [powerRange, setPowerRange] = useState<[number, number]>([0, 300])
  const [accuracyRange, setAccuracyRange] = useState<[number, number]>([0, 100])
  const [sortKey, setSortKey] = useState<SortKey>('power')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const moves = useMemo(() => {
    if (!rawMoves) return []
    return rawMoves.map((m) => ({
      ...m,
      type__name: m.type__name?.toLowerCase() ?? 'normal',
    }))
  }, [rawMoves])

  const filteredMoves = useMemo(() => {
    let result = moves

    // Search by name
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter((m) => m.name.toLowerCase().includes(q))
    }

    // Filter by type
    if (selectedType !== 'all') {
      result = result.filter((m) => m.type__name === selectedType)
    }

    // Filter by damage class
    if (selectedClass !== 'all') {
      result = result.filter((m) => m.damage_class__name === selectedClass)
    }

    // Filter by power range
    result = result.filter((m) => {
      const p = m.power ?? 0
      return p >= powerRange[0] && p <= powerRange[1]
    })

    // Filter by accuracy range
    result = result.filter((m) => {
      const a = m.accuracy ?? 0
      return a >= accuracyRange[0] && a <= accuracyRange[1]
    })

    // Sort
    result.sort((a, b) => {
      let aVal: number, bVal: number
      switch (sortKey) {
        case 'name':
          return sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
        case 'power':
          aVal = a.power ?? (a.damage_class__name === 'status' ? -1 : 0)
          bVal = b.power ?? (b.damage_class__name === 'status' ? -1 : 0)
          break
        case 'accuracy':
          aVal = a.accuracy ?? 0
          bVal = b.accuracy ?? 0
          break
        case 'pp':
          aVal = a.pp
          bVal = b.pp
          break
        default:
          return 0
      }
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal
    })

    return result
  }, [moves, searchQuery, selectedType, selectedClass, powerRange, accuracyRange, sortKey, sortDir])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === 'name' ? 'asc' : 'desc')
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedType('all')
    setSelectedClass('all')
    setPowerRange([0, 300])
    setAccuracyRange([0, 100])
  }

  const hasActiveFilters =
    searchQuery ||
    selectedType !== 'all' ||
    selectedClass !== 'all' ||
    powerRange[0] !== 0 ||
    powerRange[1] !== 300 ||
    accuracyRange[0] !== 0 ||
    accuracyRange[1] !== 100

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <LoadingSpinner size={64} />
        <p className="text-white/60 text-sm font-[family-name:var(--font-pixel)] tracking-wider">
          LOADING MOVE DATA...
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
        <p className="text-red-400 text-sm">Failed to load move data</p>
        <p className="text-white/40 text-xs">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[var(--type-water)] to-[var(--type-ice)] border-2 border-white/20 shadow-[0_0_20px_var(--type-water)40] mb-4">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="w-6 h-6 text-white"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
          Move{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--type-water)] to-[var(--type-ice)]">
            Explorer
          </span>
        </h1>
        <p className="text-white/40 text-sm max-w-lg mx-auto">
          Search and filter moves by type, category, power, and accuracy. Discover the perfect move
          for your strategy.
        </p>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4 sm:p-5 mb-6 space-y-4">
        {/* Search + Sort Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 glass rounded-lg flex items-center gap-2 px-3 py-2.5">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="w-4 h-4 text-white/40 shrink-0"
            >
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search moves by name..."
              className="bg-transparent text-white text-sm placeholder-white/30 outline-none flex-1"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-white/40 hover:text-white/70 transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="w-4 h-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <span className="text-white/40 text-xs font-[family-name:var(--font-pixel)] tracking-wider shrink-0">
              SORT
            </span>
            {(['power', 'accuracy', 'pp', 'name'] as SortKey[]).map((key) => (
              <button
                key={key}
                onClick={() => handleSort(key)}
                className={[
                  'px-2.5 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all duration-200',
                  sortKey === key
                    ? 'bg-white/10 text-white shadow-[0_0_8px_var(--type-water)]'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/5',
                ].join(' ')}
                style={sortKey === key ? { color: 'var(--type-water)' } : undefined}
              >
                {key}
                {sortKey === key && <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Type Filter */}
          <div className="flex-1">
            <label className="block text-[10px] uppercase tracking-widest text-white/30 font-[family-name:var(--font-pixel)] mb-1.5">
              Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full glass rounded-md px-3 py-2 text-sm text-white bg-transparent outline-none cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 8px center',
              }}
            >
              <option value="all" className="bg-[var(--surface)]">
                All Types
              </option>
              {ALL_TYPES.map((t) => (
                <option key={t} value={t} className="bg-[var(--surface)]">
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Damage Class Filter */}
          <div className="flex-1">
            <label className="block text-[10px] uppercase tracking-widest text-white/30 font-[family-name:var(--font-pixel)] mb-1.5">
              Category
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full glass rounded-md px-3 py-2 text-sm text-white bg-transparent outline-none cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 8px center',
              }}
            >
              <option value="all" className="bg-[var(--surface)]">
                All Categories
              </option>
              <option value="physical" className="bg-[var(--surface)]">
                Physical
              </option>
              <option value="special" className="bg-[var(--surface)]">
                Special
              </option>
              <option value="status" className="bg-[var(--surface)]">
                Status
              </option>
            </select>
          </div>

          {/* Power Range */}
          <div className="flex-1">
            <label className="block text-[10px] uppercase tracking-widest text-white/30 font-[family-name:var(--font-pixel)] mb-1.5">
              Power: {powerRange[0]}–{powerRange[1]}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={300}
                value={powerRange[0]}
                onChange={(e) =>
                  setPowerRange((prev) => [Math.min(Number(e.target.value), prev[1]), prev[1]])
                }
                className="flex-1 accent-[var(--type-water)]"
              />
              <input
                type="range"
                min={0}
                max={300}
                value={powerRange[1]}
                onChange={(e) =>
                  setPowerRange((prev) => [prev[0], Math.max(Number(e.target.value), prev[0])])
                }
                className="flex-1 accent-[var(--type-water)]"
              />
            </div>
          </div>

          {/* Accuracy Range */}
          <div className="flex-1">
            <label className="block text-[10px] uppercase tracking-widest text-white/30 font-[family-name:var(--font-pixel)] mb-1.5">
              Accuracy: {accuracyRange[0]}%–{accuracyRange[1]}%
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={100}
                value={accuracyRange[0]}
                onChange={(e) =>
                  setAccuracyRange((prev) => [Math.min(Number(e.target.value), prev[1]), prev[1]])
                }
                className="flex-1 accent-[var(--type-grass)]"
              />
              <input
                type="range"
                min={0}
                max={100}
                value={accuracyRange[1]}
                onChange={(e) =>
                  setAccuracyRange((prev) => [prev[0], Math.max(Number(e.target.value), prev[0])])
                }
                className="flex-1 accent-[var(--type-grass)]"
              />
            </div>
          </div>
        </div>

        {/* Active Filters + Clear */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <span className="text-white/30 text-xs">
              {filteredMoves.length} of {moves.length} moves
            </span>
            <button
              onClick={clearFilters}
              className="text-xs text-white/40 hover:text-white/70 transition-colors uppercase tracking-wider font-[family-name:var(--font-pixel)]"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {filteredMoves.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <div className="text-white/20 text-4xl mb-3">⚡</div>
          <p className="text-white/40 text-sm">No moves found matching your filters</p>
          <p className="text-white/25 text-xs mt-1">Try adjusting your search or filter criteria</p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 rounded-md text-sm text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMoves.map((move, i) => (
            <div
              key={move.id}
              className="animate-[slide-in_0.3s_ease-out]"
              style={{ animationDelay: `${Math.min(i * 30, 300)}ms`, animationFillMode: 'both' }}
            >
              <MoveCard move={move} />
            </div>
          ))}
        </div>
      )}

      {/* Results count */}
      {!hasActiveFilters && filteredMoves.length > 0 && (
        <div className="mt-6 text-center">
          <span className="text-white/25 text-xs font-[family-name:var(--font-pixel)] tracking-wider">
            {filteredMoves.length} MOVES LOADED
          </span>
        </div>
      )}
    </div>
  )
}
