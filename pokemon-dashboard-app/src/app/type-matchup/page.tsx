'use client'

import { useMemo } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { HowToGuide } from '@/components/ui/HowToGuide'
import { type PokemonType, typeColorMap } from '@/lib/design-tokens'

const TYPES: PokemonType[] = [
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

const TYPE_EFFECTIVENESS: Partial<Record<PokemonType, Partial<Record<PokemonType, number>>>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: {
    fire: 0.5,
    water: 0.5,
    grass: 2,
    ice: 2,
    bug: 2,
    rock: 0.5,
    dragon: 0.5,
    steel: 2,
  },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: {
    fire: 0.5,
    water: 2,
    grass: 0.5,
    poison: 0.5,
    ground: 2,
    flying: 0.5,
    bug: 0.5,
    rock: 2,
    dragon: 0.5,
    steel: 0.5,
  },
  ice: {
    fire: 0.5,
    water: 0.5,
    grass: 2,
    ground: 2,
    flying: 2,
    dragon: 2,
    steel: 0.5,
  },
  fighting: {
    normal: 2,
    ice: 2,
    poison: 0.5,
    flying: 0.5,
    psychic: 0.5,
    bug: 0.5,
    rock: 2,
    ghost: 0,
    dark: 2,
    steel: 2,
    fairy: 0.5,
  },
  poison: {
    grass: 2,
    poison: 0.5,
    ground: 0.5,
    rock: 0.5,
    ghost: 0.5,
    steel: 0,
    fairy: 2,
  },
  ground: {
    fire: 2,
    electric: 2,
    grass: 0.5,
    poison: 2,
    flying: 0,
    bug: 0.5,
    rock: 2,
    steel: 2,
  },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: {
    fire: 0.5,
    grass: 2,
    fighting: 0.5,
    poison: 0.5,
    flying: 0.5,
    psychic: 2,
    ghost: 0.5,
    dark: 2,
    steel: 0.5,
    fairy: 0.5,
  },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: {
    fire: 0.5,
    water: 0.5,
    electric: 0.5,
    ice: 2,
    rock: 2,
    steel: 0.5,
    fairy: 2,
  },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
}

function getEffectiveness(attackerType: PokemonType, defenderType: PokemonType): number {
  return TYPE_EFFECTIVENESS[attackerType]?.[defenderType] ?? 1
}

function multiplierLabel(multiplier: number): string {
  if (multiplier === 0) return '0'
  if (multiplier === 0.5) return '1/2'
  if (multiplier === 1) return '1'
  if (multiplier === 2) return '2'
  return `${multiplier}`
}

function cellStyles(multiplier: number): { backgroundColor: string; color: string } {
  if (multiplier === 0) return { backgroundColor: '#201122', color: '#FFFFFF' }
  if (multiplier === 0.5) return { backgroundColor: '#8B1A1A', color: '#FFFFFF' }
  if (multiplier === 1) return { backgroundColor: 'var(--surface)', color: '#FFFFFF' }
  return { backgroundColor: '#166534', color: '#FFFFFF' }
}

export default function TypeMatchupPage() {
  const guideItems = [
    { multiplier: 2, description: 'Super effective. Strong damage.' },
    { multiplier: 1, description: 'Normal damage. No modifier.' },
    { multiplier: 0.5, description: 'Not very effective. Reduced damage.' },
    { multiplier: 0, description: 'Immune. No damage lands.' },
  ] as const

  const matrix = useMemo(
    () =>
      TYPES.map((attacker) =>
        TYPES.map((defender) => ({
          attacker,
          defender,
          multiplier: getEffectiveness(attacker, defender),
        }))
      ),
    []
  )

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-xl sm:text-2xl font-[family-name:var(--font-pixel)] tracking-wider text-[var(--text-primary)]">
          Type Matchup Matrix
        </h1>
        <p className="text-sm text-[var(--text-muted)] max-w-2xl mx-auto">
          Read across the row to see how one attacking type performs against each defending type.
          Use the notes below to interpret the colors and multipliers.
        </p>
      </div>

      <HowToGuide title="Type Matchup Guide">
        Green cells mean super effective (2x). Red cells mean not very effective (0.5x) or no effect
        (0x). White cells are neutral (1x). Use this to plan your team coverage.
      </HowToGuide>

      <Card className="space-y-4">
        <h2 className="text-sm font-[family-name:var(--font-pixel)] tracking-wider text-[var(--text-secondary)]">
          Notes
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          {guideItems.map((item) => {
            const styles = cellStyles(item.multiplier)
            return (
              <div
                key={item.multiplier}
                className="rounded-lg border border-[var(--card-border)] p-3 font-[family-name:var(--font-pixel)] tracking-wider"
                style={{ backgroundColor: styles.backgroundColor, color: styles.color }}
              >
                <div className="font-semibold mb-1">{multiplierLabel(item.multiplier)}</div>
                <div>{item.description}</div>
              </div>
            )
          })}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-auto">
          <table className="min-w-max w-full border-collapse text-xs font-[family-name:var(--font-pixel)] tracking-wider">
            <thead>
              <tr>
                <th className="sticky left-0 z-20 bg-[var(--surface)] border border-[var(--card-border)] px-2 py-2 text-[var(--text-secondary)] font-[family-name:var(--font-pixel)] tracking-wider">
                  ATK\DEF
                </th>
                {TYPES.map((type) => (
                  <th
                    key={type}
                    className="sticky top-0 z-10 bg-[var(--surface)] border border-[var(--card-border)] px-2 py-2"
                  >
                    <Badge type={type} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, rowIndex) => (
                <tr key={TYPES[rowIndex]}>
                  <th className="sticky left-0 z-10 bg-[var(--surface)] border border-[var(--card-border)] px-2 py-2 text-left">
                    <Badge type={TYPES[rowIndex]} />
                  </th>
                  {row.map((cell) => {
                    const styles = cellStyles(cell.multiplier)
                    return (
                      <td
                        key={`${cell.attacker}-${cell.defender}`}
                        className="border border-[var(--card-border)] px-2 py-2 text-center font-semibold text-white"
                        style={styles}
                        title={`${cell.attacker} vs ${cell.defender}: ${multiplierLabel(cell.multiplier)}`}
                      >
                        {multiplierLabel(cell.multiplier)}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
