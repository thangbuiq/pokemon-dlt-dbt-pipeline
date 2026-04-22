'use client';

import { useState, useMemo } from 'react';
import { type PokemonType, typeColorMap } from '@/lib/design-tokens';

// ─── Type Effectiveness Data ────────────────────────────────────────────────
// Standard Pokémon type chart: attacking type (row) vs defending type (column)
// 2 = super effective, 0.5 = not very effective, 0 = no effect, 1 = normal

const ALL_TYPES: PokemonType[] = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
];

// Effectiveness matrix: effectiveness[attacking][defending] = multiplier
const effectiveness: Record<PokemonType, Record<PokemonType, number>> = {
  normal:    { normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 0.5, ghost: 0, dragon: 1, dark: 1, steel: 0.5, fairy: 1 },
  fire:      { normal: 1, fire: 0.5, water: 0.5, electric: 1, grass: 2, ice: 2, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 2, rock: 0.5, ghost: 1, dragon: 0.5, dark: 1, steel: 2, fairy: 1 },
  water:     { normal: 1, fire: 2, water: 0.5, electric: 1, grass: 0.5, ice: 1, fighting: 1, poison: 1, ground: 2, flying: 1, psychic: 1, bug: 1, rock: 2, ghost: 1, dragon: 0.5, dark: 1, steel: 1, fairy: 1 },
  electric:  { normal: 1, fire: 1, water: 2, electric: 0.5, grass: 0.5, ice: 1, fighting: 1, poison: 1, ground: 0, flying: 2, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 0.5, dark: 1, steel: 1, fairy: 1 },
  grass:     { normal: 1, fire: 0.5, water: 2, electric: 1, grass: 0.5, ice: 1, fighting: 1, poison: 0.5, ground: 2, flying: 0.5, psychic: 1, bug: 0.5, rock: 2, ghost: 1, dragon: 0.5, dark: 1, steel: 0.5, fairy: 1 },
  ice:       { normal: 1, fire: 0.5, water: 0.5, electric: 1, grass: 2, ice: 0.5, fighting: 1, poison: 1, ground: 2, flying: 2, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 2, dark: 1, steel: 0.5, fairy: 1 },
  fighting:  { normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 2, fighting: 1, poison: 0.5, ground: 1, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dragon: 1, dark: 2, steel: 2, fairy: 0.5 },
  poison:    { normal: 1, fire: 1, water: 1, electric: 1, grass: 2, ice: 1, fighting: 1, poison: 0.5, ground: 0.5, flying: 1, psychic: 1, bug: 1, rock: 0.5, ghost: 0.5, dragon: 1, dark: 1, steel: 0, fairy: 2 },
  ground:    { normal: 1, fire: 2, water: 1, electric: 2, grass: 0.5, ice: 1, fighting: 1, poison: 2, ground: 1, flying: 0, psychic: 1, bug: 0.5, rock: 2, ghost: 1, dragon: 1, dark: 1, steel: 2, fairy: 1 },
  flying:    { normal: 1, fire: 1, water: 1, electric: 0.5, grass: 2, ice: 1, fighting: 2, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 2, rock: 0.5, ghost: 1, dragon: 1, dark: 1, steel: 0.5, fairy: 1 },
  psychic:   { normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 2, poison: 2, ground: 1, flying: 1, psychic: 0.5, bug: 1, rock: 1, ghost: 1, dragon: 1, dark: 0, steel: 0.5, fairy: 1 },
  bug:       { normal: 1, fire: 0.5, water: 1, electric: 1, grass: 2, ice: 1, fighting: 0.5, poison: 0.5, ground: 1, flying: 0.5, psychic: 2, bug: 1, rock: 1, ghost: 0.5, dragon: 1, dark: 2, steel: 0.5, fairy: 0.5 },
  rock:      { normal: 1, fire: 2, water: 1, electric: 1, grass: 1, ice: 2, fighting: 0.5, poison: 1, ground: 0.5, flying: 2, psychic: 1, bug: 2, rock: 1, ghost: 1, dragon: 1, dark: 1, steel: 0.5, fairy: 1 },
  ghost:     { normal: 0, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 2, bug: 1, rock: 1, ghost: 2, dragon: 1, dark: 0.5, steel: 1, fairy: 1 },
  dragon:    { normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 2, dark: 1, steel: 0.5, fairy: 0 },
  dark:      { normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 0.5, poison: 1, ground: 1, flying: 1, psychic: 2, bug: 1, rock: 1, ghost: 2, dragon: 1, dark: 0.5, steel: 0.5, fairy: 0.5 },
  steel:     { normal: 1, fire: 0.5, water: 0.5, electric: 0.5, grass: 1, ice: 2, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 2, ghost: 1, dragon: 1, dark: 1, steel: 0.5, fairy: 2 },
  fairy:     { normal: 1, fire: 0.5, water: 1, electric: 1, grass: 1, ice: 1, fighting: 2, poison: 0.5, ground: 1, flying: 1, psychic: 1, bug: 0.5, rock: 1, ghost: 1, dragon: 2, dark: 2, steel: 0.5, fairy: 1 },
};

