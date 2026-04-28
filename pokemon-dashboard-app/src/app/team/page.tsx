'use client'

import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { HowToGuide } from '@/components/ui/HowToGuide'
import { isSpriteMissing, getSpriteUrl } from '@/lib/sprites'
import styles from './team-builder.module.css'

interface Pokemon {
  id: number
  name: string
  type_names: string[]
  sprite_url: string | null
}

interface PokemonJSON {
  id: number
  name: string
  type_names: string
  sprite_url: string | null
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

function parsePokemon(raw: PokemonJSON[]): Pokemon[] {
  const seen = new Set<number>()
  return raw
    .map((p) => ({
      id: p.id,
      name: p.name.charAt(0).toUpperCase() + p.name.slice(1),
      type_names: [
        ...new Set(
          p.type_names
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        ),
      ].map((t) => t.charAt(0).toUpperCase() + t.slice(1)),
      sprite_url: p.sprite_url,
    }))
    .filter((p) => {
      if (seen.has(p.id)) return false
      seen.add(p.id)
      return true
    })
}

type TypeMap = { [typeName: string]: number }

const TYPE_EFFECTIVENESS: { [attacker: string]: { [defender: string]: number } } = {
  Fire: { Grass: 2, Ice: 2, Bug: 2, Steel: 2, Fire: 0.5, Water: 0.5, Rock: 0.5 },
  Water: { Fire: 2, Ground: 2, Rock: 2, Water: 0.5, Grass: 0.5, Dragon: 0.5 },
  Grass: { Water: 2, Ground: 2, Rock: 2, Fire: 0.5, Grass: 0.5, Poison: 0.5, Flying: 0.5 },
  Electric: { Water: 2, Flying: 2, Electric: 0.5, Grass: 0.5, Ground: 0 },
  Ice: { Grass: 2, Ground: 2, Flying: 2, Dragon: 2, Fire: 0.5, Water: 0.5 },
  Psychic: { Fighting: 2, Poison: 2, Psychic: 0.5, Dark: 0.5 },
  Dragon: { Dragon: 2, Fairy: 0.5 },
  Ground: {
    Fire: 2,
    Electric: 2,
    Poison: 2,
    Rock: 2,
    Ghost: 0.0,
    Grass: 0.5,
    Flying: 0.0,
    Steel: 2,
  },
  Rock: { Fire: 2, Ice: 2, Flying: 2, Bug: 2, Ground: 0.5, Fighting: 0.5, Steel: 0.5 },
  Fairy: { Dragon: 2, Fighting: 2, Poison: 0.5, Steel: 0.5 },
  Normal: { Rock: 0.5 },
  Ghost: { Psychic: 2, Ghost: 2, Normal: 0 },
  Flying: { Fighting: 2, Bug: 2, Grass: 2, Electric: 0.5, Rock: 0.5 },
  Poison: { Grass: 2, Fairy: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5 },
  Fighting: {
    Normal: 2,
    Ice: 2,
    Rock: 2,
    Dark: 2,
    Steel: 2,
    Poison: 0.5,
    Flying: 0.5,
    Psychic: 0.5,
    Bug: 0.5,
    Fairy: 0.5,
  },
  Dark: { Psychic: 2, Ghost: 2, Fighting: 0.5, Dark: 0.5, Fairy: 0.5 },
  Steel: { Ice: 2, Rock: 2, Fairy: 2, Fire: 0.5, Water: 0.5, Electric: 0.5, Steel: 0.5 },
  Bug: {
    Grass: 2,
    Psychic: 2,
    Dark: 2,
    Fire: 0.5,
    Fighting: 0.5,
    Poison: 0.5,
    Flying: 0.5,
    Ghost: 0.5,
    Steel: 0.5,
    Fairy: 0.5,
  },
}

const ALL_TYPES: string[] = [
  'Normal',
  'Fire',
  'Water',
  'Electric',
  'Grass',
  'Ice',
  'Fighting',
  'Poison',
  'Ground',
  'Flying',
  'Psychic',
  'Bug',
  'Rock',
  'Ghost',
  'Dragon',
  'Dark',
  'Steel',
  'Fairy',
]

function getEffectiveness(attackerType: string, defenderType: string): number {
  const map = TYPE_EFFECTIVENESS[attackerType]
  if (!map) return 1
  return map[defenderType] ?? 1
}

function multAgainst(p: Pokemon, targetType: string): number {
  let m = 1
  if (!p) return 1
  for (const t of p.type_names) {
    m *= getEffectiveness(t, targetType)
  }
  return m
}

const TYPE_COLORS: { [type: string]: string } = {
  Normal: '#A8A77A',
  Fire: '#EE8130',
  Water: '#6390F0',
  Electric: '#F7D02C',
  Grass: '#7AC74C',
  Ice: '#96D9D6',
  Fighting: '#C22E28',
  Poison: '#A33EA1',
  Ground: '#E2BF65',
  Flying: '#A98FF3',
  Psychic: '#F95587',
  Bug: '#A6B91A',
  Rock: '#B6A136',
  Ghost: '#705798',
  Dragon: '#6F35FC',
  Dark: '#705746',
  Steel: '#B7B7CE',
  Fairy: '#D985F2',
}

function TypeBadge({ type }: { type: string }) {
  const color = TYPE_COLORS[type] ?? '#999'
  return (
    <span className={styles.typeBadge} style={{ background: color, color: '#111' }}>
      {type}
    </span>
  )
}

export default function TeamBuilderPage(): React.ReactElement {
  const { data: rawPokemon, loading, error } = useJSONQuery<PokemonJSON>('pokemon.json')
  const ALL_POKEMON = useMemo(() => parsePokemon(rawPokemon), [rawPokemon])

  const [team, setTeam] = useState<(Pokemon | null)[]>(Array(6).fill(null))
  const [query, setQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [showBoard, setShowBoard] = useState(false)

  const filledCount = team.filter((p) => p !== null).length

  const isDuplicate = (p: Pokemon) => team.some((slot) => slot?.id === p.id)

  const addPokemonToFirstEmpty = (p: Pokemon) => {
    if (filledCount >= 6 || isDuplicate(p)) return
    setTeam((prev) => {
      const idx = prev.findIndex((slot) => slot === null)
      if (idx === -1) return prev
      const next = prev.slice()
      next[idx] = p
      return next
    })
  }

  const removePokemonFromSlot = (idx: number) => {
    setTeam((prev) => {
      const next = prev.slice()
      next[idx] = null
      return next
    })
  }

  const filteredPokemons = useMemo(() => {
    if (!query) return ALL_POKEMON
    const q = query.toLowerCase()
    return ALL_POKEMON.filter(
      (p) => p.name.toLowerCase().includes(q) || p.type_names.join(',').toLowerCase().includes(q)
    )
  }, [ALL_POKEMON, query])

  const availablePokemons: (Pokemon & { isDuplicate: boolean })[] = filteredPokemons
    .map((p) => ({ ...p, isDuplicate: isDuplicate(p) }))
    .filter((p) => !p.isDuplicate || !team.some((t) => t !== null))

  const teamTypes = useMemo(() => {
    const set = new Set<string>()
    team.forEach((p) => {
      if (p) p.type_names.forEach((t) => set.add(t))
    })
    return Array.from(set)
  }, [team])

  const coverage = useMemo(() => {
    const result: { type: string; superEffective: boolean }[] = ALL_TYPES.map((t) => {
      let superEff = false
      for (const p of team) {
        if (!p) continue
        for (const at of p.type_names) {
          if (getEffectiveness(at, t) >= 2) {
            superEff = true
            break
          }
        }
        if (superEff) break
      }
      return { type: t, superEffective: superEff }
    })
    const def: { type: string; averageDef: number }[] = ALL_TYPES.map((t) => {
      const vals = team
        .filter((p) => p)
        .map((p) => {
          let m = 1
          for (const tt of p!.type_names) m *= getEffectiveness(tt, t)
          return m
        })
      const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 1
      return { type: t, averageDef: avg }
    })
    const gaps = ALL_TYPES.filter((t) => {
      const mins = team
        .filter((p) => p)
        .map((p) => {
          let m = 1
          for (const tt of p!.type_names) m *= getEffectiveness(tt, t)
          return m
        })
      if (mins.length === 0) return true
      const minVal = Math.min(...mins)
      return minVal >= 1
    })
    return { byType: result, def: def, gaps: gaps }
  }, [team])

  const copyTeamText = async () => {
    const lines = team.map((p, i) => {
      if (!p) return `${i + 1}. [Empty slot]`
      const types = p.type_names.join('/')
      return `${i + 1}. ${p.name} (${types})`
    })
    const text = lines.join('\n')
    try {
      await navigator.clipboard.writeText(text)
      alert('Team copied to clipboard')
    } catch {}
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Team Builder</h1>
        <div className="py-16 text-center">
          <p className="text-[var(--text-muted)]">Loading Pokemon data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Team Builder</h1>
        <div className="py-16 text-center">
          <p className="text-red-400">Failed to load Pokemon data</p>
          <p className="text-[var(--text-muted)] text-sm">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Team Builder</h1>
      <HowToGuide title="Team Builder Guide">
        Search and add up to 6 Pokemon to your team. The coverage grid below shows how well your
        team handles each type. Aim for green (super effective) coverage and minimize red (weak)
        gaps.
      </HowToGuide>
      <div className={styles.gridToolbar}>
        <div className={styles.searchBox}>
          <input
            placeholder="Search Pokemon by name or type..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setShowDropdown(true)
            }}
            onFocus={() => setShowDropdown(true)}
            className={styles.searchInput}
          />
          {showDropdown && query && (
            <div className={styles.dropdown}>
              {availablePokemons.length > 0 ? (
                availablePokemons.slice(0, 8).map((p) => (
                  <div
                    key={p.id}
                    className={`${styles.dropdownItem} ${p.isDuplicate ? 'opacity-40 grayscale' : ''}`}
                    onClick={() => {
                      if (!p.isDuplicate) {
                        addPokemonToFirstEmpty(p)
                        setQuery('')
                        setShowDropdown(false)
                      }
                    }}
                    style={p.isDuplicate ? { cursor: 'not-allowed' } : undefined}
                  >
                    {p.isDuplicate && <span className="text-[10px] text-red-400">Duplicate</span>}
                    <span className={styles.dropdownThumb}>
                      <img
                        src={getSpriteUrl(p.id)}
                        alt={p.name}
                        style={{
                          filter: isSpriteMissing(p.id) ? 'brightness(0) opacity(0.5)' : 'none',
                        }}
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = ''
                        }}
                      />
                    </span>
                    <span className={styles.dropdownText}>{p.name}</span>
                    <span className={styles.dropdownTypes}>
                      {p.type_names.map((t) => (
                        <span
                          key={t}
                          className={styles.smallType}
                          style={{ background: TYPE_COLORS[t] ?? '#999' }}
                        >
                          {t}
                        </span>
                      ))}
                    </span>
                  </div>
                ))
              ) : (
                <div className={styles.dropdownItem}>No results</div>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button className={styles.copyBtn} onClick={() => setShowBoard((s) => !s)}>
            {showBoard ? 'Hide Board' : 'Show Board'}
          </button>
          <button className={styles.copyBtn} onClick={copyTeamText}>
            Copy Team Text
          </button>
        </div>
      </div>

      {showBoard && (
        <div className={styles.boardContainer}>
          <div className={styles.boardGrid}>
            {availablePokemons.map((p) => (
              <button
                key={p.id}
                className={`${styles.boardCard} ${p.isDuplicate ? styles.boardCardDisabled : ''}`}
                onClick={() => {
                  if (!p.isDuplicate) {
                    addPokemonToFirstEmpty(p)
                  }
                }}
                disabled={p.isDuplicate}
              >
                <img
                  src={getSpriteUrl(p.id)}
                  alt={p.name}
                  className={styles.boardSprite}
                  style={{ filter: isSpriteMissing(p.id) ? 'brightness(0) opacity(0.5)' : 'none' }}
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = ''
                  }}
                />
                <span className={styles.boardName}>{p.name}</span>
                <span className={styles.boardTypes}>
                  {p.type_names.map((t) => (
                    <span
                      key={t}
                      className={styles.smallType}
                      style={{ background: TYPE_COLORS[t] ?? '#999' }}
                    >
                      {t}
                    </span>
                  ))}
                </span>
                {p.isDuplicate && <span className={styles.boardDuplicate}>In Team</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      <h2 className={styles.sectionTitle}>Your Pocket</h2>
      <div className={styles.teamGrid}>
        {team.map((p, idx) => (
          <div key={idx} className={styles.slot} aria-label={`Slot ${idx + 1}`}>
            {p ? (
              <div className={styles.slotContent}>
                <div className={styles.slotTop}>
                  <img
                    className={styles.sprite}
                    src={getSpriteUrl(p.id)}
                    alt={p.name}
                    style={{
                      filter: isSpriteMissing(p.id) ? 'brightness(0) opacity(0.5)' : 'none',
                    }}
                  />
                  <div className={styles.slotInfo}>
                    <div className={styles.slotName}>{p.name}</div>
                    <div className={styles.slotTypes}>
                      {p.type_names.map((t) => (
                        <TypeBadge key={`${p.id}-${t}`} type={t} />
                      ))}
                    </div>
                  </div>
                </div>
                <button className={styles.removeBtn} onClick={() => removePokemonFromSlot(idx)}>
                  ×
                </button>
              </div>
            ) : (
              <div className={styles.slotEmpty}>
                <span className={styles.plus}>+</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <section className={styles.results}>
        <h2 className={styles.sectionTitle}>Coverage Analysis</h2>
        <div className={styles.coverageGrid}>
          {ALL_TYPES.map((t) => {
            const defFor = coverage.def.find((d) => d.type === t)
            const avg = defFor?.averageDef ?? 1
            const color = avg < 1 ? '#34d399' : avg > 1.25 ? '#f87171' : '#f3f4f6'
            const bySuper = coverage.byType.find((b) => b.type === t)?.superEffective ?? false
            const gap = coverage.gaps.includes(t)
            return (
              <div key={t} className={styles.coverageCard}>
                <div className={styles.coverageHeader}>
                  <span className={styles.typeName}>{t}</span>
                  <span className={styles.badge} style={{ background: color }}>
                    {' '}
                  </span>
                </div>
                <div className={styles.coverageBody}>
                  <div className={styles.coverageLine}>
                    <span>Super effective: {bySuper ? 'Yes' : 'No'}</span>
                  </div>
                  <div className={styles.coverageLineSmall}>
                    <span>Defensive multiplier: {avg.toFixed(2)}x</span>
                  </div>
                  {gap && <div className={styles.gapLabel}>Coverage gap: weak to {t}</div>}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
