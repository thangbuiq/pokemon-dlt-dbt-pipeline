'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useDuckDBQuery } from '@/lib/duckdb/hooks'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { getSpriteUrl } from '@/lib/sprites'

type EvoNode = {
  name: string
  stage: number
  evolves_from: string | null
  chain_id: number
}

type EvoEdge = {
  from_species: string
  to_species: string
  trigger: string
  min_level: number | null
  item: string | null
}

type SpeciesRow = { species_name: string }
type ChainIdRow = { chain_id: number }

const STAGE_WIDTH = 260
const NODE_WIDTH = 200
const NODE_HEIGHT = 110
const TOP_PADDING = 40

export default function EvolutionVisualizer() {
  const [selected, setSelected] = useState<string | null>(null)
  const [positions, setPositions] = useState<
    Record<string, { x: number; y: number; stage: number }>
  >({})
  const [spriteCache, setSpriteCache] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)

  const { data: speciesRows, loading: loadingSpecies } = useDuckDBQuery<SpeciesRow>(
    'SELECT DISTINCT species_name FROM dim_evolution_tree ORDER BY species_name'
  )

  const speciesList = useMemo(() => speciesRows?.map((r) => r.species_name) ?? [], [speciesRows])

  useEffect(() => {
    if (speciesList.length > 0 && !selected) {
      setSelected(speciesList[0])
    }
  }, [speciesList, selected])

  const { data: chainIdRows } = useDuckDBQuery<ChainIdRow>(
    selected
      ? `SELECT chain_id FROM dim_evolution_tree WHERE species_name = '${selected}' LIMIT 1`
      : 'SELECT CAST(0 AS BIGINT) as chain_id WHERE 1=0',
    [selected]
  )

  const chainId = chainIdRows?.[0]?.chain_id ?? null

  const { data: nodes } = useDuckDBQuery<EvoNode>(
    chainId
      ? `SELECT species_name as name, stage, evolves_from, chain_id FROM dim_evolution_tree WHERE chain_id = ${chainId} ORDER BY stage`
      : 'SELECT species_name as name, stage, evolves_from, chain_id FROM dim_evolution_tree WHERE 1=0',
    [chainId]
  )

  const { data: edges } = useDuckDBQuery<EvoEdge>(
    chainId
      ? `SELECT from_species, to_species, trigger, min_level, item FROM fct_evolution_paths WHERE chain_id = ${chainId}`
      : 'SELECT from_species, to_species, trigger, min_level, item FROM fct_evolution_paths WHERE 1=0',
    [chainId]
  )

  useEffect(() => {
    if (!nodes || nodes.length === 0) return
    const stageGroups: Record<number, EvoNode[]> = {}
    nodes.forEach((n) => {
      stageGroups[n.stage] = stageGroups[n.stage] ?? []
      stageGroups[n.stage].push(n)
    })
    const maxStage = Math.max(...nodes.map((n) => n.stage), 1)
    const newPositions: Record<string, { x: number; y: number; stage: number }> = {}
    for (let s = 1; s <= maxStage; s++) {
      const group = stageGroups[s] ?? []
      group.forEach((n, idx) => {
        const x = (s - 1) * STAGE_WIDTH + (STAGE_WIDTH - NODE_WIDTH) / 2
        const y = TOP_PADDING + idx * NODE_HEIGHT
        newPositions[n.name] = { x, y, stage: s }
      })
    }
    setPositions(newPositions)
  }, [nodes])

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
      const from = nodes.find((n) => n.name === e.from_species)
      const to = nodes.find((n) => n.name === e.to_species)
      if (!from || !to) continue
      const pFrom = positions[from.name]
      const pTo = positions[to.name]
      if (!pFrom || !pTo) continue
      lines.push({
        x1: pFrom.x + NODE_WIDTH / 2,
        y1: pFrom.y + NODE_HEIGHT / 2,
        x2: pTo.x + NODE_WIDTH / 2,
        y2: pTo.y + NODE_HEIGHT / 2,
        label: e.trigger,
      })
    }
    return lines
  }, [edges, nodes, positions])

  if (error) {
    return <div className="text-red-400 p-8">{error}</div>
  }

  if (loadingSpecies) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size={64} />
      </div>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-[family-name:var(--font-pixel)] tracking-wider mb-6">
        Evolution Visualizer
      </h1>
      <div className="mb-6 flex items-center gap-4">
        <label htmlFor="pokemon-select" className="text-sm text-white/60">
          Select Pokemon chain:
        </label>
        <select
          id="pokemon-select"
          value={selected ?? ''}
          onChange={(e) => setSelected(e.target.value)}
          className="glass border border-white/20 text-white px-3 py-2 rounded-lg text-sm"
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
            border: '1px solid rgba(255,255,255,0.1)',
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
                color: 'rgba(255,255,255,0.5)',
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
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth={2}
                />
                {ln.label && ln.label !== 'none' && (
                  <text
                    x={(ln.x1 + ln.x2) / 2}
                    y={(ln.y1 + ln.y2) / 2 - 6}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.6)"
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
                  className="glass hover:bg-white/5 transition-colors"
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
                        background: 'rgba(255,255,255,0.1)',
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