// ─── Effectiveness Label Helpers ────────────────────────────────────────────

type EffectivenessLevel = 'immune' | 'double_resisted' | 'resisted' | 'normal' | 'super_effective' | 'double_super';

function getEffectivenessLevel(multiplier: number): EffectivenessLevel {
  if (multiplier === 0) return 'immune';
  if (multiplier === 0.25) return 'double_resisted';
  if (multiplier === 0.5) return 'resisted';
  if (multiplier === 1) return 'normal';
  if (multiplier === 2) return 'super_effective';
  return 'double_super';
}

const effectivenessConfig: Record<EffectivenessLevel, { label: string; color: string; bg: string; border: string; glow: string }> = {
  immune:           { label: '0×',   color: '#6b7280', bg: 'rgba(107,114,128,0.15)', border: 'rgba(107,114,128,0.4)', glow: 'rgba(107,114,128,0.3)' },
  double_resisted:  { label: '¼×',   color: '#3b82f6', bg: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.4)',  glow: 'rgba(59,130,246,0.3)' },
  resisted:         { label: '½×',   color: '#93c5fd', bg: 'rgba(147,197,253,0.12)', border: 'rgba(147,197,253,0.35)', glow: 'rgba(147,197,253,0.25)' },
  normal:           { label: '1×',   color: '#ffffff', bg: 'rgba(255,255,255,0.06)',  border: 'rgba(255,255,255,0.15)', glow: 'rgba(255,255,255,0.1)' },
  super_effective:  { label: '2×',   color: '#f97316', bg: 'rgba(249,115,22,0.15)',   border: 'rgba(249,115,22,0.4)',  glow: 'rgba(249,115,22,0.3)' },
  double_super:     { label: '4×',   color: '#ef4444', bg: 'rgba(239,68,68,0.18)',    border: 'rgba(239,68,68,0.5)',   glow: 'rgba(239,68,68,0.4)' },
};

// ─── Type Icon SVGs ─────────────────────────────────────────────────────────

