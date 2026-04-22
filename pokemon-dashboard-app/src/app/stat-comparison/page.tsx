'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { useDuckDB } from '@/app/DuckDBProvider'
import { useDuckDBQuery } from '@/lib/duckdb/hooks'
import { Card } from '@/components/ui/Card'
import { PokemonSprite } from '@/components/ui/PokemonSprite'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

// ─── Types ───────────────────────────────────────────────────────────────────

interface PokemonStats {
  id: number
  name: string
  hp: number
  attack: number
  defense: number
  special_attack: number
  special_defense: number
  speed: number
}

interface RadarDataPoint {
  stat: string
  fullMark: number
  [key: string]: string | number
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  special_attack: 'Sp. Atk',
  special_defense: 'Sp. Def',
  speed: 'Speed',
}

const STAT_KEYS = ['hp', 'attack', 'defense', 'special_attack', 'special_defense', 'speed'] as const
const MAX_STAT = 255

const COMPARISON_COLORS = [
  '#ff6b35', // fire-orange
  '#3b82f6', // water-blue
  '#22c55e', // grass-green
  '#facc15', // electric-yellow
  '#ec4899', // psychic-pink
  '#67e8f9', // ice-cyan
]

const ALL_POKEMON_QUERY = `
  SELECT id, name, hp, attack, defense, special_attack, special_defense, speed
  FROM pokemon_db.dim_pokemon
  ORDER BY id
`

const MAX_SELECTED = 6

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildRadarData(pokemonList: PokemonStats[]): RadarDataPoint[] {
  return STAT_KEYS.map((key) => {
    const point: RadarDataPoint = { stat: STAT_LABELS[key], fullMark: MAX_STAT }
    for (const p of pokemonList) {
      point[p.name] = p[key]
    }
    return point
  })
}

function getTotalStats(p: PokemonStats): number {
  return p.hp + p.attack + p.defense + p.special_attack + p.special_defense + p.speed
}

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs border border-white/20">
      <p className="text-white font-semibold mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-white/70">{entry.name}:</span>
          <span className="text-white font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Pokemon Selector ────────────────────────────────────────────────────────

