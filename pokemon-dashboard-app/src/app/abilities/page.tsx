'use client';

import { useState, useMemo } from 'react';
import { useDuckDB } from '@/app/DuckDBProvider';
import { useDuckDBQuery } from '@/lib/duckdb/hooks';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PokemonSprite } from '@/components/ui/PokemonSprite';
import { type PokemonType } from '@/lib/design-tokens';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AbilityRow {
  id: number;
  name: string;
  generation__name: string;
  is_main_series: boolean;
  _dlt_id: string;
}

interface EffectEntryRow {
  effect: string;
  short_effect: string;
  language__name: string;
  _dlt_parent_id: string;
}

interface AbilityPokemonRow {
  is_hidden: boolean;
  slot: number;
  pokemon__name: string;
  pokemon__url: string;
  _dlt_parent_id: string;
}

interface AbilityNameRow {
  name: string;
  language__name: string;
  _dlt_parent_id: string;
}

interface PokemonRow {
  id: number;
  name: string;
  sprite_url: string;
  type_names: string;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

const ABILITIES_QUERY = `
  SELECT id, name, generation__name, is_main_series, _dlt_id
  FROM pokemon_db.pokemon_abilities
  ORDER BY id
`;

const EFFECT_ENTRIES_QUERY = `
  SELECT effect, short_effect, language__name, _dlt_parent_id
  FROM pokemon_db.pokemon_abilities__effect_entries
`;

const ABILITY_POKEMON_QUERY = `
  SELECT is_hidden, slot, pokemon__name, pokemon__url, _dlt_parent_id
  FROM pokemon_db.pokemon_abilities__pokemon
`;

const ABILITY_NAMES_QUERY = `
  SELECT name, language__name, _dlt_parent_id
  FROM pokemon_db.pokemon_abilities__names
`;

const POKEMON_QUERY = `
  SELECT id, name, sprite_url, type_names
  FROM pokemon_db.dim_pokemon
  ORDER BY id
`;

// ─── Generation mapping ──────────────────────────────────────────────────────

const GENERATION_LABELS: Record<string, string> = {
  'generation-i': 'Gen I',
  'generation-ii': 'Gen II',
  'generation-iii': 'Gen III',
  'generation-iv': 'Gen IV',
  'generation-v': 'Gen V',
  'generation-vi': 'Gen VI',
  'generation-vii': 'Gen VII',
  'generation-viii': 'Gen VIII',
  'generation-ix': 'Gen IX',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractPokemonId(url: string): number {
  const match = url.match(/\/pokemon\/(\d+)\//);
  return match ? parseInt(match[1], 10) : 0;
}

function formatAbilityName(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ─── Ability Detail Modal ─────────────────────────────────────────────────────

function AbilityDetail({
  ability,
  effectText,
  shortEffect,
  pokemonList,
  allPokemon,
  onClose,
}: {
  ability: AbilityRow;
  effectText: string;
  shortEffect: string;
  pokemonList: AbilityPokemonRow[];
  allPokemon: Map<string, PokemonRow>;
  onClose: () => void;
}) {
  const regularPokemon = pokemonList.filter((p) => !p.is_hidden);
  const hiddenPokemon = pokemonList.filter((p) => p.is_hidden);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative glass rounded-xl border border-[var(--type-psychic)]/30 max-w-2xl w-full max-h-[85vh] overflow-y-auto"
        style={{ boxShadow: '0 0 30px var(--type-psychic)20' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 glass border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: 'var(--type-psychic)',
                boxShadow: '0 0 12px var(--type-psychic)40',
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{formatAbilityName(ability.name)}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-white/40 font-[family-name:var(--font-pixel)] tracking-wider">
                  {GENERATION_LABELS[ability.generation__name] || ability.generation__name}
                </span>
                {ability.is_main_series && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--type-psychic)]/20 text-[var(--type-psychic)] border border-[var(--type-psychic)]/30 font-semibold uppercase tracking-wider">
                    Main Series
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Effect */}
          {shortEffect && (
            <div>
              <h3 className="text-xs font-[family-name:var(--font-pixel)] text-[var(--type-psychic)] tracking-wider mb-2">
                EFFECT
              </h3>
              <p className="text-white/80 text-sm leading-relaxed">{shortEffect}</p>
            </div>
          )}

          {effectText && effectText !== shortEffect && (
            <div>
              <h3 className="text-xs font-[family-name:var(--font-pixel)] text-white/40 tracking-wider mb-2">
                DETAILED DESCRIPTION
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">{effectText}</p>
            </div>
          )}

          {/* Regular Pokemon */}
          {regularPokemon.length > 0 && (
            <div>
              <h3 className="text-xs font-[family-name:var(--font-pixel)] text-white/40 tracking-wider mb-3">
                POKEMON WITH THIS ABILITY
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {regularPokemon.map((p) => {
                  const pokemon = allPokemon.get(p.pokemon__name);
                  const pokemonId = pokemon?.id || extractPokemonId(p.pokemon__url);
                  const types = pokemon?.type_names?.split(',') || [];
                  return (
                    <div
                      key={p.pokemon__name}
                      className="glass rounded-lg p-2 flex items-center gap-2 hover:bg-white/10 transition-colors"
                    >
                      <PokemonSprite pokemonId={pokemonId} size={36} alt={p.pokemon__name} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-white font-medium capitalize truncate">
                          {p.pokemon__name}
                        </p>
                        {types.length > 0 && (
                          <div className="flex gap-1 mt-0.5 flex-wrap">
                            {types.slice(0, 2).map((t) => (
                              <Badge key={t} type={t as PokemonType} className="text-[9px] px-1.5 py-0" />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Hidden Pokemon */}
          {hiddenPokemon.length > 0 && (
            <div>
              <h3 className="text-xs font-[family-name:var(--font-pixel)] text-[var(--type-electric)] tracking-wider mb-3">
                HIDDEN ABILITY
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {hiddenPokemon.map((p) => {
                  const pokemon = allPokemon.get(p.pokemon__name);
                  const pokemonId = pokemon?.id || extractPokemonId(p.pokemon__url);
                  const types = pokemon?.type_names?.split(',') || [];
                  return (
                    <div
                      key={p.pokemon__name}
                      className="glass rounded-lg p-2 flex items-center gap-2 hover:bg-white/10 transition-colors border border-[var(--type-electric)]/20"
                    >
                      <PokemonSprite pokemonId={pokemonId} size={36} alt={p.pokemon__name} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-white font-medium capitalize truncate">
                          {p.pokemon__name}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[9px] px-1.5 py-0 rounded bg-[var(--type-electric)]/20 text-[var(--type-electric)] border border-[var(--type-electric)]/30 font-semibold uppercase tracking-wider">
                            Hidden
                          </span>
                          {types.slice(0, 1).map((t) => (
                            <Badge key={t} type={t as PokemonType} className="text-[9px] px-1.5 py-0" />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Ability Card ─────────────────────────────────────────────────────────────

function AbilityCard({
  ability,
  shortEffect,
  pokemonCount,
  hiddenCount,
  onClick,
}: {
  ability: AbilityRow;
  shortEffect: string;
  pokemonCount: number;
  hiddenCount: number;
  onClick: () => void;
}) {
  return (
    <div onClick={onClick} className="cursor-pointer">
      <Card pokemonType="psychic" hover className="group h-full">
      <div className="flex flex-col gap-2.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-white font-semibold text-sm group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/70 transition-all duration-300">
            {formatAbilityName(ability.name)}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0">
            {ability.is_main_series && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--type-psychic)]/20 text-[var(--type-psychic)] border border-[var(--type-psychic)]/30 font-semibold uppercase tracking-wider">
                Main
              </span>
            )}
          </div>
        </div>

        {shortEffect && (
          <p className="text-white/50 text-xs leading-relaxed line-clamp-2">{shortEffect}</p>
        )}

        <div className="flex items-center gap-3 mt-auto pt-1">
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.354-1.853M17 20H7m10 0v-2c0-.656-.126-1.283-.354-1.853M7 20H2v-2a3 3 0 015.354-1.853M7 20v-2c0-.656.126-1.283.354-1.853m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{pokemonCount}</span>
          </div>
          {hiddenCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-[var(--type-electric)]/70">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>{hiddenCount} hidden</span>
            </div>
          )}
          <span className="text-[10px] text-white/25 ml-auto">
            {GENERATION_LABELS[ability.generation__name] || ability.generation__name}
          </span>
        </div>
      </div>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AbilitiesPage() {
  const { db, loading: dbLoading, error: dbError } = useDuckDB();
  const { data: abilities, loading: abilitiesLoading, error: abilitiesError } = useDuckDBQuery<AbilityRow>(ABILITIES_QUERY);
  const { data: effectEntries, loading: effectsLoading } = useDuckDBQuery<EffectEntryRow>(EFFECT_ENTRIES_QUERY);
  const { data: abilityPokemon, loading: pokemonLoading } = useDuckDBQuery<AbilityPokemonRow>(ABILITY_POKEMON_QUERY);
  const { data: abilityNames, loading: namesLoading } = useDuckDBQuery<AbilityNameRow>(ABILITY_NAMES_QUERY);
  const { data: allPokemonRaw, loading: allPokemonLoading } = useDuckDBQuery<PokemonRow>(POKEMON_QUERY);

  const [search, setSearch] = useState('');
  const [generationFilter, setGenerationFilter] = useState<string>('all');
  const [hiddenFilter, setHiddenFilter] = useState<'all' | 'has_hidden' | 'hidden_only'>('all');
  const [selectedAbility, setSelectedAbility] = useState<AbilityRow | null>(null);

  // Build lookup maps
  const pokemonMap = useMemo(() => {
    const map = new Map<string, PokemonRow>();
    allPokemonRaw?.forEach((p) => map.set(p.name, p));
    return map;
  }, [allPokemonRaw]);

  const effectMap = useMemo(() => {
    const map = new Map<string, { effect: string; short_effect: string }>();
    effectEntries?.forEach((e) => {
      if (e.language__name === 'en') {
        map.set(e._dlt_parent_id, { effect: e.effect, short_effect: e.short_effect });
      }
    });
    return map;
  }, [effectEntries]);

  const nameMap = useMemo(() => {
    const map = new Map<string, string>();
    abilityNames?.forEach((n) => {
      if (n.language__name === 'en') {
        map.set(n._dlt_parent_id, n.name);
      }
    });
    return map;
  }, [abilityNames]);

  const pokemonByAbility = useMemo(() => {
    const map = new Map<string, AbilityPokemonRow[]>();
    abilityPokemon?.forEach((p) => {
      const list = map.get(p._dlt_parent_id) || [];
      list.push(p);
      map.set(p._dlt_parent_id, list);
    });
    return map;
  }, [abilityPokemon]);

  // Get unique generations
  const generations = useMemo(() => {
    const gens = new Set<string>();
    abilities?.forEach((a) => gens.add(a.generation__name));
    return Array.from(gens).sort();
  }, [abilities]);

  // Filter abilities
  const filteredAbilities = useMemo(() => {
    if (!abilities) return [];
    let result = abilities;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((a) => {
        const enName = nameMap.get(a._dlt_id) || '';
        return a.name.toLowerCase().includes(q) || enName.toLowerCase().includes(q);
      });
    }

    // Generation filter
    if (generationFilter !== 'all') {
      result = result.filter((a) => a.generation__name === generationFilter);
    }

    // Hidden ability filter
    if (hiddenFilter !== 'all') {
      result = result.filter((a) => {
        const pokemon = pokemonByAbility.get(a._dlt_id) || [];
        const hasHidden = pokemon.some((p) => p.is_hidden);
        if (hiddenFilter === 'has_hidden') return hasHidden;
        if (hiddenFilter === 'hidden_only') return hasHidden;
        return true;
      });
    }

    return result;
  }, [abilities, search, generationFilter, hiddenFilter, nameMap, pokemonByAbility]);

  // Loading state
  const isLoading = dbLoading || abilitiesLoading || effectsLoading || pokemonLoading || namesLoading || allPokemonLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <LoadingSpinner size={64} />
        <p className="text-white/60 text-sm font-[family-name:var(--font-pixel)] tracking-wider">
          LOADING ABILITY DATA...
        </p>
      </div>
    );
  }

  // Error state
  if (dbError || abilitiesError || !db) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center">
          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-red-400 text-sm">Failed to load ability data</p>
        {(dbError || abilitiesError) && (
          <p className="text-white/40 text-xs">{(dbError || abilitiesError)?.message}</p>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 sm:mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: 'var(--type-psychic)',
              boxShadow: '0 0 12px var(--type-psychic)40',
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Ability{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--type-psychic)] to-[var(--type-electric)]">
                Explorer
              </span>
            </h1>
            <p className="text-white/40 text-sm">Browse abilities and discover which Pokemon learn each one</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search abilities..."
            className="w-full glass rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:ring-1 focus:ring-[var(--type-psychic)] transition-all"
          />
        </div>

        {/* Generation filter */}
        <select
          value={generationFilter}
          onChange={(e) => setGenerationFilter(e.target.value)}
          className="glass rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-[var(--type-psychic)] appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23ffffff80%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center]"
        >
          <option value="all" className="bg-[var(--surface)]">All Generations</option>
          {generations.map((g) => (
            <option key={g} value={g} className="bg-[var(--surface)]">
              {GENERATION_LABELS[g] || g}
            </option>
          ))}
        </select>

        {/* Hidden ability filter */}
        <select
          value={hiddenFilter}
          onChange={(e) => setHiddenFilter(e.target.value as 'all' | 'has_hidden' | 'hidden_only')}
          className="glass rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-[var(--type-psychic)] appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23ffffff80%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center]"
        >
          <option value="all" className="bg-[var(--surface)]">All Abilities</option>
          <option value="has_hidden" className="bg-[var(--surface)]">Has Hidden Ability</option>
          <option value="hidden_only" className="bg-[var(--surface)]">Hidden Ability Only</option>
        </select>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-white/40 font-[family-name:var(--font-pixel)] tracking-wider">
          {filteredAbilities.length} ABILITIES FOUND
        </p>
        {(search || generationFilter !== 'all' || hiddenFilter !== 'all') && (
          <button
            onClick={() => {
              setSearch('');
              setGenerationFilter('all');
              setHiddenFilter('all');
            }}
            className="text-xs text-[var(--type-psychic)] hover:text-[var(--type-psychic)]/80 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Ability Grid */}
      {filteredAbilities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
            <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p className="text-white/30 text-sm">No abilities match your search</p>
          <p className="text-white/20 text-xs">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredAbilities.map((ability) => {
            const effect = effectMap.get(ability._dlt_id);
            const pokemon = pokemonByAbility.get(ability._dlt_id) || [];
            const hiddenCount = pokemon.filter((p) => p.is_hidden).length;

            return (
              <AbilityCard
                key={ability.id}
                ability={ability}
                shortEffect={effect?.short_effect || ''}
                pokemonCount={pokemon.length}
                hiddenCount={hiddenCount}
                onClick={() => setSelectedAbility(ability)}
              />
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedAbility && (
        <AbilityDetail
          ability={selectedAbility}
          effectText={effectMap.get(selectedAbility._dlt_id)?.effect || ''}
          shortEffect={effectMap.get(selectedAbility._dlt_id)?.short_effect || ''}
          pokemonList={pokemonByAbility.get(selectedAbility._dlt_id) || []}
          allPokemon={pokemonMap}
          onClose={() => setSelectedAbility(null)}
        />
      )}
    </div>
  );
}