const typeIcons: Record<PokemonType, React.ReactNode> = {
  normal:   <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><circle cx="12" cy="12" r="8" opacity="0.6"/></svg>,
  fire:     <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2c-1 4-5 6-5 10a5 5 0 0010 0c0-4-4-6-5-10z"/></svg>,
  water:    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2C8 8 4 11 4 14.5a8 8 0 0016 0C20 11 16 8 12 2z"/></svg>,
  electric: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M13 2L4 14h7l-2 8 9-12h-7l2-8z"/></svg>,
  grass:    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 22c-4 0-8-3-8-8 0-5 4-10 8-12 4 2 8 7 8 12 0 5-4 8-8 8z"/></svg>,
  ice:      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z"/></svg>,
  fighting: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M8 5v5H3v4h5v5h4v-5h5v-4h-5V5z"/></svg>,
  poison:   <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r="2" fill="currentColor" opacity="0.4"/><circle cx="15" cy="10" r="2" fill="currentColor" opacity="0.4"/></svg>,
  ground:   <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M3 18h18v2H3zm0-4h12v2H3zm0-4h18v2H3zm0-4h12v2H3z" opacity="0.7"/></svg>,
  flying:   <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M22 6c-2 1-3.5 1.5-5 2-1.5-1-3-2-5-2-3 0-5 2-6 4 3-1 5.5 0 7 1 1.5-2 4-3 7-3-2 1-3.5 2.5-4 4l-3 1 2 1 1 3 1-3 2-1-3-1c.5-1.5 2-3 4-4z"/></svg>,
  psychic:  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><circle cx="12" cy="12" r="3"/><path d="M12 2a10 10 0 0110 10h-2a8 8 0 00-8-8zM2 12a10 10 0 0110-10v2a8 8 0 00-8 8z" opacity="0.6"/></svg>,
  bug:      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><circle cx="12" cy="12" r="4"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" opacity="0.5"/></svg>,
  rock:     <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M6 18l-3-6 4-6h10l4 6-3 6z" opacity="0.7"/></svg>,
  ghost:    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2a8 8 0 00-8 8v8l2-2 2 2 2-2 2 2 2-2 2 2v-8a8 8 0 00-8-8zm-3 7a1 1 0 110-2 1 1 0 010 2zm6 0a1 1 0 110-2 1 1 0 010 2z"/></svg>,
  dragon:   <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2C8 4 4 8 4 12c0 3 2 6 5 7l3-2 3 2c3-1 5-4 5-7 0-4-4-8-8-10z"/></svg>,
  dark:     <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
  steel:    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2l8 4v6c0 5.5-3.5 9.7-8 11-4.5-1.3-8-5.5-8-11V6z" opacity="0.7"/></svg>,
  fairy:    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2l2.4 4.8L19 7.5l-3.5 3.4.8 4.9L12 13.3l-4.3 2.5.8-4.9L5 7.5l4.6-.7z"/></svg>,
};

// ─── Type Card Component ───────────────────────────────────────────────────

function TypeCard({
  type,
  selected,
  onClick,
  size = 'md',
}: {
  type: PokemonType;
  selected: boolean;
  onClick: () => void;
  size?: 'sm' | 'md';
}) {
  const color = typeColorMap[type];
  const isSm = size === 'sm';

  return (
    <button
      onClick={onClick}
      className={[
        'relative flex items-center gap-1.5 rounded-lg font-semibold uppercase tracking-wider transition-all duration-200 select-none',
        isSm ? 'px-2.5 py-1.5 text-[10px]' : 'px-3 py-2 text-xs',
        selected
          ? 'scale-105 shadow-[0_0_20px_var(--glow)]'
          : 'opacity-70 hover:opacity-100 hover:scale-[1.02]',
      ].filter(Boolean).join(' ')}
      style={{
        backgroundColor: selected ? `${color}30` : `${color}12`,
        color: selected ? color : `${color}cc`,
        border: `1.5px solid ${selected ? color : `${color}40`}`,
        '--glow': color,
      } as React.CSSProperties}
    >
      <span className="flex-shrink-0" style={{ color: selected ? color : `${color}aa` }}>
        {typeIcons[type]}
      </span>
      {type}
    </button>
  );
}

// ─── Effectiveness Breakdown ────────────────────────────────────────────────

