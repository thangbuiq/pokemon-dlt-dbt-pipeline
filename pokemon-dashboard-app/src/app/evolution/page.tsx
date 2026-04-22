"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useDuckDBQuery } from '@/lib/duckdb/hooks';

type EvoNode = {
  name: string;
  stage: number;
  evolves_from: string | null;
  chain_id: number;
};

type EvoEdge = {
  from_species: string;
  to_species: string;
  trigger: string;
  min_level?: number | null;
  item?: string | null;
};

type SpeciesRow = { species_name: string };
type ChainIdRow = { chain_id: number };

const STAGE_WIDTH = 260;
const NODE_WIDTH = 200;
const NODE_HEIGHT = 110;
const TOP_PADDING = 40;

type SpriteCache = Record<string, string>;

export default function EvolutionVisualizer() {
  const [selected, setSelected] = useState<string | null>(null);
  const [nodes, setNodes] = useState<EvoNode[]>([]);
  const [edges, setEdges] = useState<EvoEdge[]>([]);
  const [spriteCache, setSpriteCache] = useState<SpriteCache>({});
  const [positions, setPositions] = useState<{ [name: string]: { x: number; y: number; stage: number } }>({});

  const { data: speciesRows, loading: loadingSpecies, error: speciesError } = useDuckDBQuery<SpeciesRow>(
    'SELECT DISTINCT species_name FROM dim_evolution_tree ORDER BY species_name'
  );

  const speciesList = speciesRows?.map((r) => r.species_name) ?? [];

  useEffect(() => {
    if (speciesList.length > 0 && !selected) {
      setSelected(speciesList[0]);
    }
  }, [speciesList, selected]);

  // When selected species changes, load its chain (nodes + edges)
  useEffect(() => {
    if (!selected) return;
    let mounted = true;

    const loadChain = async () => {
      try {
        const { db } = await import('@/app/DuckDBProvider').then(m => {
          const mod = m as { useDuckDB: () => { db: DuckDBInstance | null } };
          return { db: null };
        });
      } catch {
        // fallback
      }
    };
    loadChain();
  }, [selected]);

  // Use hooks for chain data
  const { data: chainIdRows } = useDuckDBQuery<ChainIdRow>(
    selected ? `SELECT chain_id FROM dim_evolution_tree WHERE species_name = '${selected}' LIMIT 1` : 'SELECT CAST(0 AS BIGINT) as chain_id WHERE 1=0',
    [selected]
  );

  const chainId = chainIdRows?.[0]?.chain_id ?? null;

  const { data: nodeRows } = useDuckDBQuery<EvoNode>(
    chainId ? `SELECT species_name as name, stage, evolves_from, chain_id FROM dim_evolution_tree WHERE chain_id = ${chainId} ORDER BY stage` : 'SELECT species_name as name, stage, evolves_from, chain_id FROM dim_evolution_tree WHERE 1=0',
    [chainId]
  );

  const { data: edgeRows } = useDuckDBQuery<EvoEdge>(
    chainId ? `SELECT from_species, to_species, trigger, min_level, item FROM fct_evolution_paths WHERE chain_id = ${chainId}` : 'SELECT from_species, to_species, trigger, min_level, item FROM fct_evolution_paths WHERE 1=0',
    [chainId]
  );

  useEffect(() => {
    setNodes(nodeRows ?? []);
    setEdges(edgeRows ?? []);
  }, [nodeRows, edgeRows]);

        if (!mounted) return;
        setNodes(loadedNodes);
        setEdges(loadedEdges);
        // Compute layout positions per stage
        const stageGroups: Record<number, EvoNode[]> = {};
        loadedNodes.forEach((n) => {
          stageGroups[n.stage] = stageGroups[n.stage] ?? [];
          stageGroups[n.stage].push(n);
        });
        const maxStage = Math.max(...loadedNodes.map((n) => n.stage), 1);
        const newPositions: { [name: string]: { x: number; y: number; stage: number } } = {};
        let maxRows = 0;
        for (let s = 1; s <= maxStage; s++) {
          const group = stageGroups[s] ?? [];
          maxRows = Math.max(maxRows, group.length);
        }
        for (let s = 1; s <= maxStage; s++) {
          const group = stageGroups[s] ?? [];
          group.forEach((n, idx) => {
            const x = (s - 1) * STAGE_WIDTH + (STAGE_WIDTH - NODE_WIDTH) / 2;
            const y = TOP_PADDING + idx * NODE_HEIGHT;
            newPositions[n.name] = { x, y, stage: s };
          });
        }
        setPositions(newPositions);
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load chain');
      }
    };

    if (selected) {
      loadChain(selected);
    }
    return () => { mounted = false; };
  }, [selected]);

  // Sprite fetching with cache
  useEffect(() => {
    let mounted = true;
    const fetchSprites = async () => {
      // For all current nodes, ensure a sprite is cached
      const toFetch = nodes.map((n) => n.name).filter((n) => !spriteCache[n]);
      if (toFetch.length === 0) return;
      const newCache = { ...spriteCache };
      for (const name of toFetch) {
        try {
          const url = `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(name.toLowerCase())}`;
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            // Prefer official artwork if available
            let img = data?.sprites?.front_default;
            if (!img) img = data?.sprites?.other?.dream_world?.front_default;
            if (img) newCache[name] = img;
          }
        } catch {
          // ignore per-pokemon fetch errors
        }
      }
      if (mounted && Object.keys(newCache).length > 0) {
        setSpriteCache(newCache);
      }
    };
    fetchSprites();
    return () => { mounted = false; };
  }, [nodes]);

  const maxStage = useMemo(() => {
    if (!nodes.length) return 0;
    return Math.max(...nodes.map((n) => n.stage));
  }, [nodes]);

  // Derived view: stage groups and layout boundaries
  const stageGroups = useMemo(() => {
    const groups: Record<number, EvoNode[]> = {};
    nodes.forEach((n) => {
      groups[n.stage] = groups[n.stage] ?? [];
      groups[n.stage].push(n);
    });
    // sort by name for deterministic order
    Object.values(groups).forEach((arr) => arr.sort((a,b)=> a.name.localeCompare(b.name)));
    return groups;
  }, [nodes]);

  const containerWidth = Math.max(0, maxStage) * STAGE_WIDTH;
  const maxRows = Math.max(0, ...Object.values(stageGroups).map((g) => g.length));
  const containerHeight = TOP_PADDING * 2 + maxRows * NODE_HEIGHT;

  // Render helpers
  const renderNode = (n: EvoNode) => {
    const pos = positions[n.name];
    const sprite = spriteCache[n.name];
    const linkHref = `/pokedex/${encodeURIComponent(n.name)}`;
    return (
      <Link key={`${n.chain_id}-${n.name}`} href={linkHref} style={{ position: 'absolute', left: (pos?.x ?? 0), top: (pos?.y ?? 0), width: NODE_WIDTH }}>
        <div className="glass hover:bg-white/5" style={{ borderRadius: 12, padding: 12, height: NODE_HEIGHT - 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {sprite ? (
            <img src={sprite} alt={n.name} style={{ width: 72, height: 72, objectFit: 'contain' }} />
          ) : (
            <div style={{ width:72, height:72, borderRadius:8, background:'#333' }} />
          )}
          <div style={{ marginTop: 6, fontWeight: 600, fontSize: 14, textAlign: 'center' }}>{n.name}</div>
        </div>
      </Link>
    );
  };

  // Edges coordinates for SVG overlay
  const edgeLines = useMemo(() => {
    const lines: Array<{ x1:number, y1:number, x2:number, y2:number, label?:string, edge:EvoEdge }> = [];
    for (const e of edges) {
      const from = nodes.find((n) => n.name === e.from_species);
      const to = nodes.find((n) => n.name === e.to_species);
      if (!from || !to) continue;
      const pFrom = positions[from.name];
      const pTo = positions[to.name];
      if (!pFrom || !pTo) continue;
      const x1 = pFrom.x + NODE_WIDTH / 2;
      const y1 = pFrom.y + NODE_HEIGHT / 2;
      const x2 = pTo.x + NODE_WIDTH / 2;
      const y2 = pTo.y + NODE_HEIGHT / 2;
      lines.push({ x1, y1, x2, y2, label: e.trigger, edge: e });
    }
    return lines;
  }, [edges, nodes, positions]);

  const allNodesExist = nodes.length > 0 && Object.keys(positions).length === nodes.length;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold mb-4">Evolution Visualizer</h1>
      {error && <div className="text-red-400 mb-4">{error}</div>}
      <div className="mb-6 flex items-center gap-4">
        <label htmlFor="pokemon-select" className="text-sm">Select Pokemon chain:</label>
        <select
          id="pokemon-select"
          value={selected ?? ''}
          onChange={(e) => setSelected(e.target.value)}
          className="bg-black/40 border border-white/20 text-white p-2 rounded"
        >
          {speciesList.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="relative" style={{ height: containerHeight || 400, minHeight: 320, border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: 16 }}>
        {/* Stage headers for clarity */}
        {[...Array(maxStage)].map((_, idx) => (
          <div key={idx} style={{ position: 'absolute', left: idx * STAGE_WIDTH + (STAGE_WIDTH - NODE_WIDTH) / 2, top: 0, width: NODE_WIDTH, textAlign: 'center', fontSize: 12, color: '#fff', opacity: 0.8 }}>
            Stage {idx + 1}
          </div>
        ))}
        {/* SVG connectors */}
        <svg width={containerWidth} height={containerHeight} style={{ position: 'absolute', left: 0, top: 0 }}>
          {edgeLines.map((ln, i) => (
            <g key={i}>
              <polyline points={`${ln.x1},${ln.y1} ${ln.x2},${ln.y2}`} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={2} />
              {ln.label && (
                <text x={ (ln.x1 + ln.x2)/2 } y={ (ln.y1 + ln.y2)/2 - 6 } textAnchor="middle" fill="white" fontSize={10}>
                  {ln.label}
                </text>
              )}
            </g>
          ))}
        </svg>
        {/* Node cards */}
        {nodes.map((n) => renderNode(n))}
      </div>
    </main>
  );
}