function PokemonSelector({
  allPokemon,
  selected,
  onToggle,
}: {
  allPokemon: PokemonStats[]
  selected: PokemonStats[]
  onToggle: (pokemon: PokemonStats) => void
}) {
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return allPokemon.slice(0, 50)
    return allPokemon.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 50)
  }, [allPokemon, search])

  const selectedIds = useMemo(() => new Set(selected.map((p) => p.id)), [selected])
  const canSelectMore = selected.length < MAX_SELECTED

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-xs font-[family-name:var(--font-pixel)] text-white/50 tracking-wider mb-2">
        ADD POKEMON
      </label>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full glass rounded-lg px-4 py-3 text-left text-sm text-white/70 hover:bg-white/10 transition-colors flex items-center justify-between"
      >
        <span>{canSelectMore ? 'Search Pokemon...' : `Max ${MAX_SELECTED} selected`}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-40 mt-2 w-full glass rounded-lg border border-white/10 shadow-xl shadow-black/50 max-h-80 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-white/10">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type to search..."
              className="w-full bg-white/5 rounded-md px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:ring-1 focus:ring-[var(--type-fighting)]"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center text-white/30 text-sm">No Pokemon found</div>
            ) : (
              filtered.map((p) => {
                const isSelected = selectedIds.has(p.id)
                const isDisabled = !isSelected && !canSelectMore
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      if (!isDisabled) onToggle(p)
                    }}
                    disabled={isDisabled}
                    className={[
                      'w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors',
                      isSelected
                        ? 'bg-white/10 text-white'
                        : isDisabled
                          ? 'text-white/20 cursor-not-allowed'
                          : 'text-white/70 hover:bg-white/5 hover:text-white',
                    ].join(' ')}
                  >
                    <PokemonSprite pokemonId={p.id} size={28} alt={p.name} />
                    <span className="capitalize font-medium">{p.name}</span>
                    <span className="ml-auto text-white/30 text-xs">
                      #{String(p.id).padStart(3, '0')}
                    </span>
                    {isSelected && (
                      <svg
                        className="w-4 h-4 text-[var(--type-fighting)]"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Selected Pokemon Chips ──────────────────────────────────────────────────

function SelectedChips({
  selected,
  onRemove,
}: {
  selected: PokemonStats[]
  onRemove: (id: number) => void
}) {
  if (selected.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {selected.map((p, i) => (
        <div
          key={p.id}
          className="group flex items-center gap-2 glass rounded-full pl-1 pr-3 py-1 transition-all duration-300 hover:shadow-[0_0_12px_var(--glow)]"
          style={{ '--glow': COMPARISON_COLORS[i] } as React.CSSProperties}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center overflow-hidden"
            style={{
              backgroundColor: `${COMPARISON_COLORS[i]}20`,
              border: `1px solid ${COMPARISON_COLORS[i]}60`,
            }}
          >
            <PokemonSprite pokemonId={p.id} size={24} alt={p.name} />
          </div>
          <span className="text-sm text-white capitalize font-medium">{p.name}</span>
          <button
            onClick={() => onRemove(p.id)}
            className="text-white/40 hover:text-white transition-colors"
            aria-label={`Remove ${p.name}`}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}

// ─── Stats Table ─────────────────────────────────────────────────────────────

function StatsTable({ selected }: { selected: PokemonStats[] }) {
  if (selected.length === 0) return null

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-white/40 font-normal text-xs uppercase tracking-wider">
                Stat
              </th>
              {selected.map((p, i) => (
                <th
                  key={p.id}
                  className="text-center py-3 px-4 font-semibold text-xs uppercase tracking-wider"
                  style={{ color: COMPARISON_COLORS[i] }}
                >
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {STAT_KEYS.map((key) => {
              const values = selected.map((p) => p[key])
              const maxVal = Math.max(...values)

              return (
                <tr
                  key={key}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3 px-4 text-white/70 font-medium">{STAT_LABELS[key]}</td>
                  {selected.map((p, i) => {
                    const val = p[key]
                    const isMax = val === maxVal && selected.length > 1
                    const barWidth = (val / MAX_STAT) * 100
                    return (
                      <td key={p.id} className="py-3 px-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={[
                              'font-bold tabular-nums',
                              isMax ? 'text-white' : 'text-white/60',
                            ].join(' ')}
                            style={isMax ? { color: COMPARISON_COLORS[i] } : undefined}
                          >
                            {val}
                          </span>
                          <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${barWidth}%`,
                                backgroundColor: COMPARISON_COLORS[i],
                                opacity: isMax ? 1 : 0.5,
                              }}
                            />
                          </div>
                        </div>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
            <tr className="border-t-2 border-white/10">
              <td className="py-3 px-4 text-white font-bold">Total</td>
              {selected.map((p, i) => {
                const total = getTotalStats(p)
                const totals = selected.map(getTotalStats)
                const isMax = total === Math.max(...totals) && selected.length > 1
                return (
                  <td key={p.id} className="py-3 px-4 text-center">
                    <span
                      className="font-bold tabular-nums text-lg"
                      style={{ color: isMax ? COMPARISON_COLORS[i] : 'rgba(255,255,255,0.5)' }}
                    >
                      {total}
                    </span>
                  </td>
                )
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function StatComparisonPage() {
  const { db, loading: dbLoading, error: dbError } = useDuckDB()
  const {
    data: allPokemon,
    loading: dataLoading,
    error: dataError,
  } = useDuckDBQuery<PokemonStats>(ALL_POKEMON_QUERY)
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const selectedPokemon = useMemo(() => {
    if (!allPokemon) return []
    return selectedIds
      .map((id) => allPokemon.find((p) => p.id === id))
      .filter(Boolean) as PokemonStats[]
  }, [allPokemon, selectedIds])

  const radarData = useMemo(() => buildRadarData(selectedPokemon), [selectedPokemon])

  const handleToggle = useCallback((pokemon: PokemonStats) => {
    setSelectedIds((prev) => {
      if (prev.includes(pokemon.id)) {
        return prev.filter((id) => id !== pokemon.id)
      }
      if (prev.length >= MAX_SELECTED) return prev
      return [...prev, pokemon.id]
    })
  }, [])

  const handleRemove = useCallback((id: number) => {
    setSelectedIds((prev) => prev.filter((pid) => pid !== id))
  }, [])

  if (dbLoading || dataLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <LoadingSpinner size={64} />
        <p className="text-white/60 text-sm font-[family-name:var(--font-pixel)] tracking-wider">
          LOADING POKEMON DATA...
        </p>
      </div>
    )
  }

  if (dbError || dataError || !db) {
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
        {(dbError || dataError) && (
          <p className="text-white/40 text-xs">{(dbError || dataError)?.message}</p>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-8 sm:mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: 'var(--type-fighting)',
              boxShadow: '0 0 12px var(--type-fighting)40',
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="w-5 h-5">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Stat{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--type-fighting)] to-[var(--type-fire)]">
                Comparison
              </span>
            </h1>
            <p className="text-white/40 text-sm">
              Compare base stats across Pokemon with radar charts
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <div className="space-y-4">
          <Card>
            <PokemonSelector
              allPokemon={allPokemon ?? []}
              selected={selectedPokemon}
              onToggle={handleToggle}
            />
          </Card>

          <SelectedChips selected={selectedPokemon} onRemove={handleRemove} />

          <Card>
            <label className="block text-xs font-[family-name:var(--font-pixel)] text-white/50 tracking-wider mb-3">
              QUICK COMPARE
            </label>
            <div className="space-y-2">
              <PresetButton
                label="Starter Trio"
                pokemonIds={[1, 4, 7]}
                allPokemon={allPokemon ?? []}
                selectedIds={selectedIds}
                onSelect={setSelectedIds}
              />
              <PresetButton
                label="Legendary Birds"
                pokemonIds={[144, 145, 146]}
                allPokemon={allPokemon ?? []}
                selectedIds={selectedIds}
                onSelect={setSelectedIds}
              />
              <PresetButton
                label="Mewtwo vs Mew"
                pokemonIds={[150, 151]}
                allPokemon={allPokemon ?? []}
                selectedIds={selectedIds}
                onSelect={setSelectedIds}
              />
              <PresetButton
                label="Eeveelutions"
                pokemonIds={[134, 135, 136]}
                allPokemon={allPokemon ?? []}
                selectedIds={selectedIds}
                onSelect={setSelectedIds}
              />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="flex flex-col items-center">
            {selectedPokemon.length === 0 ? (
              <div className="py-16 sm:py-24 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white/20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <p className="text-white/30 text-sm">Select Pokemon to compare their stats</p>
                <p className="text-white/20 text-xs mt-1">
                  Choose up to {MAX_SELECTED} Pokemon from the sidebar
                </p>
              </div>
            ) : (
              <>
                <div className="w-full" style={{ minHeight: 380 }}>
                  <ResponsiveContainer width="100%" height={380}>
                    <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                      <PolarGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                      <PolarAngleAxis
                        dataKey="stat"
                        tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600 }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, MAX_STAT]}
                        tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                        tickCount={6}
                        axisLine={false}
                      />
                      {selectedPokemon.map((p, i) => (
                        <Radar
                          key={p.id}
                          name={p.name}
                          dataKey={p.name}
                          stroke={COMPARISON_COLORS[i]}
                          fill={COMPARISON_COLORS[i]}
                          fillOpacity={0.15}
                          strokeWidth={2}
                          dot={{ r: 3, fill: COMPARISON_COLORS[i] }}
                          activeDot={{
                            r: 5,
                            fill: COMPARISON_COLORS[i],
                            stroke: '#fff',
                            strokeWidth: 1,
                          }}
                        />
                      ))}
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}
                        formatter={(value: string) => (
                          <span style={{ color: 'rgba(255,255,255,0.7)' }} className="capitalize">
                            {value}
                          </span>
                        )}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </Card>

          <StatsTable selected={selectedPokemon} />
        </div>
      </div>
    </div>
  )
}

// ─── Preset Button ───────────────────────────────────────────────────────────

function PresetButton({
  label,
  pokemonIds,
  allPokemon,
  selectedIds,
  onSelect,
}: {
  label: string
  pokemonIds: number[]
  allPokemon: PokemonStats[]
  selectedIds: number[]
  onSelect: (ids: number[]) => void
}) {
  const isActive = useMemo(
    () =>
      pokemonIds.length === selectedIds.length &&
      pokemonIds.every((id) => selectedIds.includes(id)),
    [pokemonIds, selectedIds]
  )

  return (
    <button
      onClick={() => onSelect(isActive ? [] : pokemonIds)}
      className={[
        'w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200',
        isActive
          ? 'bg-[var(--type-fighting)]/20 text-white border border-[var(--type-fighting)]/40'
          : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent',
      ].join(' ')}
    >
      {label}
    </button>
  )
}
