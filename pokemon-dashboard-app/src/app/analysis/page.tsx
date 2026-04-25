'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
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
import { Card } from '@/components/ui/Card'
import { PokemonSprite } from '@/components/ui/PokemonSprite'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

// ─── Stat Comparison Types ──────────────────────────────────────────────────────

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
const COMPARISON_COLORS = ['#ff6b35', '#3b82f6', '#22c55e', '#facc15', '#ec4899', '#67e8f9']
const ALL_POKEMON_QUERY = `SELECT id, name, hp, attack, defense, special_attack, special_defense, speed FROM pokemon_db.dim_pokemon ORDER BY id`
const MAX_SELECTED = 6

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

function useJSONQuery<T>(jsonFile: string) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/data/${jsonFile}`)
      if (!response.ok) {
        throw new Error(`Failed to load ${jsonFile}: ${response.status}`)
      }
      const json = await response.json()
      setData(json as T[])
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setLoading(false)
    }
  }, [jsonFile])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs border border-[var(--card-border)]">
      <p className="text-[var(--text-primary)] font-semibold mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-[var(--text-secondary)]">{entry.name}:</span>
          <span className="text-[var(--text-primary)] font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Stat Comparison Panel ────────────────────────────────────────────────────

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
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false)
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
      <label className="block text-xs font-[family-name:var(--font-pixel)] text-[var(--text-secondary)] tracking-wider mb-2">
        ADD POKEMON
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full glass rounded-lg px-4 py-3 text-left text-sm text-[var(--text-secondary)] hover:bg-[var(--surface)] transition-colors flex items-center justify-between"
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
        <div className="absolute z-40 mt-2 w-full glass rounded-lg border border-[var(--card-border)] shadow-xl shadow-black/50 max-h-80 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-[var(--card-border)]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type to search..."
              className="w-full bg-[var(--surface)] rounded-md px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:ring-1 focus:ring-[var(--type-fighting)]"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center text-[var(--text-muted)] text-sm">
                No Pokemon found
              </div>
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
                        ? 'bg-[var(--surface)] text-[var(--text-primary)]'
                        : isDisabled
                          ? 'text-[var(--text-muted)] cursor-not-allowed'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]',
                    ].join(' ')}
                  >
                    <PokemonSprite pokemonId={p.id} size={28} alt={p.name} />
                    <span className="capitalize font-medium">{p.name}</span>
                    <span className="ml-auto text-[var(--text-muted)] text-xs">
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
          <span className="text-sm text-[var(--text-primary)] capitalize font-medium">
            {p.name}
          </span>
          <button
            onClick={() => onRemove(p.id)}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
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

function StatsTable({ selected }: { selected: PokemonStats[] }) {
  if (selected.length === 0) return null
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--card-border)]">
              <th className="text-left py-3 px-4 text-[var(--text-muted)] font-normal text-xs uppercase tracking-wider">
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
                  className="border-b border-[var(--card-border)] hover:bg-[var(--surface)] transition-colors"
                >
                  <td className="py-3 px-4 text-[var(--text-secondary)] font-medium">
                    {STAT_LABELS[key]}
                  </td>
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
                              isMax ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]',
                            ].join(' ')}
                            style={isMax ? { color: COMPARISON_COLORS[i] } : undefined}
                          >
                            {val}
                          </span>
                          <div className="w-full h-1 rounded-full bg-[var(--surface)] overflow-hidden">
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
            <tr className="border-t-2 border-[var(--card-border)]">
              <td className="py-3 px-4 text-[var(--text-primary)] font-bold">Total</td>
              {selected.map((p, i) => {
                const total = getTotalStats(p)
                const totals = selected.map(getTotalStats)
                const isMax = total === Math.max(...totals) && selected.length > 1
                return (
                  <td key={p.id} className="py-3 px-4 text-center">
                    <span
                      className="font-bold tabular-nums text-lg"
                      style={{ color: isMax ? COMPARISON_COLORS[i] : 'var(--text-secondary)' }}
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

const PRESETS = [
  { label: 'Starter Trio', ids: [1, 4, 7] },
  { label: 'Legendary Birds', ids: [144, 145, 146] },
  { label: 'Mewtwo vs Mew', ids: [150, 151] },
  { label: 'Eeveelutions', ids: [134, 135, 136] },
]

function StatComparePanel() {
  const {
    data: allPokemon,
    loading: dataLoading,
    error: dataError,
  } = useJSONQuery<PokemonStats>('pokemon.json')
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
      if (prev.includes(pokemon.id)) return prev.filter((id) => id !== pokemon.id)
      if (prev.length >= MAX_SELECTED) return prev
      return [...prev, pokemon.id]
    })
  }, [])

  const handleRemove = useCallback((id: number) => {
    setSelectedIds((prev) => prev.filter((pid) => pid !== id))
  }, [])

  if (dataLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <LoadingSpinner size={64} />
        <p className="text-[var(--text-secondary)] text-sm font-[family-name:var(--font-pixel)] tracking-wider">
          LOADING POKEMON DATA...
        </p>
      </div>
    )
  }

  if (dataError) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <p className="text-red-400 text-sm">Failed to load Pokemon data</p>
        {dataError && <p className="text-[var(--text-muted)] text-xs">{dataError.message}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="max-w-3xl mx-auto text-center mb-6">
        <p className="text-[var(--text-muted)] text-sm">
          Compare base stats across Pokemon with radar charts. Select up to 6 Pokemon.
        </p>
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
            <label className="block text-xs font-[family-name:var(--font-pixel)] text-[var(--text-secondary)] tracking-wider mb-3">
              QUICK COMPARE
            </label>
            <div className="space-y-2">
              {PRESETS.map(({ label, ids }) => {
                const isActive =
                  ids.length === selectedIds.length && ids.every((id) => selectedIds.includes(id))
                return (
                  <button
                    key={label}
                    onClick={() => setSelectedIds(isActive ? [] : ids)}
                    className={[
                      'w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200',
                      isActive
                        ? 'bg-[var(--type-fighting)]/20 text-[var(--text-primary)] border border-[var(--type-fighting)]/40'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] border border-transparent',
                    ].join(' ')}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="flex flex-col items-center">
            {selectedPokemon.length === 0 ? (
              <div className="py-16 sm:py-24 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--surface)] flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-[var(--text-muted)]"
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
                <p className="text-[var(--text-muted)] text-sm">
                  Select Pokemon to compare their stats
                </p>
                <p className="text-[var(--text-muted)] text-xs mt-1">
                  Choose up to {MAX_SELECTED} Pokemon from the sidebar
                </p>
              </div>
            ) : (
              <div className="w-full" style={{ minHeight: 380 }}>
                <ResponsiveContainer width="100%" height={380}>
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid stroke="var(--card-border)" strokeDasharray="3 3" />
                    <PolarAngleAxis
                      dataKey="stat"
                      tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, MAX_STAT]}
                      tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
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
                      wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }}
                      formatter={(value: string) => (
                        <span style={{ color: 'var(--text-secondary)' }} className="capitalize">
                          {value}
                        </span>
                      )}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
          <StatsTable selected={selectedPokemon} />
        </div>
      </div>
    </div>
  )
}

// ─── Main Analysis Page ──────────────────────────────────────────────────────

export default function AnalysisPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="text-center mb-8 sm:mb-10">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Image
            src="/pokeball.png"
            alt="Pokeball"
            width={40}
            height={40}
            className="w-8 sm:w-10"
          />
          <h1 className="text-xl sm:text-2xl font-[family-name:var(--font-pixel)] text-[var(--text-primary)] tracking-wider">
            Pokemon Matchup
          </h1>
        </div>
        <p className="text-[var(--text-muted)] text-sm max-w-lg mx-auto">
          Compare base stats across Pokemon with radar charts
        </p>
      </div>

      <StatComparePanel />
    </div>
  )
}
