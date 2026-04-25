'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { getSpriteUrl } from '@/lib/sprites'

type EvoNode = {
  name: string
  stage: number
  evolves_from: string | null
  chain_id: number
}

type EvoEdge = {
  from_pokemon: string
  to_pokemon: string
  evolution_trigger: string | null
  chain_id: number
}

type SpeciesRow = { species_name: string }
type ChainIdRow = { chain_id: number }

const STAGE_WIDTH = 260
const NODE_WIDTH = 200
const NODE_HEIGHT = 110
const TOP_PADDING = 40

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

export default function EvolutionVisualizer() {
  const [selected, setSelected] = useState<string | null>(null)
  const [positions, setPositions] = useState<
    Record<string, { x: number; y: number; stage: number }>
  >({})
  const [spriteCache, setSpriteCache] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)

  const { data: allNodes, loading: loadingNodes } = useJSONQuery<EvoNode>('evolution_tree.json')
  const { data: allEdges, loading: loadingEdges } = useJSONQuery<EvoEdge>('evolution_paths.json')

  const speciesList = useMemo(() => {
    if (!allNodes) return []
    const unique = [...new Set(allNodes.map((n) => n.name))]
    return unique.sort()
  }, [allNodes])

  useEffect(() => {
    if (speciesList.length > 0 && !selected) {
      setSelected(speciesList[0])
    }
  }, [speciesList, selected])

  const chainId = useMemo(() => {
    if (!selected || !allNodes) return null
    const node = allNodes.find((n) => n.name === selected)
    return node?.chain_id ?? null
  }, [selected, allNodes])

  const nodes = useMemo(() => {
    if (!chainId || !allNodes) return []
    return allNodes.filter((n) => n.chain_id === chainId)
  }, [chainId, allNodes])

  const edges = useMemo(() => {
    if (!chainId || !allEdges) return []
    return allEdges.filter((e) => e.chain_id === chainId)
  }, [chainId, allEdges])

  useEffect(() => {
    if (!nodes || nodes.length === 0) return
    const toFetch = nodes.map((n) => n.name).filter((n) => !spriteCache[n])
    if (toFetch.length === 0) return
    let mounted = true
    const fetchSprites = async () => {
      const newCache = { ...spriteCache }
      for (const name of toFetch) {
        try {
          const url = `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(name.toLowerCase())}`
          const res = await fetch(url)
          if (res.ok) {
            const data = await res.json()
            const img =
              data?.sprites?.front_default ?? data?.sprites?.other?.dream_world?.front_default
            if (img) newCache[name] = img
          }
        } catch {
          // skip failed sprites
        }
      }
      if (mounted) setSpriteCache(newCache)
    }
    fetchSprites()
    return () => {
      mounted = false
    }
  }, [nodes, spriteCache])

  const maxStage = useMemo(() => {
    if (!nodes || nodes.length === 0) return 0
    return Math.max(...nodes.map((n) => n.stage))
  }, [nodes])

  const stageGroups = useMemo(() => {
    if (!nodes) return {}
    const groups: Record<number, EvoNode[]> = {}
    nodes.forEach((n) => {
      groups[n.stage] = groups[n.stage] ?? []
      groups[n.stage].push(n)
    })
    Object.values(groups).forEach((arr) => arr.sort((a, b) => a.name.localeCompare(b.name)))
    return groups
  }, [nodes])

  const containerWidth = Math.max(0, maxStage) * STAGE_WIDTH
  const maxRows = Math.max(0, ...Object.values(stageGroups).map((g) => g.length))
  const containerHeight = TOP_PADDING * 2 + maxRows * NODE_HEIGHT

  const edgeLines = useMemo(() => {
    if (!edges || !nodes) return []
    const lines: Array<{ x1: number; y1: number; x2: number; y2: number; label?: string }> = []
    for (const e of edges) {
      const from = nodes.find((n) => n.name === e.from_pokemon)
      const to = nodes.find((n) => n.name === e.to_pokemon)
      if (!from || !to) continue
      const pFrom = positions[from.name]
      const pTo = positions[to.name]
      if (!pFrom || !pTo) continue
      lines.push({
        x1: pFrom.x + NODE_WIDTH / 2,
        y1: pFrom.y + NODE_HEIGHT / 2,
        x2: pTo.x + NODE_WIDTH / 2,
        y2: pTo.y + NODE_HEIGHT / 2,
        label: e.evolution_trigger || undefined,
      })
    }
    return lines
  }, [edges, nodes, positions])

  if (error) {
    return <div className="text-red-400 p-8">{error}</div>
  }

  if (loadingNodes || loadingEdges) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size={64} />
      </div>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-xl sm:text-2xl font-[family-name:var(--font-pixel)] tracking-wider mb-6">
        Evolution Visualizer
      </h1>
      <div className="mb-6 flex items-center gap-4">
        <label htmlFor="pokemon-select" className="text-sm text-[var(--text-secondary)]">
          Select Pokemon chain:
        </label>
        <select
          id="pokemon-select"
          value={selected ?? ''}
          onChange={(e) => setSelected(e.target.value)}
          className="glass border border-[var(--card-border)] text-[var(--text-primary)] px-3 py-2 rounded-lg text-sm"
        >
          {speciesList.map((s) => (
            <option key={s} value={s} className="bg-slate-900">
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="relative overflow-x-auto" style={{ minHeight: 320 }}>
        <div
          style={{
            height: containerHeight || 400,
            minWidth: containerWidth || 400,
            border: '1px solid var(--card-border)',
            borderRadius: 12,
            padding: 16,
            position: 'relative',
          }}
        >
          {[...Array(maxStage)].map((_, idx) => (
            <div
              key={idx}
              style={{
                position: 'absolute',
                left: idx * STAGE_WIDTH + (STAGE_WIDTH - NODE_WIDTH) / 2,
                top: 0,
                width: NODE_WIDTH,
                textAlign: 'center',
                fontSize: 11,
                color: 'var(--text-secondary)',
                fontWeight: 600,
                letterSpacing: 1,
              }}
            >
              STAGE {idx + 1}
            </div>
          ))}
          <svg
            width={containerWidth}
            height={containerHeight}
            style={{ position: 'absolute', left: 0, top: 0 }}
          >
            {edgeLines.map((ln, i) => (
              <g key={i}>
                <polyline
                  points={`${ln.x1},${ln.y1} ${ln.x2},${ln.y2}`}
                  fill="none"
                  stroke="var(--card-border)"
                  strokeWidth={2}
                />
                {ln.label && ln.label !== 'none' && (
                  <text
                    x={(ln.x1 + ln.x2) / 2}
                    y={(ln.y1 + ln.y2) / 2 - 6}
                    textAnchor="middle"
                    fill="var(--text-secondary)"
                    fontSize={9}
                  >
                    {ln.label}
                  </text>
                )}
              </g>
            ))}
          </svg>
          {(nodes ?? []).map((n) => {
            const pos = positions[n.name]
            const sprite = spriteCache[n.name]
            if (!pos) return null
            return (
              <Link
                key={`${n.chain_id}-${n.name}`}
                href={`/pokedex/${encodeURIComponent(n.name)}`}
                style={{
                  position: 'absolute',
                  left: pos.x,
                  top: pos.y,
                  width: NODE_WIDTH,
                  textDecoration: 'none',
                }}
              >
                <div
                  className="glass hover:bg-[var(--surface)] transition-colors"
                  style={{
                    borderRadius: 12,
                    padding: 10,
                    height: NODE_HEIGHT - 20,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {sprite ? (
                    <img
                      src={sprite}
                      alt={n.name}
                      style={{ width: 64, height: 64, objectFit: 'contain' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 8,
                        background: 'var(--card-border)',
                      }}
                    />
                  )}
                  <div
                    style={{
                      marginTop: 4,
                      fontWeight: 600,
                      fontSize: 13,
                      textAlign: 'center',
                      color: 'white',
                    }}
                  >
                    {n.name}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}
