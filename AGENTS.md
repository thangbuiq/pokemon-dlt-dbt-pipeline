# AGENTS.md - Pokemon Dashboard Project

## Project Overview

Cyberpunk PokeDex - a full-stack data app: dlt → DuckDB → dbt → Next.js.

## Architecture

```
pokemon-dlt-dbt-pipeline/
├── pokemon-dlt-pipeline/    # dlt Python package - fetches from PokeAPI
│   └── pokemon_pipeline/
│       ├── pipeline.py       # Main pipeline entry point
│       ├── sources/pokemon_api.py  # @dlt.source + @dlt.resource + @dlt.transformer
│       └── export.py         # Exports curated tables to pokemon.db
├── pokemon-dbt-pipeline/    # dbt-duckdb project
│   ├── models/
│   │   ├── staging/         # stg_* models (join child tables via _dlt_id/_dlt_parent_id)
│   │   ├── intermediate/    # int_* models (enriched, evolution flattened)
│   │   └── marts/           # dim_* + fct_* models
│   ├── seeds/               # type_effectiveness.csv
│   ├── tests/               # Singular dbt tests
│   └── profiles.yml
├── pokemon-dashboard-app/   # Next.js 16 App Router
│   ├── src/
│   │   ├── app/             # 9 routes: /, /pokedex, /type-matchup, /team-builder, etc.
│   │   ├── components/      # layout/, ui/ (Card, Badge, Button, PokemonSprite, LoadingSpinner)
│   │   └── lib/
│   │       ├── design-tokens.ts  # 18 Pokemon type colors
│   │       ├── duckdb/          # hooks.ts (useDuckDBQuery), queries.ts, index.ts
│   │       └── types/           # pokemon.ts (TypeScript types)
│   └── public/pokemon.db   # Exported DuckDB file served statically
├── pokemon-dagster-app/     # Dagster orchestration (small, experimental)
│   └── src/pokemon_dagster_app/defs/
├── data/
│   ├── raw.duckdb           # dlt target (also dbt source)
│   └── pokemon.db           # Exported for dashboard
└── justfile                 # Task orchestration
```

## Subproject AGENTS

Each subproject has its own `AGENTS.md` with detailed conventions and commands:

- [`pokemon-dlt-pipeline/AGENTS.md`](./pokemon-dlt-pipeline/AGENTS.md) - dlt pipeline (PokeAPI → DuckDB)
- [`pokemon-dbt-pipeline/AGENTS.md`](./pokemon-dbt-pipeline/AGENTS.md) - dbt transforms (staging → marts)
- [`pokemon-dashboard-app/AGENTS.md`](./pokemon-dashboard-app/AGENTS.md) - Next.js dashboard

## Key Conventions

### dlt Pipeline

- Uses `@dlt.source(max_table_nesting=2)` - child tables created with `__` separator
- Parent-child join pattern: `ON parent._dlt_id = child._dlt_parent_id`
- Column names are flattened: `type__name` not `type->>'name'`
- `selected=False` on intermediate resources (pokemon_list)
- `@dlt.transformer` + `@dlt.defer` for parallel fetching
- Run: `just pipeline`

### dbt Models

- **Staging**: Join child tables via `_dlt_id = _dlt_parent_id`, NOT UNNEST
- **Intermediate**: Enriched Pokemon, evolution flattened (UNION for stages), type matchups
- **Marts**: dim_pokemon, dim_pokemon_types, dim_pokemon_stats, dim_evolution_tree, fct_evolution_paths, fct_type_matchup_matrix
- Sources defined in `models/sources.yml` - must include child tables
- Run: `just transform`
- Test: `cd pokemon-dbt-pipeline && dbt test`

### Dashboard (Next.js)

- **ALL pages use `"use client"`**
- Route structure: App Router with `/app/[page]/page.tsx`
- Design: Retro Game Boy style (light theme, pixel fonts)
- Data access: `useDuckDBQuery<T>(sql)` hook → returns `{ data: T[], loading, error }`
- DuckDB loads from `/pokemon.db` (static file in `public/`)
- Sprites: PokeAPI CDN URLs via `getSpriteUrl(id)`
- Package manager: **bun** (not npm/pnpm)
- Run: `just dashboard`
- Build: `just build`

### Data Flow

```bash
just install    # Install Python dependencies using uv
just pipeline   # dlt → raw.duckdb (6+ PokeAPI endpoints)
just transform  # dbt → raw.duckdb (staging → intermediate → marts)
just export     # raw.duckdb → pokemon.db (13 curated tables)
just data       # pipeline + transform + export in sequence
```

## Tooling Notes

- **Python workspace**: Root `pyproject.toml` uses `[tool.uv.workspace]` with members `pokemon-dlt-pipeline`, `pokemon-dbt-pipeline`, `pokemon-dagster-app`. Use `uv` (not pip/poetry).
- **JS package manager**: `bun` (lockfile: `pokemon-dashboard-app/bun.lock`). Do not use npm/pnpm in CI without translating commands.
- **Prettier** (`pokemon-dashboard-app/.prettierrc`): `semi: false`, `singleQuote: true`, `trailingComma: es5`, `printWidth: 100`.
- **Missing configs**: No `.eslintrc.*` or `.editorconfig` found. Linting relies on `eslint-config-next` defaults.

## Common Gotchas

1. **dbt child tables**: dlt creates separate `pokemon_details__types` tables, NOT nested arrays. Always JOIN on `_dlt_id = _dlt_parent_id`, never UNNEST.
2. **Next.js + DuckDB**: Must use `"use client"` and dynamic import with `ssr: false`. No Turbopack in production.
3. **Static export**: `next.config.ts` has `output: "export"` for Vercel static hosting.
4. **Python env**: Use `source .venv/bin/activate` before running pipeline/dbt commands.
5. **dbt working dir**: Always `cd pokemon-dbt-pipeline` before running `dbt` commands.

## Testing

- dbt: `cd pokemon-dbt-pipeline && uv run dbt test`
- Dashboard: `cd pokemon-dashboard-app && bun run build`

## Type Colors (design-tokens.ts)

18 Pokemon types with hex colors: normal, fire, water, electric, grass, ice, fighting, poison, ground, flying, psychic, bug, rock, ghost, dragon, dark, steel, fairy.

## Commit Conventions

- `feat(scope): description` - new feature
- `fix(scope): description` - bug fix
- `refactor(scope): description` - code restructuring
- `test(scope): description` - adding tests
- `chore(scope): description` - maintenance
- Scopes: `pipeline`, `transform`, `dashboard`, `data`, `deploy`