function EffectivenessBreakdown({
  attackingType,
  defendingTypes,
}: {
  attackingType: PokemonType;
  defendingTypes: PokemonType[];
}) {
  const results = useMemo(() => {
    if (defendingTypes.length === 0) return [];

    const multiplier = defendingTypes.reduce((acc, defType) => {
      return acc * effectiveness[attackingType][defType];
    }, 1);

    const level = getEffectivenessLevel(multiplier);
    const config = effectivenessConfig[level];

    const breakdown = defendingTypes.map((defType) => ({
      type: defType,
      multiplier: effectiveness[attackingType][defType],
      level: getEffectivenessLevel(effectiveness[attackingType][defType]),
    }));

    return [{ multiplier, level, config, breakdown }];
  }, [attackingType, defendingTypes]);

  if (results.length === 0) return null;
  const { multiplier, level, config, breakdown } = results[0];

  return (
<div
        className="glass rounded-xl p-5 animate-[slide-in_0.3s_ease-out]"
        style={{
          boxShadow: `0 0 30px ${config.glow}`,
          borderColor: config.border,
        }}
      >
        <div className="flex items-center justify-center gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm text-white/50">
          <span style={{ color: typeColorMap[attackingType] }}>{attackingIcons(attackingType)}</span>
          <span className="uppercase tracking-wider" style={{ color: typeColorMap[attackingType] }}>
            {attackingType}
          </span>
        </div>
        <span className="text-white/30 text-lg">→</span>
        <div className="flex items-center gap-1.5">
          {defendingTypes.map((dt) => (
            <span key={dt} className="flex items-center gap-1 text-sm" style={{ color: typeColorMap[dt] }}>
              {typeIcons[dt]}
              <span className="uppercase tracking-wider">{dt}</span>
            </span>
          ))}
        </div>
        <span className="text-white/30 text-lg">=</span>
        <div
          className="text-3xl font-bold font-[family-name:var(--font-pixel)] tracking-wider"
          style={{ color: config.color, textShadow: `0 0 20px ${config.glow}` }}
        >
          {config.label}
        </div>
      </div>

      {defendingTypes.length > 1 && (
        <div className="border-t border-white/10 pt-3 mt-3">
          <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2 font-[family-name:var(--font-pixel)]">
            Breakdown
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {breakdown.map((item, i) => (
              <span key={item.type} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-white/30 text-xs">×</span>}
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold"
                  style={{
                    backgroundColor: effectivenessConfig[item.level].bg,
                    color: effectivenessConfig[item.level].color,
                    border: `1px solid ${effectivenessConfig[item.level].border}`,
                  }}
                >
                  <span style={{ color: typeColorMap[item.type] }}>{typeIcons[item.type]}</span>
                  {effectivenessConfig[item.level].label}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function attackingIcons(type: PokemonType) {
  return typeIcons[type];
}

// ─── Full Effectiveness Summary ─────────────────────────────────────────────

function EffectivenessSummary({
  attackingType,
  defendingTypes,
}: {
  attackingType: PokemonType;
  defendingTypes: PokemonType[];
}) {
  const summary = useMemo(() => {
    const groups: Record<EffectivenessLevel, PokemonType[]> = {
      immune: [],
      double_resisted: [],
      resisted: [],
      normal: [],
      super_effective: [],
      double_super: [],
    };

    ALL_TYPES.forEach((atkType) => {
      const multiplier = defendingTypes.reduce(
        (acc, defType) => acc * effectiveness[atkType][defType],
        1
      );
      const level = getEffectivenessLevel(multiplier);
      groups[level].push(atkType);
    });

    return groups;
  }, [defendingTypes]);

  const displayOrder: EffectivenessLevel[] = [
    'double_super',
    'super_effective',
    'normal',
    'resisted',
    'double_resisted',
    'immune',
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-xs uppercase tracking-widest text-white/40 font-[family-name:var(--font-pixel)]">
        All Attacking Types vs {defendingTypes.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join('/')}
      </h3>
      {displayOrder.map((level) => {
        const types = summary[level];
        if (types.length === 0) return null;
        const config = effectivenessConfig[level];

        return (
          <div key={level} className="flex items-start gap-3">
            <span
              className="shrink-0 text-xs font-bold font-[family-name:var(--font-pixel)] w-8 text-right pt-1"
              style={{ color: config.color }}
            >
              {config.label}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {types.map((type) => (
                <span
                  key={type}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider"
                  style={{
                    backgroundColor: `${typeColorMap[type]}18`,
                    color: typeColorMap[type],
                    border: `1px solid ${typeColorMap[type]}40`,
                  }}
                >
                  {typeIcons[type]}
                  {type}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function TypeMatchupPage() {
  const [attackingType, setAttackingType] = useState<PokemonType>('fire');
  const [defendingTypes, setDefendingTypes] = useState<PokemonType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTypes = useMemo(() => {
    if (!searchQuery.trim()) return ALL_TYPES;
    const q = searchQuery.toLowerCase();
    return ALL_TYPES.filter((t) => t.includes(q));
  }, [searchQuery]);

  const handleDefenderClick = (type: PokemonType) => {
    setDefendingTypes((prev) => {
      if (prev.includes(type)) {
        return prev.filter((t) => t !== type);
      }
      if (prev.length >= 2) {
        return [prev[1], type];
      }
      return [...prev, type];
    });
  };

  const clearDefenders = () => setDefendingTypes([]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="text-center mb-8 sm:mb-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[var(--type-dragon)] to-[var(--type-fairy)] border-2 border-white/20 shadow-[0_0_20px_var(--type-dragon)40] mb-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
          Type <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--type-dragon)] to-[var(--type-fairy)]">Matchup</span> Calculator
        </h1>
        <p className="text-white/40 text-sm max-w-lg mx-auto">
          Select an attacking type and defending type(s) to calculate effectiveness. Dual-type defenders multiply resistances.
        </p>
      </div>

      <div className="max-w-md mx-auto mb-6">
        <div className="glass rounded-lg flex items-center gap-2 px-3 py-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-white/40 shrink-0">
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter types..."
            className="bg-transparent text-white text-sm placeholder-white/30 outline-none flex-1"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-white/40 hover:text-white/70 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-[var(--type-fire)] shadow-[0_0_6px_var(--type-fire)]" />
            <h2 className="text-xs uppercase tracking-widest text-white/50 font-[family-name:var(--font-pixel)]">
              Attacking Type
            </h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-2">
            {filteredTypes.map((type) => (
              <TypeCard
                key={type}
                type={type}
                selected={attackingType === type}
                onClick={() => setAttackingType(type)}
              />
            ))}
          </div>
        </div>

        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--type-water)] shadow-[0_0_6px_var(--type-water)]" />
              <h2 className="text-xs uppercase tracking-widest text-white/50 font-[family-name:var(--font-pixel)]">
                Defending Type{defendingTypes.length > 1 ? 's' : ''}
              </h2>
              <span className="text-[10px] text-white/30">({defendingTypes.length}/2)</span>
            </div>
            {defendingTypes.length > 0 && (
              <button
                onClick={clearDefenders}
                className="text-[10px] uppercase tracking-wider text-white/40 hover:text-white/70 transition-colors px-2 py-1 rounded border border-white/10 hover:border-white/20"
              >
                Clear
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-2">
            {filteredTypes.map((type) => (
              <TypeCard
                key={type}
                type={type}
                selected={defendingTypes.includes(type)}
                onClick={() => handleDefenderClick(type)}
                size="sm"
              />
            ))}
          </div>
        </div>
      </div>

      {defendingTypes.length > 0 && (
        <div className="space-y-6 animate-[slide-in_0.3s_ease-out]">
          <EffectivenessBreakdown
            attackingType={attackingType}
            defendingTypes={defendingTypes}
          />

          <div className="glass rounded-xl p-5">
            <EffectivenessSummary
              attackingType={attackingType}
              defendingTypes={defendingTypes}
            />
          </div>
        </div>
      )}

      {defendingTypes.length === 0 && (
        <div className="glass rounded-xl p-12 text-center">
          <div className="text-white/20 text-4xl mb-3">🛡️</div>
          <p className="text-white/40 text-sm">
            Select one or two defending types to see effectiveness
          </p>
          <p className="text-white/25 text-xs mt-1">
            Click on type cards in the defending column
          </p>
        </div>
      )}
    </div>
  );
}