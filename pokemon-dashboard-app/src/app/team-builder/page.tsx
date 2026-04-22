'use client'

import React, { useMemo, useState } from 'react'
import styles from './team-builder.module.css'

type Pokemon = {
  id: number
  name: string
  type_names: string[]
}

// Lightweight, self-contained dataset for demonstration.
const ALL_POKEMON: Pokemon[] = [
  { id: 1, name: 'Bulbasaur', type_names: ['Grass', 'Poison'] },
  { id: 4, name: 'Charmander', type_names: ['Fire'] },
  { id: 7, name: 'Squirtle', type_names: ['Water'] },
  { id: 25, name: 'Pikachu', type_names: ['Electric'] },
  { id: 39, name: 'Jigglypuff', type_names: ['Normal', 'Fairy'] },
  { id: 150, name: 'Mewtwo', type_names: ['Psychic'] },
  { id: 142, name: 'Aerodactyl', type_names: ['Rock', 'Flying'] },
  { id: 6, name: 'Charizard', type_names: ['Fire', 'Flying'] },
  { id: 94, name: 'Gengar', type_names: ['Ghost', 'Poison'] },
  { id: 131, name: 'Lapras', type_names: ['Water', 'Ice'] },
  { id: 143, name: 'Snorlax', type_names: ['Normal'] },
  { id: 112, name: 'Rhydon', type_names: ['Ground', 'Rock'] },
]

type TypeMap = { [typeName: string]: number }

// Simplified type effectiveness chart (subset). Defaults to 1 for unspecified pairs.
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
  // Dual-type defense: multiply both type multipliers
  let m = 1
  if (!p) return 1
  for (const t of p.type_names) {
    m *= getEffectiveness(t, targetType)
  }
  return m
}

function getSpriteURL(id: number): string {
  // Use the standard poke sprites URL (fallback to emoji if image fails)
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
}

// Small, accessible color mapping for types
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
  // 6-slot team with session-only state
  const [team, setTeam] = useState<(Pokemon | null)[]>(Array(6).fill(null))
  const [query, setQuery] = useState('')
  const [selectedFromList, setSelectedFromList] = useState<number | null>(null)

  const filledCount = team.filter((p) => p !== null).length

  const addPokemonToFirstEmpty = (p: Pokemon) => {
    if (filledCount >= 6) return
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

  const availablePokemons = ALL_POKEMON.filter((p) => {
    if (!query) return true
    const q = query.toLowerCase()
    return p.name.toLowerCase().includes(q) || p.type_names.join(',').toLowerCase().includes(q)
  })

  // Coverage calculations
  // Team types (collect across all non-null slots)
  const teamTypes = useMemo(() => {
    const set = new Set<string>()
    team.forEach((p) => {
      if (p) p.type_names.forEach((t) => set.add(t))
    })
    return Array.from(set)
  }, [team])

  const coverage = useMemo(() => {
    // Type coverage: for each target type, does any team member hit super effectively?
    const result: { type: string; superEffective: boolean }[] = ALL_TYPES.map((t) => {
      let superEff = false
      for (const p of team) {
        if (!p) continue
        // If any attacker type among p.type_names yields 2x against t
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
    // Defensive coverage: average multiplier across team for each target type
    const def: { type: string; averageDef: number }[] = ALL_TYPES.map((t) => {
      const vals = team
        .filter((p) => p)
        .map((p) => {
          // product of effectiveness for p against t
          let m = 1
          for (const tt of p!.type_names) m *= getEffectiveness(tt, t)
          return m
        })
      const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 1
      return { type: t, averageDef: avg }
    })
    // Coverage gaps: types where minimum multiplier across team >= 1 (no one resists)
    const gaps = ALL_TYPES.filter((t) => {
      const mins = team
        .filter((p) => p)
        .map((p) => {
          let m = 1
          for (const tt of p!.type_names) m *= getEffectiveness(tt, t)
          return m
        })
      if (mins.length === 0) return true // no team yet -> treat as gap
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
    } catch {
      // ignore
    }
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Team Builder</h1>
      <div className={styles.gridToolbar}>
        <div className={styles.searchBox}>
          <input
            placeholder="Search Pokemon by name or type..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.searchInput}
          />
          <div className={styles.dropdown}>
            {availablePokemons.length > 0 ? (
              availablePokemons.map((p) => (
                <div
                  key={p.id}
                  className={styles.dropdownItem}
                  onClick={() => addPokemonToFirstEmpty(p)}
                >
                  <span className={styles.dropdownThumb}>
                    <img
                      src={getSpriteURL(p.id)}
                      alt={p.name}
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
        </div>
        <button className={styles.copyBtn} onClick={copyTeamText}>
          Copy Team Text
        </button>
      </div>

      <div className={styles.teamGrid}>
        {team.map((p, idx) => (
          <div key={idx} className={styles.slot} aria-label={`Slot ${idx + 1}`}>
            {p ? (
              <div className={styles.slotContent}>
                <img className={styles.sprite} src={getSpriteURL(p.id)} alt={p.name} />
                <div className={styles.slotMeta}>
                  <div className={styles.slotName}>{p.name}</div>
                  <div className={styles.slotTypes}>
                    {p.type_names.map((t) => (
                      <TypeBadge key={t} type={t} />
                    ))}
                  </div>
                </div>
                <button className={styles.removeBtn} onClick={() => removePokemonFromSlot(idx)}>
                  Remove
                </button>
              </div>
            ) : (
              <div
                className={styles.slotEmpty}
                onClick={() => {
                  /* click-to-focus search; no-op for now */
                }}
              >
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
            // find the computed row for this type
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
