# Pokemon Dashboard — Cyberpunk Pokedex

## TL;DR

> **Quick Summary**: Build a creative, beautiful, sleek cyberpunk-themed Pokemon dashboard for real fans. dlt pipeline fetches 6 PokeAPI endpoints with parallel transformers → DuckDB → dbt-duckdb curated models → exported .db served to Next.js dashboard via DuckDB WASM → deployed on Vercel. All 8 features: Pokedex Browser, Type Matchup Calculator, Team Builder, Stat Radar Charts, Evolution Visualizer, Move Explorer, Ability Explorer, "Who's That Pokemon?" Quiz.
> 
> **Deliverables**:
> - Monorepo with Just + uv + pnpm orchestration
> - dlt pipeline (6 PokeAPI endpoints, transformer pattern, parallel loading)
> - dbt-duckdb transformation layer (curated models for type matchups, evolution trees, enriched data)
> - Next.js dashboard with DuckDB WASM (8 feature pages, cyberpunk design system)
> - Vercel deployment configuration
> - Test suites (pipeline + dashboard)
> 
> **Estimated Effort**: XL (8 features, polyglot monorepo, full-stack data app)
> **Parallel Execution**: YES - 5 waves
> **Critical Path**: Monorepo scaffold → dlt pipeline → dbt models → DuckDB export → Design system → Dashboard features → Integration → Deploy

---

## Context

### Original Request
Build a Pokemon dashboard that is fun, interesting, and practical for actual Pokemon lovers. Must be monorepo designed. Use dlt with transformers pattern from https://dlthub.com/docs/examples/transformers. Load data from PokeAPI via https://dlthub.com/context/source/pokemon-api. Load to DuckDB.

### Interview Summary
**Key Discussions**:
- Features: ALL 8 selected — Pokedex Browser, Type Matchup Calculator, Team Builder + Coverage, Stat Comparison Radar Charts, Evolution Chain Visualizer, Move Set Explorer, Ability Explorer, "Who's That Pokemon?" Quiz
- Visual design: Futuristic cyberpunk Pokedex — dark mode, glowing type-colored accents, glassmorphism, animated stat bars, particle effects
- Frontend: Next.js + DuckDB WASM (fully client-side, zero server cost)
- Pipeline: dlt with @dlt.transformer + @dlt.defer for parallel fetching, full refresh only
- Transformation: dbt-duckdb between raw and curated
- Monorepo: Just + uv workspaces + pnpm workspaces
- Test strategy: Tests after implementation
- Deployment: Vercel (static + DuckDB .db as static asset)

**Research Findings**:
- dlt Transformers: @dlt.transformer + @dlt.defer for parallel, pipe operator |, selected=False for intermediate, `from dlt.sources.helpers import requests` with auto-retries
- PokeAPI: 6 endpoints, no auth, base URL https://pokeapi.co/api/v2/
- RESTAPIConfig: Declarative endpoint setup with `rest_api_resources()`
- DuckDB WASM: Downloads entire .db file, ~2GB practical limit, ATTACH pattern for loading pre-built files
- Vercel: 100MB static asset limit (Hobby), 1GB (Pro) — .db file must stay small
- Next.js + DuckDB WASM: Turbopack hangs, SSR issues — must use client-only components, Pages Router may be safer

### Metis Review
**Identified Gaps** (addressed):
- Vercel 100MB static asset limit: First page only (20 Pokemon × 6 endpoints ≈ 2-5MB .db file — well under limit)
- DuckDB WASM downloads entire file: Acceptable for small dataset (~5MB), add loading indicator
- Next.js + DuckDB WASM SSR issues: Use "use client" directive, Pages Router, dynamic import with ssr:false
- No progressive loading: Acceptable trade-off for small dataset
- Pokemon sprites/images: Serve from PokeAPI CDN directly (not stored in .db), use next/image with remote patterns

---

## Work Objectives

### Core Objective
Build a stunning cyberpunk-themed Pokemon dashboard that real fans love, powered by a dlt→DuckDB→dbt data pipeline, served client-side via DuckDB WASM, and deployed on Vercel.

### Concrete Deliverables
- `pokemon-dlt-pipeline/` — dlt Python package with 6 PokeAPI endpoints, transformer pattern
- `pokemon-dbt-pipeline/` — dbt-duckdb project with curated models
- `pokemon-dashboard-app/` — Next.js app with 8 feature pages, DuckDB WASM, cyberpunk design
- `justfile` — Monorepo task orchestration
- `data/` — DuckDB files (raw, curated, exported)
- Vercel deployment config

### Definition of Done
- [ ] `just pipeline` runs dlt and populates data/raw.duckdb with 6 tables
- [ ] `just transform` runs dbt and populates data/curated.duckdb with curated models
- [ ] `just export` creates data/pokemon.db for dashboard consumption
- [ ] `just dashboard` starts Next.js dev server, all 8 features work
- [ ] `just build` creates production build deployable to Vercel
- [ ] `just deploy` deploys to Vercel successfully

### Must Have
- All 6 PokeAPI endpoints loaded via dlt transformers
- dbt curated models for type matchups, evolution chains, enriched Pokemon
- DuckDB WASM queries in browser (no backend)
- All 8 dashboard features functional
- Cyberpunk design system (dark mode, type-colored glows, glassmorphism, animations)
- Monorepo with Just orchestration
- Vercel deployment working
- Test coverage for pipeline and dashboard

### Must NOT Have (Guardrails)
- No authentication/user accounts
- No backend API server
- No persistent user state (team builder selections are session-only)
- No full pagination (first 20 Pokemon per endpoint only — expandable later)
- No Docker/K8s/cloud infra beyond Vercel
- No AI-slop: excessive comments, over-abstraction, generic names, premature optimization
- No storing Pokemon images in DuckDB — use PokeAPI CDN URLs directly
- No SSR for DuckDB WASM — must be client-only
- No Turbopack — known to hang with DuckDB WASM

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** - ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: NO (new project)
- **Automated tests**: Tests After Implementation
- **Framework**: pytest (Python pipeline/dbt), Vitest + React Testing Library (dashboard)
- **Setup tasks included**: YES

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Pipeline/Python**: Bash — run pipeline, query DuckDB with SQL, assert row counts and schema
- **dbt**: Bash — run dbt, test models, assert curated data
- **Dashboard UI**: Playwright — navigate, interact, assert DOM, screenshot
- **DuckDB WASM Integration**: Playwright — verify queries execute, data renders

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — scaffolding + foundation):
├── Task 1: Monorepo scaffold (Just, uv, pnpm, .gitignore, README) [quick]
├── Task 2: dlt pipeline package scaffold + config [quick]
├── Task 3: dbt-duckdb package scaffold + profiles [quick]
├── Task 4: Next.js dashboard scaffold + DuckDB WASM integration proof-of-concept [unspecified-high]
├── Task 5: Cyberpunk design system tokens + theme [visual-engineering]
├── Task 6: Shared TypeScript types for Pokemon data [quick]
└── Task 7: DuckDB export utility script [quick]

Wave 2 (After Wave 1 — core data pipeline):
├── Task 8: dlt Pokemon resource with transformers (depends: 2) [deep]
├── Task 9: dlt Pokemon Species resource (depends: 2) [unspecified-high]
├── Task 10: dlt Type + Ability + Move resources (depends: 2) [unspecified-high]
├── Task 11: dlt Evolution Chain resource (depends: 2) [unspecified-high]
├── Task 12: dbt staging models — raw to staging (depends: 8-11, 3) [deep]
└── Task 13: DuckDB WASM query hooks + context provider (depends: 4, 6) [unspecified-high]

Wave 3 (After Wave 2 — curated models + dashboard shell):
├── Task 14: dbt curated: enriched Pokemon model (depends: 12) [deep]
├── Task 15: dbt curated: type matchup matrix model (depends: 12) [deep]
├── Task 16: dbt curated: evolution tree model (depends: 12) [deep]
├── Task 17: Dashboard layout + navigation + loading states (depends: 5, 4) [visual-engineering]
├── Task 18: DuckDB data export pipeline (depends: 14-16, 7) [quick]
└── Task 19: Pokemon image/sprite loading utilities (depends: 4) [quick]

Wave 4 (After Wave 3 — 8 feature pages, MAX PARALLEL):
├── Task 20: Pokedex Browser page (depends: 17, 13, 19) [visual-engineering]
├── Task 21: Type Matchup Calculator page (depends: 17, 13, 15) [visual-engineering]
├── Task 22: Team Builder + Coverage page (depends: 17, 13, 15) [deep]
├── Task 23: Stat Comparison Radar Charts page (depends: 17, 13, 14) [visual-engineering]
├── Task 24: Evolution Chain Visualizer page (depends: 17, 13, 16) [deep]
├── Task 25: Move Set Explorer page (depends: 17, 13, 14) [visual-engineering]
├── Task 26: Ability Explorer page (depends: 17, 13, 14) [visual-engineering]
└── Task 27: "Who's That Pokemon?" Quiz page (depends: 17, 13, 14, 19) [artistry]

Wave 5 (After Wave 4 — tests + deployment):
├── Task 28: Pipeline integration tests (depends: 8-11) [unspecified-high]
├── Task 29: dbt model tests (depends: 14-16) [unspecified-high]
├── Task 30: Dashboard component tests (depends: 20-27) [unspecified-high]
├── Task 31: DuckDB WASM integration tests (depends: 13, 20) [unspecified-high]
├── Task 32: Vercel deployment config + production build (depends: 18, 20-27) [unspecified-high]
└── Task 33: End-to-end QA — full pipeline to Vercel deploy (depends: 28-32) [deep]

Wave FINAL (After ALL tasks — 4 parallel reviews):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high + playwright)
└── Task F4: Scope fidelity check (deep)
→ Present results → Get explicit user okay

Critical Path: Task 1 → Task 2 → Task 8 → Task 12 → Task 14 → Task 18 → Task 20 → Task 32 → Task 33 → FINAL
Parallel Speedup: ~65% faster than sequential
Max Concurrent: 8 (Wave 4)
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|-----------|--------|------|
| 1 | - | 2,3,4,5,6,7 | 1 |
| 2 | 1 | 8,9,10,11 | 1 |
| 3 | 1 | 12 | 1 |
| 4 | 1 | 13,17,19 | 1 |
| 5 | 1 | 17 | 1 |
| 6 | 1 | 13 | 1 |
| 7 | 1 | 18 | 1 |
| 8 | 2 | 12 | 2 |
| 9 | 2 | 12 | 2 |
| 10 | 2 | 12 | 2 |
| 11 | 2 | 12 | 2 |
| 12 | 3,8,9,10,11 | 14,15,16 | 2 |
| 13 | 4,6 | 20-27 | 2 |
| 14 | 12 | 18,20,23,25,26,27 | 3 |
| 15 | 12 | 18,21,22 | 3 |
| 16 | 12 | 18,24 | 3 |
| 17 | 4,5 | 20-27 | 3 |
| 18 | 7,14,15,16 | 32 | 3 |
| 19 | 4 | 20,27 | 3 |
| 20 | 17,13,19 | 28,30,33 | 4 |
| 21 | 17,13,15 | 30,33 | 4 |
| 22 | 17,13,15 | 30,33 | 4 |
| 23 | 17,13,14 | 30,33 | 4 |
| 24 | 17,13,16 | 30,33 | 4 |
| 25 | 17,13,14 | 30,33 | 4 |
| 26 | 17,13,14 | 30,33 | 4 |
| 27 | 17,13,14,19 | 30,33 | 4 |
| 28 | 8,9,10,11 | 33 | 5 |
| 29 | 14,15,16 | 33 | 5 |
| 30 | 20-27 | 33 | 5 |
| 31 | 13,20 | 33 | 5 |
| 32 | 18,20-27 | 33 | 5 |
| 33 | 28,29,30,31,32 | FINAL | 5 |

### Agent Dispatch Summary

- **Wave 1**: **7** — T1-T3,T6,T7 → `quick`, T4 → `unspecified-high`, T5 → `visual-engineering`
- **Wave 2**: **6** — T8 → `deep`, T9-T11 → `unspecified-high`, T12 → `deep`, T13 → `unspecified-high`
- **Wave 3**: **6** — T14-T16 → `deep`, T17 → `visual-engineering`, T18-T19 → `quick`
- **Wave 4**: **8** — T20-T21,T23,T25-T26 → `visual-engineering`, T22,T24 → `deep`, T27 → `artistry`
- **Wave 5**: **6** — T28-T29 → `unspecified-high`, T30-T31 → `unspecified-high`, T32 → `unspecified-high`, T33 → `deep`
- **FINAL**: **4** — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [x] 1. Monorepo Scaffold — Just, uv, pnpm, .gitignore, README

  **What to do**:
  - Create monorepo directory structure:
    ```
    pokemon-dlt-dbt-pipeline/
    ├── justfile                    # Task orchestration
    ├── .gitignore                  # Python + Node + DuckDB patterns
    ├── .tool-versions             # Pin tool versions
    ├── README.md                   # Project overview
    ├── packages/
    │   ├── pipeline/              # Python dlt package
    │   │   ├── pyproject.toml
    │   │   └── pokemon_pipeline/
    │   │       ├── __init__.py
    │   │       └── sources/
    │   ├── transform/             # dbt-duckdb project
    │   │   ├── dbt_project.yml
    │   │   ├── profiles.yml
    │   │   └── models/
    │   └── dashboard/             # Next.js app
    │       ├── package.json
    │       ├── next.config.js
    │       └── src/
    ├── data/                      # DuckDB files (gitignored)
    │   ├── raw.duckdb
    │   ├── curated.duckdb
    │   └── pokemon.db            # Exported for dashboard
    └── .sisyphus/                 # Planning artifacts
    ```
  - Create `justfile` with recipes: `pipeline`, `transform`, `export`, `dashboard`, `test`, `build`, `deploy`, `clean`
  - Create root `pyproject.toml` with uv workspace config pointing to `pokemon-dlt-pipeline` and `pokemon-dbt-pipeline`
  - Create `pnpm-workspace.yaml` pointing to `pokemon-dashboard-app`
  - Update `.gitignore` with DuckDB `.duckdb`, `.wal`, `node_modules`, `.next`, `data/*.duckdb` patterns (keep `data/pokemon.db` tracked for dashboard)
  - Create `README.md` with project overview, monorepo structure, and quickstart commands

  **Must NOT do**:
  - Don't install any packages yet — just scaffolding
  - Don't create empty placeholder files beyond what's listed
  - Don't add AI-generated comments

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Directory creation and config files, no complex logic
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `git-master`: Not needed yet, no commits

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 2, 3, 4, 5, 6, 7
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `https://github.com/dlt-hub/dlt/tree/devel/docs/examples/transformers` — dlt transformer example project structure (how dlt projects are organized)
  - `https://docs.getdbt.com/best-practices/how-we-structure/1-guide-overview` — dbt project structure conventions (staging/intermediate/marts)

  **API/Type References**:
  - `https://pokeapi.co/api/v2/` — Base URL for all API endpoints

  **External References**:
  - `https://duckdb.org/docs/api/wasm/overview` — DuckDB WASM overview for understanding client architecture
  - `https://vercel.com/docs/limits` — Vercel static asset size limits (100MB Hobby, 1GB Pro)

  **WHY Each Reference Matters**:
  - dlt transformer example: Shows the canonical dlt project layout — `pokemon_pipeline/` as Python package
  - dbt structure guide: Defines the staging → intermediate → marts convention our dbt project must follow
  - PokeAPI base URL: Confirms endpoint paths for pipeline configuration
  - Vercel limits: Validates our .db file sizing constraint

  **Acceptance Criteria**:
  - [ ] `just --list` shows all recipes (pipeline, transform, export, dashboard, test, build, deploy, clean)
  - [ ] `ls packages/` shows pipeline/, transform/, dashboard/
  - [ ] `cat pyproject.toml` contains uv workspace config
  - [ ] `cat pnpm-workspace.yaml` points to pokemon-dashboard-app
  - [ ] `.gitignore` contains *.duckdb, *.wal, node_modules, .next patterns

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Monorepo structure is valid
    Tool: Bash
    Preconditions: Fresh checkout
    Steps:
      1. Run `just --list` and verify 8+ recipes appear
      2. Run `ls -la pokemon-dlt-pipeline pokemon-dbt-pipeline pokemon-dashboard-app` — all 3 exist
      3. Run `cat pyproject.toml | grep -A5 tool.uv.workspace` — contains members list
      4. Run `cat pnpm-workspace.yaml` — contains pokemon-dashboard-app
      5. Run `cat .gitignore | grep duckdb` — *.duckdb pattern present
    Expected Result: All checks pass, structure is complete
    Failure Indicators: Missing directories, empty config files, no justfile recipes
    Evidence: .sisyphus/evidence/task-1-monorepo-structure.txt

  Scenario: DuckDB files are gitignored but pokemon.db is tracked
    Tool: Bash
    Preconditions: Monorepo scaffolded
    Steps:
      1. Run `touch data/raw.duckdb data/curated.duckdb data/pokemon.db`
      2. Run `git status --short data/` — raw.duckdb and curated.duckdb should NOT appear, pokemon.db SHOULD appear
    Expected Result: Only pokemon.db tracked by git
    Failure Indicators: .duckdb files showing in git status
    Evidence: .sisyphus/evidence/task-1-gitignore-check.txt
  ```

  **Commit**: YES
  - Message: `feat(scaffold): initialize monorepo structure with Just, uv, pnpm`
  - Files: `justfile, pyproject.toml, pnpm-workspace.yaml, .gitignore, README.md, packages/*/`
  - Pre-commit: none

- [x] 2. dlt Pipeline Package Scaffold + Config

  **What to do**:
  - Create `pokemon-dlt-pipeline/pyproject.toml` with dependencies: `dlt[duckdb]`, `requests`
  - Create `pokemon-dlt-pipeline/pokemon_pipeline/__init__.py` with pipeline factory function
  - Create `pokemon-dlt-pipeline/pokemon_pipeline/sources/__init__.py`
  - Create `pokemon-dlt-pipeline/pokemon_pipeline/sources/pokemon_api.py` with RESTAPIConfig skeleton (6 endpoints declared but no transformer logic yet)
  - Create `pokemon-dlt-pipeline/.dlt/config.toml` with parallelism config:
    ```toml
    [pipeline]
    workers = 5
    
    [normalize]
    workers = 3
    ```
  - Create `pokemon-dlt-pipeline/pokemon_pipeline/pipeline.py` with `create_pipeline()` that sets up DuckDB destination pointing to `data/raw.duckdb`, dataset_name `raw_data` (NOT `pokemon` to avoid DuckDB binder error)
  - Verify `uv sync` works in pokemon-dlt-pipeline/

  **Must NOT do**:
  - Don't implement the actual transformer logic yet (that's Task 8-11)
  - Don't name the dataset same as the database ("pokemon") — causes DuckDB Binder Error
  - Don't hardcode API URLs — use config.toml

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Package scaffold with config files, no complex implementation
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Tasks 8, 9, 10, 11
  - **Blocked By**: Task 1 (needs directory structure)

  **References**:

  **Pattern References**:
  - `https://github.com/dlt-hub/dlt/tree/devel/docs/examples/transformers` — Full source code showing `@dlt.source`, `@dlt.resource`, `@dlt.transformer`, `@dlt.defer`, pipe `|` operator, `selected=False`
  - `https://dlthub.com/context/source/pokemon-api` — RESTAPIConfig pattern with `rest_api_resources()`, endpoint definitions, data selectors

  **API/Type References**:
  - PokeAPI endpoints: `pokemon`, `pokemon-species`, `type`, `ability`, `evolution-chain`, `move` — all use `data_selector: "results"`

  **External References**:
  - `https://dlthub.com/docs/reference/performance#parallel-pipeline-config-example` — Config.toml parallelism settings

  **WHY Each Reference Matters**:
  - dlt transformers example: Shows exact decorator patterns and pipeline setup we must replicate
  - Pokemon API context: RESTAPIConfig is the alternative approach — we'll use transformers pattern but declare endpoints in config
  - Performance docs: Gives exact config.toml syntax for parallel execution

  **Acceptance Criteria**:
  - [x] `uv sync` succeeds in pokemon-dlt-pipeline/
  - [x] `python -c "from pokemon_pipeline import create_pipeline"` works
  - [x] `cat pokemon-dlt-pipeline/.dlt/config.toml` contains [pipeline] workers config
  - [x] pyproject.toml lists dlt[duckdb] dependency

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Pipeline package is importable
    Tool: Bash
    Preconditions: Task 1 complete, uv sync run
    Steps:
      1. Run `cd pokemon-dlt-pipeline && uv sync` — should succeed with no errors
      2. Run `cd pokemon-dlt-pipeline && uv run python -c "from pokemon_pipeline import create_pipeline; print('OK')"` — should print OK
      3. Run `cat pokemon-dlt-pipeline/.dlt/config.toml | grep workers` — should show workers = 5
    Expected Result: Package imports correctly, config has parallelism settings
    Failure Indicators: Import errors, missing config, uv sync failures
    Evidence: .sisyphus/evidence/task-2-pipeline-scaffold.txt
  ```

  **Commit**: YES (groups with Task 1)
  - Message: `feat(scaffold): initialize monorepo structure with Just, uv, pnpm`
  - Files: `pokemon-dlt-pipeline/`

- [x] 3. dbt-duckdb Package Scaffold + Profiles

  **What to do**:
  - Create `pokemon-dbt-pipeline/dbt_project.yml`:
    ```yaml
    name: pokemon_transforms
    version: '1.0.0'
    config-version: 2
    profile: pokemon_dbt
    model-paths: ["models"]
    seed-paths: ["seeds"]
    test-paths: ["tests"]
    models:
      pokemon_transforms:
        staging:
          +materialized: view
          +schema: raw_data
        intermediate:
          +materialized: table
        marts:
          +materialized: table
    ```
  - Create `pokemon-dbt-pipeline/profiles.yml` pointing to `data/raw.duckdb`:
    ```yaml
    pokemon_dbt:
      target: dev
      outputs:
        dev:
          type: duckdb
          path: '../../data/raw.duckdb'
          schema: raw_data
          threads: 4
    ```
  - Create directory structure: `models/staging/`, `models/intermediate/`, `models/marts/`, `models/python/`, `seeds/`, `tests/`, `macros/`
  - Create `pokemon-dbt-pipeline/seeds/type_effectiveness.csv` — the Pokemon type matchup chart (18×18 matrix) as static seed data since PokeAPI doesn't provide this directly
  - Add `dbt-duckdb` to transform pyproject.toml dependencies
  - Verify `dbt debug` passes

  **Must NOT do**:
  - Don't create model SQL files yet (Tasks 12, 14-16)
  - Don't use `:memory:` — data must persist
  - Don't name dataset same as database name

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Config files and directory creation
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Task 12
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `https://docs.getdbt.com/best-practices/how-we-structure/1-guide-overview` — Canonical dbt project structure with staging/intermediate/marts layers

  **API/Type References**:
  - `https://pokeapi.co/api/v2/type/{id}` — Type endpoint returns damage_relations with half_damage_to, double_damage_to, etc. — but NOT a flat matrix. We need the seed data.

  **External References**:
  - `https://github.com/duckdb/dbt-duckdb` — dbt-duckdb README with profiles.yml syntax
  - `https://docs.getdbt.com/docs/core/connect-data-platform/duckdb-setup` — DuckDB connection setup

  **WHY Each Reference Matters**:
  - dbt structure guide: Our project MUST follow staging/intermediate/marts convention
  - dbt-duckdb README: Exact profiles.yml configuration with path, schema, threads
  - PokeAPI type endpoint: Understanding what data the API provides vs what we need to seed (the matchup matrix)

  **Acceptance Criteria**:
  - [x] `dbt debug` passes in pokemon-dbt-pipeline/
  - [x] `ls models/staging models/intermediate models/marts` all exist
  - [x] `cat profiles.yml` points to ../../data/raw.duckdb with schema raw_data
  - [x] `cat seeds/type_effectiveness.csv` has 18 type rows with effectiveness values

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: dbt project is valid
    Tool: Bash
    Preconditions: Task 1+3 complete, duckdb package installed
    Steps:
      1. Run `cd pokemon-dbt-pipeline && uv run dbt debug` — should show "All checks passed"
      2. Run `ls pokemon-dbt-pipeline/models/staging pokemon-dbt-pipeline/models/intermediate pokemon-dbt-pipeline/models/marts` — all directories exist
      3. Run `wc -l pokemon-dbt-pipeline/seeds/type_effectiveness.csv` — should have 18+ rows (header + 18 types)
    Expected Result: dbt debug passes, structure complete, seed data present
    Failure Indicators: dbt debug fails, missing directories, empty seed file
    Evidence: .sisyphus/evidence/task-3-dbt-scaffold.txt
  ```

  **Commit**: YES (groups with Task 1)
  - Files: `pokemon-dbt-pipeline/`

- [x] 4. Next.js Dashboard Scaffold + DuckDB WASM Proof-of-Concept

  **What to do**:
  - Create Next.js app in `pokemon-dashboard-app/` using `npx create-next-app@latest` with:
    - App Router
    - TypeScript
    - Tailwind CSS
    - NO Turbopack (use `--webpack` flag)
  - Configure `next.config.js`:
    ```js
    /** @type {import('next').NextConfig} */
    const nextConfig = {
      serverExternalPackages: ["@duckdb/duckdb-wasm"],
      webpack: (config) => {
        // Ensure WASM files are handled correctly
        config.experiments.asyncWebAssembly = true;
        return config;
      },
    };
    module.exports = nextConfig;
    ```
  - Install `@duckdb/duckdb-wasm` dependency
  - Create `pokemon-dashboard-app/src/lib/duckdb.ts` — DuckDB WASM initialization module:
    - Uses `getJsDelivrBundles()` + `selectBundle()` pattern
    - Creates Web Worker via Blob URL
    - `registerFileBuffer` pattern: fetch `/pokemon.db` → buffer → `ATTACH` as read_only
    - Exports singleton `getDB()` and `getConnection()` functions
  - Create `pokemon-dashboard-app/src/app/DuckDBProvider.tsx`:
    - `'use client'` directive
    - React context providing DuckDB connection
    - Loading state while WASM instantiates + DB file fetches
    - Error state for initialization failures
  - Create proof-of-concept page `pokemon-dashboard-app/src/app/page.tsx`:
    - Dynamic import DuckDBProvider with `{ ssr: false }`
    - Run `SELECT COUNT(*) FROM raw_data.pokemon` and display the count
    - Show "DuckDB WASM Connected! X Pokemon loaded" on success
  - Verify `pnpm dev --webpack` works and PoC page renders with data

  **Must NOT do**:
  - Don't use Turbopack — it hangs on WASM files
  - Don't use SSR for any DuckDB components — client-only
  - Don't use `ATTACH 'http://...'` — use `registerFileBuffer` to avoid CORS/httpfs issues
  - Don't use Pages Router — App Router with `'use client'` works

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: DuckDB WASM + Next.js integration has known gotchas (Turbopack, SSR, worker setup) — requires careful implementation
  - **Skills**: [`/frontend-ui-ux`]
    - `/frontend-ui-ux`: Next.js + React context patterns, component architecture
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed for scaffold, only for QA

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 13, 17, 19
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - DuckDB WASM `registerFileBuffer` pattern: fetch .db → Uint8Array → `db.registerFileBuffer('pokemon.db', buffer)` → `conn.query("ATTACH 'pokemon.db' AS pokemon_db (READ_ONLY)")`
  - DuckDBProvider with `'use client'` + `dynamic(() => import(...), { ssr: false })` pattern

  **API/Type References**:
  - `@duckdb/duckdb-wasm` API: `AsyncDuckDB`, `ConsoleLogger`, `getJsDelivrBundles()`, `selectBundle()`, `registerFileBuffer()`, `connect()`

  **External References**:
  - `https://github.com/vercel/next.js/discussions/57819` — Confirmed DuckDB WASM + Next.js App Router integration pattern
  - `https://github.com/vercel/next.js/issues/78591` — Turbopack hangs on WASM, must use `--webpack`
  - `https://duckdb.org/docs/api/wasm/overview` — DuckDB WASM official docs

  **WHY Each Reference Matters**:
  - registerFileBuffer: This is the CORRECT pattern for loading static .db in browser — avoids CORS/httpfs issues
  - Next.js discussion #57819: Documents the exact workaround (serverExternalPackages + ssr:false)
  - Turbopack issue: CRITICAL — must use --webpack or build will hang forever

  **Acceptance Criteria**:
  - [x] `pnpm install` succeeds in pokemon-dashboard-app/
  - [x] `pnpm dev --webpack` starts without errors
  - [x] `cat next.config.js` contains serverExternalPackages with duckdb-wasm
  - [x] DuckDBProvider.tsx has `'use client'` directive
  - [x] Dev server starts at http://localhost:3000

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Next.js + DuckDB WASM dev server starts
    Tool: Bash (interactive_bash / tmux)
    Preconditions: Task 1+4 complete, pnpm install done
    Steps:
      1. Run `cd pokemon-dashboard-app && pnpm dev --webpack` in tmux
      2. Wait 10 seconds for server startup
      3. Run `curl -s http://localhost:3000 | head -20` — should return HTML
      4. Check tmux output for any WASM-related errors
    Expected Result: Dev server starts, no WASM errors in console, page loads
    Failure Indicators: Server crash, "worker terminated" error, Turbopack hang
    Evidence: .sisyphus/evidence/task-4-nextjs-duckdb-poc.txt

  Scenario: DuckDB WASM PoC page renders without SSR errors
    Tool: Playwright
    Preconditions: Dev server running, pokemon.db exists in public/
    Steps:
      1. Navigate to http://localhost:3000
      2. Wait for text "DuckDB WASM Connected" (timeout: 15s — WASM init takes time)
      3. Assert page contains "Pokemon loaded"
    Expected Result: DuckDB initializes client-side, query returns count
    Failure Indicators: "worker terminated" error, hydration mismatch, blank page
    Evidence: .sisyphus/evidence/task-4-duckdb-poc-screenshot.png
  ```

  **Commit**: YES
  - Message: `feat(dashboard): scaffold Next.js with DuckDB WASM proof-of-concept`
  - Files: `pokemon-dashboard-app/`

- [x] 5. Cyberpunk Design System Tokens + Theme

  **What to do**:
  - Create `pokemon-dashboard-app/src/lib/design-tokens.ts` — design token definitions:
    - **Color palette**: Deep dark background (#0a0a1a), card backgrounds (#1a1a2e), surface (#2a2a4a)
    - **Type colors** (18 Pokemon types with neon glow variants): Fire (#ff6b35), Water (#3b82f6), Grass (#22c55e), Electric (#facc15), Psychic (#ec4899), Ice (#67e8f9), Dragon (#8b5cf6), Dark (#6b7280), Fairy (#f472b6), Fighting (#ef4444), Ghost (#a855f7), Steel (#94a3b8), Flying (#93c5fd), Poison (#a855f7), Ground (#d97706), Rock (#a16207), Bug (#84cc16), Normal (#d1d5db)
    - **Typography**: Pixel/monospace headers (JetBrains Mono or Press Start 2P), clean sans-serif body (Inter)
    - **Spacing scale**: 4px base unit
    - **Border radius**: sm(4px), md(8px), lg(16px), full(9999px)
    - **Animation durations**: fast(150ms), normal(300ms), slow(500ms)
    - **Glassmorphism**: `backdrop-blur-md bg-white/5 border border-white/10`
    - **Glow effects**: `shadow-[0_0_15px_var(--type-color)]` pattern
  - Create `pokemon-dashboard-app/tailwind.config.ts` extending Tailwind with:
    - Custom colors from design tokens
    - Custom fontFamily (pixel + sans)
    - Custom boxShadow (type glows)
    - Custom animation keyframes (pulse-glow, slide-in, fade-in)
  - Create `pokemon-dashboard-app/src/app/globals.css` with:
    - Dark mode as default (no toggle needed)
    - CSS custom properties for type colors (--type-fire, --type-water, etc.)
    - Glassmorphism utility classes
    - Glow animation keyframes
    - Scrollbar styling for cyberpunk feel
  - Create `pokemon-dashboard-app/src/components/ui/` directory with base components:
    - `Card.tsx` — Glassmorphism card with optional type-colored border glow
    - `Badge.tsx` — Type badge with background color + glow
    - `Button.tsx` — Cyberpunk styled button with hover glow
    - `LoadingSpinner.tsx` — Pokedex-style loading animation
  - Add Google Fonts (Press Start 2P + Inter) via `next/font`

  **Must NOT do**:
  - Don't use light mode — dark cyberpunk only
  - Don't use generic Tailwind defaults — everything custom themed
  - Don't add shadcn/ui or component libraries — build custom to match cyberpunk aesthetic
  - Don't add excessive animations that hurt performance

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Pure design system work — CSS, tokens, theming, component visual design
  - **Skills**: [`/frontend-ui-ux`]
    - `/frontend-ui-ux`: Design system creation, component styling, visual polish
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed for design tokens

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Task 17 (layout needs design system)
  - **Blocked By**: Task 1

  **References**:

  **External References**:
  - `https://bulbapedia.bulbagarden.net/wiki/Type` — Official Pokemon type color associations
  - `https://fonts.google.com/specimen/Press+Start+2P` — Pixel font for headers
  - `https://fonts.google.com/specimen/Inter` — Clean body font

  **WHY Each Reference Matters**:
  - Pokemon type colors: Must match official type associations fans recognize
  - Press Start 2P: The iconic pixel font for retro Pokemon feel in headers
  - Inter: Clean, modern readability for data display

  **Acceptance Criteria**:
  - [x] `cat tailwind.config.ts` contains custom colors for all 18 types
  - [x] `cat globals.css` has CSS custom properties for --type-fire through --type-fairy
  - [x] Card, Badge, Button, LoadingSpinner components created
  - [x] Glassmorphism effect visible (blur + semi-transparent bg)

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Design system components render correctly
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Create a test route at /design-test that renders Card, Badge (all 18 types), Button, LoadingSpinner
      2. Navigate to http://localhost:3000/design-test
      3. Screenshot the page
      4. Assert all 18 type badges are visible with distinct colors
      5. Assert Card has glassmorphism effect (semi-transparent background)
    Expected Result: All components render, type colors are distinct, glassmorphism visible
    Failure Indicators: Missing components, identical colors, no blur/transparency
    Evidence: .sisyphus/evidence/task-5-design-system-screenshot.png
  ```

  **Commit**: YES
  - Message: `feat(dashboard): add cyberpunk design system with type-colored tokens and components`
  - Files: `pokemon-dashboard-app/src/lib/design-tokens.ts, tailwind.config.ts, globals.css, src/components/ui/`

- [x] 6. Shared TypeScript Types for Pokemon Data

  **What to do**:
  - Create `pokemon-dashboard-app/src/lib/types/pokemon.ts` with TypeScript interfaces matching PokeAPI response shapes:
    ```typescript
    // Core Pokemon type from PokeAPI
    interface Pokemon {
      id: number;
      name: string;
      sprites: { front_default: string; other: { official: { front_default: string } } };
      types: { type: { name: string; url: string } }[];
      stats: { base_stat: number; stat: { name: string } }[];
      abilities: { ability: { name: string; url: string }; is_hidden: boolean }[];
      moves: { move: { name: string; url: string } }[];
      height: number;
      weight: number;
      species: { name: string; url: string };
    }

    interface PokemonSpecies {
      id: number;
      name: string;
      evolution_chain: { url: string };
      flavor_text_entries: { flavor_text: string; language: { name: string } }[];
      genera: { genus: string; language: { name: string } }[];
      habitat: { name: string } | null;
      color: { name: string };
      capture_rate: number;
      base_happiness: number;
    }

    interface Type {
      id: number;
      name: string;
      damage_relations: {
        double_damage_to: { name: string }[];
        half_damage_to: { name: string }[];
        no_damage_to: { name: string }[];
        double_damage_from: { name: string }[];
        half_damage_from: { name: string }[];
        no_damage_from: { name: string }[];
      };
      pokemon: { pokemon: { name: string; url: string }; slot: number }[];
      moves: { name: string; url: string }[];
    }

    interface Ability {
      id: number;
      name: string;
      effect_entries: { effect: string; short_effect: string; language: { name: string } }[];
      pokemon: { pokemon: { name: string; url: string }; is_hidden: boolean }[];
    }

    interface Move {
      id: number;
      name: string;
      type: { name: string };
      damage_class: { name: string }; // physical, special, status
      power: number | null;
      accuracy: number | null;
      pp: number;
      effect_entries: { effect: string; short_effect: string }[];
      learned_by_pokemon: { name: string; url: string }[];
    }

    interface EvolutionChain {
      id: number;
      chain: EvolutionChainLink;
    }

    interface EvolutionChainLink {
      species: { name: string; url: string };
      evolution_details: { trigger: { name: string }; min_level: number | null; item: { name: string } | null }[];
      evolves_to: EvolutionChainLink[];
    }

    // Curated/enriched types from dbt
    interface EnrichedPokemon extends Pokemon {
      species_data: PokemonSpecies;
      type_names: string[];
      flavor_text: string;
      genus: string;
    }

    interface TypeMatchup {
      attacking_type: string;
      defending_type: string;
      effectiveness: number; // 0, 0.25, 0.5, 1, 2, 4
    }

    interface TeamCoverage {
      types_covered: string[];
      types_weak_to: string[];
      coverage_percent: number;
    }
    ```
  - Create `pokemon-dashboard-app/src/lib/types/index.ts` barrel export
  - These types are used by both DuckDB query result parsing and UI components

  **Must NOT do**:
  - Don't use `any` types
  - Don't add Zod validation yet (can be added later if needed)
  - Don't duplicate types between files

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Pure type definitions, no logic
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Task 13 (query hooks need types)
  - **Blocked By**: Task 1

  **References**:

  **API/Type References**:
  - `https://pokeapi.co/api/v2/pokemon/1` — Full Pokemon response JSON structure
  - `https://pokeapi.co/api/v2/pokemon-species/1` — Species response shape
  - `https://pokeapi.co/api/v2/type/1` — Type response with damage_relations
  - `https://pokeapi.co/api/v2/ability/1` — Ability response
  - `https://pokeapi.co/api/v2/move/1` — Move response
  - `https://pokeapi.co/api/v2/evolution-chain/1` — Evolution chain nested structure

  **WHY Each Reference Matters**:
  - Each endpoint's actual JSON response is the ground truth for our type definitions — we must match exactly what PokeAPI returns

  **Acceptance Criteria**:
  - [ ] TypeScript compilation passes with no errors for types file
  - [ ] All 6 PokeAPI entity types defined (Pokemon, Species, Type, Ability, Move, EvolutionChain)
  - [ ] Curated types defined (EnrichedPokemon, TypeMatchup, TeamCoverage)
  - [ ] No `any` types used

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: TypeScript types compile without errors
    Tool: Bash
    Preconditions: Task 1+6 complete
    Steps:
      1. Run `cd pokemon-dashboard-app && pnpm exec tsc --noEmit src/lib/types/pokemon.ts`
      2. Assert exit code 0, no type errors
    Expected Result: Clean compilation, zero errors
    Failure Indicators: Type errors, missing properties, any usage
    Evidence: .sisyphus/evidence/task-6-types-compile.txt
  ```

  **Commit**: YES (groups with Task 4)
  - Message: `feat(dashboard): add Pokemon TypeScript types and DuckDB WASM scaffold`
  - Files: `pokemon-dashboard-app/src/lib/types/`

- [x] 7. DuckDB Export Utility Script

  **What to do**:
  - Create `pokemon-dlt-pipeline/pokemon_pipeline/export.py`:
    - Opens both `data/raw.duckdb` and `data/curated.duckdb` via DuckDB ATTACH
    - Creates a clean export database at `data/pokemon.db` containing:
      - All curated/marts tables from curated.duckdb (the useful ones)
      - Selected raw tables needed for image URLs (pokemon sprites)
    - Runs `COPY TO` or creates a fresh DuckDB file with only the tables the dashboard needs
    - Outputs file size and table summary
    - Validates file is < 100MB (Vercel limit)
  - Add `just export` recipe to justfile:
    ```just
    export: pipeline transform
      cd pokemon-dlt-pipeline && uv run python -m pokemon_pipeline.export
      @echo "Exported data/pokemon.db ($(du -h data/pokemon.db | cut -f1))"
    ```
  - Copy `data/pokemon.db` to `pokemon-dashboard-app/public/pokemon.db` as part of export
  - Add `data/pokemon.db` to git LFS or track directly (small file, ~5MB)

  **Must NOT do**:
  - Don't export raw staging tables — only curated ones useful for dashboard
  - Don't include the full raw.duckdb (it has dlt metadata the dashboard doesn't need)
  - Don't hardcode table names — discover them from the curated schema

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple Python script using DuckDB ATTACH + COPY
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Task 18 (full export pipeline)
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - DuckDB `ATTACH` + `COPY` pattern for database-to-database export

  **External References**:
  - `https://duckdb.org/docs/sql/statements/attach` — ATTACH syntax for connecting to multiple databases
  - `https://duckdb.org/docs/sql/statements/copy` — COPY TO for exporting tables

  **WHY Each Reference Matters**:
  - ATTACH: How to connect to both raw and curated DuckDB files simultaneously
  - COPY: How to export specific tables to a new database file

  **Acceptance Criteria**:
  - [ ] `python -m pokemon_pipeline.export --help` shows usage
  - [ ] Script creates `data/pokemon.db` (will be empty until pipeline runs, but script runs without error)
  - [ ] Script validates output file < 100MB

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Export script runs without errors on empty databases
    Tool: Bash
    Preconditions: Task 1+7 complete
    Steps:
      1. Run `cd pokemon-dlt-pipeline && uv run python -m pokemon_pipeline.export --dry-run`
      2. Assert exit code 0
      3. Verify script handles missing/empty databases gracefully
    Expected Result: Script runs, handles empty state, no crashes
    Failure Indicators: Unhandled exceptions on empty databases
    Evidence: .sisyphus/evidence/task-7-export-script.txt
  ```

  **Commit**: YES (groups with Task 1)
  - Message: `feat(scaffold): initialize monorepo structure with Just, uv, pnpm`
  - Files: `pokemon-dlt-pipeline/pokemon_pipeline/export.py, justfile`

- [x] 8. dlt Pokemon Resource with Transformers

  **What to do**:
  - Implement `pokemon-dlt-pipeline/pokemon_pipeline/sources/pokemon_api.py` — the core dlt source:
    ```python
    import dlt
    from dlt.sources.helpers import requests  # auto-retry requests
    
    POKEMON_API_URL = "https://pokeapi.co/api/v2"
    
    @dlt.source(max_table_nesting=2)
    def pokemon_source(api_url: str = POKEMON_API_URL):
        @dlt.resource(write_disposition="replace", selected=False)
        def pokemon_list():
            """First page of Pokemon — NOT loaded, used as input to transformers"""
            yield requests.get(f"{api_url}/pokemon").json()["results"]
        
        @dlt.transformer
        def pokemon_details(pokemons):
            """Fetch Pokemon details in parallel using @dlt.defer"""
            @dlt.defer
            def _get_pokemon(p):
                return requests.get(p["url"]).json()
            
            for p in pokemons:
                yield _get_pokemon(p)
        
        @dlt.transformer(parallelized=True)
        def pokemon_species(pokemon_details):
            """Fetch species details for each Pokemon"""
            species_data = requests.get(pokemon_details["species"]["url"]).json()
            species_data["pokemon_id"] = pokemon_details["id"]
            return species_data
        
        return (
            pokemon_list | pokemon_details,
            pokemon_list | pokemon_details | pokemon_species,
        )
    ```
  - Wire into pipeline.py: `pipeline.run(pokemon_source())`
  - Test run: `just pipeline` should create `pokemon` and `pokemon_species` tables in `data/raw.duckdb` with 20 rows each
  - Verify `pokemon_list` table does NOT exist (selected=False)

  **Must NOT do**:
  - Don't paginate beyond first page — scope is first 20 Pokemon only
  - Don't use bare `requests` — use `from dlt.sources.helpers import requests` for auto-retries
  - Don't load `pokemon_list` into the database (selected=False)

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Core pipeline logic with dlt transformer patterns — needs understanding of @dlt.defer, pipe operator, and parallel execution
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 9-13)
  - **Blocks**: Task 12 (dbt staging needs this data)
  - **Blocked By**: Task 2

  **References**:

  **Pattern References**:
  - `https://github.com/dlt-hub/dlt/tree/devel/docs/examples/transformers` — EXACT code pattern to follow: `@dlt.source`, `@dlt.resource(selected=False)`, `@dlt.transformer`, `@dlt.defer`, pipe `|` operator
  - The full source code in this example IS our reference implementation

  **API/Type References**:
  - `https://pokeapi.co/api/v2/pokemon` — Returns `{"results": [{"name": "bulbasaur", "url": "..."}]}` — first page
  - `https://pokeapi.co/api/v2/pokemon/1` — Full Pokemon detail response (stats, types, sprites, abilities, moves)

  **External References**:
  - `https://dlthub.com/docs/general-usage/resource#process-resources-with-dlttransformer` — Transformer documentation
  - `https://dlthub.com/docs/reference/performance#parallelism-within-a-pipeline` — @dlt.defer and parallel config

  **WHY Each Reference Matters**:
  - dlt transformers example: This is our EXACT blueprint — the code structure, decorator usage, and pipe operator pattern
  - PokeAPI responses: Must match actual JSON shapes for correct data extraction
  - Transformer docs: Understanding how @dlt.transformer processes data from parent resource

  **Acceptance Criteria**:
  - [x] `just pipeline` runs without errors
  - [x] `duckdb data/raw.duckdb "SELECT COUNT(*) FROM raw_data.pokemon"` returns 20
  - [x] `duckdb data/raw.duckdb "SELECT COUNT(*) FROM raw_data.pokemon_species"` returns 20
  - [x] `duckdb data/raw.duckdb "SELECT name FROM raw_data.pokemon LIMIT 3"` returns bulbasaur, ivysaur, venusaur
  - [x] Table `pokemon_list` does NOT exist in raw_data schema

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Pipeline loads Pokemon data correctly
    Tool: Bash
    Preconditions: Task 1-2 complete, no prior data
    Steps:
      1. Run `just pipeline`
      2. Run `duckdb data/raw.duckdb "SELECT COUNT(*) as cnt FROM raw_data.pokemon"` — expect 20
      3. Run `duckdb data/raw.duckdb "SELECT COUNT(*) as cnt FROM raw_data.pokemon_species"` — expect 20
      4. Run `duckdb data/raw.duckdb "SELECT name FROM raw_data.pokemon ORDER BY id LIMIT 1"` — expect "bulbasaur"
      5. Run `duckdb data/raw.duckdb "SELECT table_name FROM information_schema.tables WHERE table_schema='raw_data' AND table_name='pokemon_list'"` — expect empty (not loaded)
    Expected Result: 20 Pokemon + 20 Species loaded, pokemon_list NOT in database
    Failure Indicators: 0 rows, missing tables, pokemon_list exists, import errors
    Evidence: .sisyphus/evidence/task-8-pokemon-pipeline.txt

  Scenario: Pipeline handles API errors gracefully
    Tool: Bash
    Preconditions: Pipeline configured
    Steps:
      1. Temporarily set invalid API URL in config
      2. Run pipeline — should fail with clear error, not hang
      3. Reset URL and re-run — should succeed
    Expected Result: Graceful failure on bad URL, recovery on fix
    Failure Indicators: Infinite hang, unclear error message
    Evidence: .sisyphus/evidence/task-8-error-handling.txt
  ```

  **Commit**: YES
  - Message: `feat(pipeline): add Pokemon and Species resources with dlt transformers`
  - Files: `pokemon-dlt-pipeline/pokemon_pipeline/sources/pokemon_api.py, pokemon-dlt-pipeline/pokemon_pipeline/pipeline.py`

- [x] 9. dlt Pokemon Species Resource (Enhanced)

  **What to do**:
  - Add Species-specific transformer to the pokemon_api source:
    - Species data includes: evolution_chain URL, flavor_text, genera, habitat, color, capture_rate
    - The `pokemon_species` transformer already defined in Task 8 gets enhanced here
  - Ensure Species data links back to Pokemon via `pokemon_id` field
  - Add Evolution Chain resource:
    ```python
    @dlt.resource(write_disposition="replace", selected=False)
    def evolution_chain_list():
        """List evolution chains from species data"""
        # We already have species URLs from pokemon_species
        # Extract unique evolution_chain URLs
        yield requests.get(f"{api_url}/evolution-chain").json()["results"]
    
    @dlt.transformer(parallelized=True)
    def evolution_chains(chain_list):
        """Fetch evolution chain details"""
        for chain in chain_list:
            yield requests.get(chain["url"]).json()
    ```
  - Wire evolution_chains into source return tuple

  **Must NOT do**:
  - Don't duplicate the pokemon_species transformer from Task 8 — extend the existing one
  - Don't fetch all evolution chains — first page only

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Extending existing pipeline with new resource, needs to understand dlt transformer patterns
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 12
  - **Blocked By**: Task 2

  **References**:

  **API/Type References**:
  - `https://pokeapi.co/api/v2/evolution-chain` — Returns list of evolution chains
  - `https://pokeapi.co/api/v2/evolution-chain/1` — Example: Bulbasaur → Ivysaur → Venusaur chain

  **Acceptance Criteria**:
  - [ ] `just pipeline` creates `evolution_chains` table in raw_data schema
  - [ ] Evolution chain data contains nested `chain` field with species and evolution_details
  - [ ] `pokemon_id` foreign key exists in pokemon_species table

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Evolution chain data loaded correctly
    Tool: Bash
    Preconditions: Pipeline runs successfully
    Steps:
      1. Run `just pipeline`
      2. Run `duckdb data/raw.duckdb "SELECT COUNT(*) FROM raw_data.evolution_chains"` — expect 20
      3. Run `duckdb data/raw.duckdb "SELECT id FROM raw_data.evolution_chains LIMIT 1"` — expect valid ID
    Expected Result: Evolution chains loaded with correct structure
    Failure Indicators: 0 rows, missing nested chain data
    Evidence: .sisyphus/evidence/task-9-evolution-chains.txt
  ```

  **Commit**: YES
  - Message: `feat(pipeline): add evolution chain resource`
  - Files: `pokemon-dlt-pipeline/pokemon_pipeline/sources/pokemon_api.py`

- [x] 10. dlt Type + Ability + Move Resources

  **What to do**:
  - Add three more resources to the pokemon_api source:
    ```python
    @dlt.resource(write_disposition="replace", selected=False)
    def type_list():
        yield requests.get(f"{api_url}/type").json()["results"]
    
    @dlt.transformer(parallelized=True)
    def pokemon_types(type_items):
        for t in type_items:
            yield requests.get(t["url"]).json()
    
    @dlt.resource(write_disposition="replace", selected=False)
    def ability_list():
        yield requests.get(f"{api_url}/ability").json()["results"]
    
    @dlt.transformer(parallelized=True)
    def pokemon_abilities(ability_items):
        for a in ability_items:
            yield requests.get(a["url"]).json()
    
    @dlt.resource(write_disposition="replace", selected=False)
    def move_list():
        yield requests.get(f"{api_url}/move").json()["results"]
    
    @dlt.transformer(parallelized=True)
    def pokemon_moves(move_items):
        for m in move_items:
            yield requests.get(m["url"]).json()
    ```
  - Wire all three into source return: `(type_list | pokemon_types, ability_list | pokemon_abilities, move_list | pokemon_moves)`
  - Ensure all resources use `@dlt.defer` or `parallelized=True` for parallel fetching

  **Must NOT do**:
  - Don't paginate — first page only for all three
  - Don't load intermediate list resources (type_list, ability_list, move_list) — `selected=False`

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Three similar resources, follows established patterns from Task 8
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 12
  - **Blocked By**: Task 2

  **References**:

  **API/Type References**:
  - `https://pokeapi.co/api/v2/type` — Type list endpoint
  - `https://pokeapi.co/api/v2/type/1` — Normal type with full damage_relations
  - `https://pokeapi.co/api/v2/ability` — Ability list
  - `https://pokeapi.co/api/v2/move` — Move list

  **Acceptance Criteria**:
  - [ ] `just pipeline` creates `pokemon_types`, `pokemon_abilities`, `pokemon_moves` tables
  - [ ] Each table has 20 rows (first page)
  - [ ] Type data includes `damage_relations` with double/half/no damage arrays
  - [ ] Ability data includes `effect_entries` and `pokemon` arrays
  - [ ] Move data includes `type`, `power`, `accuracy`, `pp` fields

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: All 6 endpoint resources loaded
    Tool: Bash
    Preconditions: Pipeline configured
    Steps:
      1. Run `just pipeline`
      2. Run `duckdb data/raw.duckdb "SELECT table_name, (SELECT COUNT(*) FROM raw_data.pokemon) as cnt FROM information_schema.tables WHERE table_schema='raw_data'"` — list all tables with counts
      3. Verify 6 tables exist: pokemon, pokemon_species, evolution_chains, pokemon_types, pokemon_abilities, pokemon_moves
      4. Each has 20 rows
    Expected Result: 6 tables × 20 rows each
    Failure Indicators: Missing tables, 0 rows, schema errors
    Evidence: .sisyphus/evidence/task-10-all-resources.txt
  ```

  **Commit**: YES
  - Message: `feat(pipeline): add Type, Ability, and Move resources with parallel transformers`
  - Files: `pokemon-dlt-pipeline/pokemon_pipeline/sources/pokemon_api.py`

- [x] 11. dlt Evolution Chain Resource (Standalone)

  **What to do**:
  - Verify the evolution_chain resource works correctly with the transformer pattern
  - Ensure the nested chain structure is preserved in DuckDB (dlt handles nested data with `max_table_nesting=2`)
  - Test that evolution chain data can be queried to extract Pokemon → evolution → Pokemon paths
  - This task validates the evolution chain implementation from Task 9 and ensures data quality

  **Must NOT do**:
  - Don't flatten the chain structure — keep it nested for dbt to process
  - Don't add additional endpoints beyond evolution-chain

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Data validation and quality check on nested structure
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 12
  - **Blocked By**: Task 2

  **References**:
  - Same as Task 9

  **Acceptance Criteria**:
  - [ ] Evolution chain nested data preserved in DuckDB
  - [ ] Can query `chain->species->name` from evolution_chains table
  - [ ] Can query `chain->evolves_to` array from evolution_chains table

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Evolution chain nested data is queryable
    Tool: Bash
    Preconditions: Pipeline ran successfully
    Steps:
      1. Run `duckdb data/raw.duckdb "SELECT chain FROM raw_data.evolution_chains LIMIT 1"` — should return JSON with species and evolves_to
      2. Run `duckdb data/raw.duckdb "SELECT json_extract(chain, '$.species.name') as species_name FROM raw_data.evolution_chains LIMIT 3"` — should return Pokemon names
    Expected Result: Nested chain data preserved and queryable
    Failure Indicators: Flattened data, missing nested fields, JSON parse errors
    Evidence: .sisyphus/evidence/task-11-evolution-data-quality.txt
  ```

  **Commit**: YES (groups with Task 9-10)
  - Message: `feat(pipeline): validate evolution chain resource data quality`

- [x] 12. dbt Staging Models — Raw to Staging

  **What to do**:
  - Create staging SQL models in `pokemon-dbt-pipeline/models/staging/`:
    - `staging/_staging__models.yml` — schema + tests for all staging models
    - `staging/pokemon/stg_pokemon__base.sql` — Clean Pokemon data: select id, name, height, weight, sprites, flatten types array, flatten stats array
    - `staging/pokemon/stg_pokemon__types.sql` — Extract Pokemon-Type junction: pokemon_id, type_name, slot
    - `staging/pokemon/stg_pokemon__stats.sql` — Extract Pokemon stats: pokemon_id, stat_name (hp, attack, defense, etc.), base_stat
    - `staging/pokemon/stg_pokemon__abilities.sql` — Extract Pokemon-Ability junction: pokemon_id, ability_name, is_hidden
    - `staging/pokemon/stg_pokemon__moves.sql` — Extract Pokemon-Move junction: pokemon_id, move_name
    - `staging/species/stg_species__base.sql` — Clean Species data: id, pokemon_id, flavor_text, genus, habitat, color, capture_rate
    - `staging/types/stg_types__base.sql` — Clean Type data: id, name, damage_relations (keep as JSON for now)
    - `staging/types/stg_types__damage_relations.sql` — Explode damage_relations into rows: type_id, type_name, relation_type (double_to, half_to, no_to), target_type
    - `staging/abilities/stg_abilities__base.sql` — Clean Ability data: id, name, effect, short_effect
    - `staging/abilities/stg_abilities__pokemon.sql` — Ability-Pokemon junction: ability_id, pokemon_name, is_hidden
    - `staging/moves/stg_moves__base.sql` — Clean Move data: id, name, type, damage_class, power, accuracy, pp
    - `staging/evolution/stg_evolution__base.sql` — Flatten evolution chain: chain_id, stage, species_name, evolution_trigger, min_level
  - Create `_staging__models.yml` with column tests: unique id, not_null name, accepted_values for type
  - Verify `dbt run --select staging` passes

  **Must NOT do**:
  - Don't create intermediate or mart models yet (Tasks 14-16)
  - Don't use Python models at staging layer — pure SQL
  - Don't rename columns away from PokeAPI conventions

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Many SQL models with complex JSON extraction from nested PokeAPI data — needs DuckDB JSON/path functions expertise
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (can start once Tasks 8-11 complete)
  - **Blocks**: Tasks 14, 15, 16
  - **Blocked By**: Tasks 3, 8, 9, 10, 11

  **References**:

  **Pattern References**:
  - `https://docs.getdbt.com/best-practices/how-we-structure/2-staging` — Staging layer conventions
  - dbt-duckdb findings: DuckDB supports `json_extract()`, `json_extract_string()`, `UNNEST()` for nested data

  **API/Type References**:
  - PokeAPI nested JSON shapes from Tasks 8-11 — the raw table schemas in DuckDB

  **External References**:
  - `https://duckdb.org/docs/extensions/json` — DuckDB JSON functions for extracting nested fields
  - `https://duckdb.org/docs/sql/querying/unnest` — UNNEST for flattening arrays

  **WHY Each Reference Matters**:
  - dbt staging conventions: Must follow _base naming, schema yml patterns
  - DuckDB JSON functions: Critical for extracting nested PokeAPI data (types array, stats array, damage_relations object)
  - UNNEST: Required to flatten Pokemon's types/stats/abilities arrays into junction tables

  **Acceptance Criteria**:
  - [ ] `dbt run --select staging` succeeds with 0 errors
  - [ ] `dbt test --select staging` passes all tests
  - [ ] `stg_pokemon__types` has correct rows (Pokemon × types, ~40 rows for 20 Pokemon)
  - [ ] `stg_types__damage_relations` has rows for each type pair
  - [ ] `stg_evolution__base` has flattened evolution chain data

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: dbt staging models build successfully
    Tool: Bash
    Preconditions: Pipeline has loaded raw data, dbt project scaffolded
    Steps:
      1. Run `cd pokemon-dbt-pipeline && uv run dbt run --select staging`
      2. Assert exit code 0, all models built
      3. Run `uv run dbt test --select staging` — all tests pass
      4. Run `duckdb data/raw.duckdb "SELECT COUNT(*) FROM raw_data.stg_pokemon__base"` — expect 20
      5. Run `duckdb data/raw.duckdb "SELECT COUNT(*) FROM raw_data.stg_pokemon__types"` — expect ~40 (2 types per Pokemon avg)
    Expected Result: All staging models build and test clean
    Failure Indicators: Compilation errors, test failures, 0 rows
    Evidence: .sisyphus/evidence/task-12-dbt-staging.txt
  ```

  **Commit**: YES
  - Message: `feat(transform): add dbt staging models for raw Pokemon data`
  - Files: `pokemon-dbt-pipeline/models/staging/`

- [x] 13. DuckDB WASM Query Hooks + Context Provider

  **What to do**:
  - Build on the DuckDBProvider from Task 4 to create a complete query layer:
  - Create `pokemon-dashboard-app/src/lib/duckdb/hooks.ts`:
    ```typescript
    // Custom hook for querying DuckDB
    export function useDuckDBQuery<T>(sql: string, params?: unknown[]) {
      // Returns { data: T[] | null, loading: boolean, error: Error | null }
      // Uses DuckDBContext connection
      // Executes query and parses Arrow result to typed array
    }
    
    // Hook for loading a table entirely
    export function useDuckDBTable<T>(tableName: string) {
      // Returns { data: T[] | null, loading: boolean, error: Error | null }
      // Queries: SELECT * FROM {tableName}
    }
    
    // Hook for paginated queries
    export function useDuckDBPaginated<T>(sql: string, page: number, pageSize: number) {
      // Returns { data: T[] | null, totalCount: number, loading: boolean }
      // Appends LIMIT/OFFSET to query
    }
    ```
  - Create `pokemon-dashboard-app/src/lib/duckdb/arrow-parser.ts`:
    - Convert Apache Arrow result from DuckDB WASM to typed JavaScript arrays
    - Handle nested types (JSON columns), null values, BigInt → Number conversion
  - Enhance DuckDBProvider with:
    - Progress indicator (WASM download %, DB file download %)
    - Connection health check
    - Auto-reconnect on failure
  - Create `pokemon-dashboard-app/src/lib/duckdb/queries.ts`:
    - Predefined query constants for common operations:
      - `GET_ALL_POKEMON`, `GET_POKEMON_BY_ID`, `GET_POKEMON_BY_TYPE`
      - `GET_TYPE_MATCHUP_MATRIX`, `GET_EVOLUTION_CHAIN`
      - `GET_MOVES_BY_TYPE`, `GET_ABILITIES_BY_POKEMON`
      - `SEARCH_POKEMON` (with ILIKE pattern)
  - Write unit tests for arrow-parser utility

  **Must NOT do**:
  - Don't use Server Components for any DuckDB queries — client-only
  - Don't cache query results globally — React Query / SWR handles that at the component level
  - Don't add WebSocket or real-time features — static data, one-time load

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: DuckDB WASM Arrow parsing, React hooks, and query patterns — needs careful integration
  - **Skills**: [`/frontend-ui-ux`]
    - `/frontend-ui-ux`: React hook patterns, context provider design

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: Tasks 20-27 (all feature pages need query hooks)
  - **Blocked By**: Tasks 4, 6

  **References**:

  **Pattern References**:
  - DuckDBProvider from Task 4 — the base we're building on
  - TypeScript types from Task 6 — query return types must match

  **External References**:
  - `https://duckdb.org/docs/api/wasm/query` — DuckDB WASM query execution API
  - Apache Arrow format — DuckDB WASM returns Apache Arrow tables that need parsing

  **WHY Each Reference Matters**:
  - DuckDB WASM query API: How to execute SQL and get results from the WASM engine
  - Arrow format: Results come as Arrow tables — need to understand conversion to JS objects

  **Acceptance Criteria**:
  - [ ] `useDuckDBQuery` hook returns typed data from a test query
  - [ ] Arrow parser correctly converts DuckDB Arrow output to JS objects
  - [ ] Query constants defined for all 8 feature pages
  - [ ] DuckDBProvider shows loading progress during initialization
  - [ ] Unit tests for arrow-parser pass

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: DuckDB query hook returns data
    Tool: Playwright
    Preconditions: Dev server running, pokemon.db in public/
    Steps:
      1. Create test page that calls useDuckDBQuery("SELECT COUNT(*) as cnt FROM marts.dim_pokemon")
      2. Navigate to test page
      3. Wait for data to load (timeout 15s)
      4. Assert page displays count number > 0
    Expected Result: Query executes client-side and returns typed result
    Failure Indicators: Null data, timeout, Arrow parse error
    Evidence: .sisyphus/evidence/task-13-query-hooks-screenshot.png

  Scenario: Arrow parser handles edge cases
    Tool: Bash
    Preconditions: Unit tests written
    Steps:
      1. Run `cd pokemon-dashboard-app && pnpm test src/lib/duckdb/arrow-parser.test.ts`
      2. Assert all test cases pass: null values, nested JSON, BigInt conversion
    Expected Result: All parser edge case tests pass
    Failure Indicators: Test failures on null/BigInt/nested handling
    Evidence: .sisyphus/evidence/task-13-arrow-parser-tests.txt
  ```

  **Commit**: YES
  - Message: `feat(dashboard): add DuckDB WASM query hooks and Arrow parser`
  - Files: `pokemon-dashboard-app/src/lib/duckdb/`

- [x] 14. dbt Curated: Enriched Pokemon Model

  **What to do**:
  - Create intermediate + mart models in `pokemon-dbt-pipeline/models/`:
    - `intermediate/pokemon/int_pokemon__enriched.sql` — Join Pokemon + Species data:
      - Pokemon base fields (id, name, height, weight, sprites)
      - Species fields (flavor_text, genus, habitat, color, capture_rate)
      - Aggregated type names as array
      - Aggregated stat names + values as map
      - Aggregated ability names
    - `marts/core/dim_pokemon.sql` — Final enriched Pokemon dimension table:
      - id, name, genus, flavor_text, habitat, color
      - type_names (comma-separated), type_count
      - hp, attack, defense, special_attack, special_defense, speed (pivoted stats)
      - total_stats (sum), bmi (calculated from height/weight)
      - sprite_url, official_art_url
      - ability_names, hidden_ability_names
    - `marts/core/dim_pokemon_types.sql` — Pokemon-Type junction for filtering
    - `marts/core/dim_pokemon_stats.sql` — Long-format stats for radar charts
  - Add schema yml with tests: unique id, not_null name, accepted_values for type
  - Use dbt-duckdb Python model for the enriched Pokemon if SQL gets too complex:
    ```python
    # models/python/enriched_pokemon.py
    def model(dbt, session):
        dbt.config(materialized='table')
        pokemon = dbt.ref('stg_pokemon__base').df()
        species = dbt.ref('stg_species__base').df()
        types = dbt.ref('stg_pokemon__types').df()
        stats = dbt.ref('stg_pokemon__stats').df()
        # Merge and enrich...
        return enriched_df
    ```

  **Must NOT do**:
  - Don't duplicate data from staging — reference with `ref()`
  - Don't create overly wide tables — split into dimension + junction tables
  - Don't use ephemeral materialization for marts

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Complex SQL/Python joins, pivots, and aggregations — the core transformation logic
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 15, 16)
  - **Parallel Group**: Wave 3
  - **Blocks**: Tasks 18, 20, 23, 25, 26, 27
  - **Blocked By**: Task 12

  **References**:

  **Pattern References**:
  - `https://docs.getdbt.com/best-practices/how-we-structure/3-marts` — Mart layer conventions (dim/fct naming)
  - dbt-duckdb Python model pattern from research findings

  **External References**:
  - `https://duckdb.org/docs/sql/statements/pivot` — DuckDB PIVOT for stats wide-format conversion

  **WHY Each Reference Matters**:
  - dbt mart conventions: Must use dim_ prefix for dimension tables
  - DuckDB PIVOT: For converting long-format stats to wide (hp, attack, defense columns)

  **Acceptance Criteria**:
  - [ ] `dbt run --select +dim_pokemon` succeeds
  - [ ] `dim_pokemon` has columns: id, name, genus, type_names, hp, attack, defense, special_attack, special_defense, speed, total_stats
  - [ ] `dim_pokemon_stats` has long-format rows suitable for radar charts
  - [ ] `dbt test --select +dim_pokemon` passes

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Enriched Pokemon model has all expected columns
    Tool: Bash
    Preconditions: dbt staging + curated run successfully
    Steps:
      1. Run `just transform`
      2. Run `duckdb data/curated.duckdb "SELECT id, name, type_names, hp, attack, total_stats FROM marts.dim_pokemon LIMIT 3"`
      3. Assert 3 rows returned with numeric stat values
    Expected Result: Enriched Pokemon with pivoted stats and aggregated types
    Failure Indicators: Missing columns, null stats, empty type_names
    Evidence: .sisyphus/evidence/task-14-enriched-pokemon.txt
  ```

  **Commit**: YES
  - Message: `feat(transform): add enriched Pokemon mart models`
  - Files: `pokemon-dbt-pipeline/models/intermediate/pokemon/, pokemon-dbt-pipeline/models/marts/core/`

- [x] 15. dbt Curated: Type Matchup Matrix Model

  **What to do**:
  - Create models:
    - `intermediate/types/int_types__damage_matrix.sql` — Expand damage_relations into flat rows:
      ```sql
      -- attacking_type, defending_type, effectiveness
      -- e.g., 'fire', 'grass', 2.0
      -- e.g., 'water', 'fire', 2.0
      -- e.g., 'fire', 'water', 0.5
      ```
    - Use the `type_effectiveness.csv` SEED data combined with API data for accuracy
    - `marts/analytics/fct_type_matchup_matrix.sql` — Complete 18×18 matrix:
      - attacking_type (18 values)
      - defending_type (18 values)  
      - effectiveness (0, 0.25, 0.5, 1, 2, 4)
    - `marts/analytics/dim_type_summary.sql` — Type summary: offensive_strengths, defensive_weaknesses
  - Write dbt test: matchup matrix should have exactly 18×18 = 324 rows
  - Write dbt test: effectiveness values must be in (0, 0.25, 0.5, 1, 2, 4)

  **Must NOT do**:
  - Don't hardcode type names — derive from data
  - Don't create a Python model if SQL can handle it — use SQL for transparency
  - Don't miss the "no effect" (0) cases (Electric vs Ground, etc.)

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Complex self-join logic for type matchups — the analytical core of the app
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 14, 16)
  - **Parallel Group**: Wave 3
  - **Blocks**: Tasks 18, 21, 22
  - **Blocked By**: Task 12

  **References**:

  **Pattern References**:
  - `pokemon-dbt-pipeline/seeds/type_effectiveness.csv` — Seed data with full matchup chart
  - PokeAPI damage_relations structure: double_damage_to, half_damage_to, no_damage_to (and from variants)

  **External References**:
  - `https://bulbapedia.bulbagarden.net/wiki/Type` — Official type matchup chart for validation

  **WHY Each Reference Matters**:
  - Seed data: Our source of truth for type matchups since PokeAPI only provides damage_relations (not a flat matrix)
  - Bulbapedia: Ground truth for validating our matrix is correct

  **Acceptance Criteria**:
  - [ ] `fct_type_matchup_matrix` has exactly 324 rows (18×18)
  - [ ] All effectiveness values are in set {0, 0.25, 0.5, 1, 2, 4}
  - [ ] Fire → Grass = 2.0, Water → Fire = 2.0, Fire → Water = 0.5
  - [ ] Electric → Ground = 0 (no effect)
  - [ ] `dbt test --select +fct_type_matchup_matrix` passes

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Type matchup matrix is complete and correct
    Tool: Bash
    Preconditions: dbt models built
    Steps:
      1. Run `duckdb data/curated.duckdb "SELECT COUNT(*) FROM marts.fct_type_matchup_matrix"` — expect 324
      2. Run `duckdb data/curated.duckdb "SELECT effectiveness FROM marts.fct_type_matchup_matrix WHERE attacking_type='fire' AND defending_type='grass'"` — expect 2.0
      3. Run `duckdb data/curated.duckdb "SELECT effectiveness FROM marts.fct_type_matchup_matrix WHERE attacking_type='electric' AND defending_type='ground'"` — expect 0
      4. Run `duckdb data/curated.duckdb "SELECT DISTINCT effectiveness FROM marts.fct_type_matchup_matrix ORDER BY effectiveness"` — expect only {0, 0.5, 1, 2}
    Expected Result: Complete 324-row matrix with correct effectiveness values
    Failure Indicators: Missing rows, wrong effectiveness, not 18x18
    Evidence: .sisyphus/evidence/task-15-type-matchup.txt

  Scenario: Type matchup handles immunities correctly
    Tool: Bash
    Preconditions: Matrix built
    Steps:
      1. Run query for known immunities: Normal vs Ghost, Fighting vs Ghost, Poison vs Steel, Ground vs Flying, Ghost vs Normal, Dragon vs Fairy
      2. All should return effectiveness = 0
    Expected Result: All immunities return 0 effectiveness
    Failure Indicators: Immunities showing as 1.0 instead of 0
    Evidence: .sisyphus/evidence/task-15-immunities.txt
  ```

  **Commit**: YES
  - Message: `feat(transform): add type matchup matrix mart model`
  - Files: `pokemon-dbt-pipeline/models/intermediate/types/, pokemon-dbt-pipeline/models/marts/analytics/`

- [x] 16. dbt Curated: Evolution Tree Model

  **What to do**:
  - Create models:
    - `intermediate/evolution/int_evolution__flattened.sql` — Recursive CTE to flatten the nested evolution chain:
      - chain_id, stage_number, species_name, pokemon_id
      - evolution_trigger (level-up, item, trade, etc.)
      - min_level, item_name, held_item, known_move_type, time_of_day, gender
      - parent_species (the Pokemon it evolves from)
    - `marts/core/dim_evolution_tree.sql` — Clean evolution tree:
      - evolution_chain_id, chain_name (first Pokemon name)
      - stages as JSON array: [{species_name, stage, trigger, level}]
      - total_stages count
    - `marts/core/fct_evolution_paths.sql` — Edge list for graph visualization:
      - from_pokemon, to_pokemon, evolution_trigger, min_level
  - DuckDB supports recursive CTEs for tree traversal

  **Must NOT do**:
  - Don't assume fixed 3-stage evolution — some chains have 1, 2, or 8 stages (Eevee)
  - Don't hardcode evolution chain IDs

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Recursive CTE for nested tree flattening — complex SQL
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 14, 15)
  - **Parallel Group**: Wave 3
  - **Blocks**: Tasks 18, 24
  - **Blocked By**: Task 12

  **References**:

  **Pattern References**:
  - PokeAPI evolution chain structure: nested `chain.species` → `chain.evolves_to[]` → recursive

  **External References**:
  - `https://duckdb.org/docs/sql/query_syntax/with` — DuckDB recursive CTE syntax
  - `https://bulbapedia.bulbagarden.net/wiki/List_of_Pok%C3%A9mon_by_evolution_family` — Reference for validation

  **WHY Each Reference Matters**:
  - Recursive CTE: The exact SQL technique needed to flatten nested evolution chains
  - Bulbapedia evolution list: Ground truth for validating our evolution tree is correct

  **Acceptance Criteria**:
  - [ ] `dim_evolution_tree` has rows for each unique evolution chain
  - [ ] `fct_evolution_paths` has edge pairs (from_pokemon → to_pokemon)
  - [ ] Bulbasaur → Ivysaur → Venusaur path exists
  - [ ] Eevee's multiple evolution paths are all captured (if in first 20)
  - [ ] `dbt test --select +dim_evolution_tree` passes

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Evolution tree is correctly flattened
    Tool: Bash
    Preconditions: dbt models built
    Steps:
      1. Run `duckdb data/curated.duckdb "SELECT * FROM marts.fct_evolution_paths WHERE from_pokemon='bulbasaur'"` — expect row with to_pokemon='ivysaur'
      2. Run `duckdb data/curated.duckdb "SELECT chain_name, total_stages FROM marts.dim_evolution_tree WHERE chain_name='bulbasaur'"` — expect 3 stages
    Expected Result: Evolution chains properly flattened with correct paths
    Failure Indicators: Missing paths, wrong stage counts, empty edges
    Evidence: .sisyphus/evidence/task-16-evolution-tree.txt
  ```

  **Commit**: YES
  - Message: `feat(transform): add evolution tree mart models`
  - Files: `pokemon-dbt-pipeline/models/intermediate/evolution/, pokemon-dbt-pipeline/models/marts/core/`

- [x] 17. Dashboard Layout + Navigation + Loading States

  **What to do**:
  - Create `pokemon-dashboard-app/src/app/layout.tsx` — Root layout:
    - Dark cyberpunk background (#0a0a1a)
    - Top navigation bar with glassmorphism effect
    - Logo/brand area with "PokéDex" pixel font title and subtle glow
    - Navigation links: Pokedex, Types, Team, Compare, Evolution, Moves, Abilities, Quiz
    - Each nav link has type-colored hover glow
    - Mobile-responsive hamburger menu
  - Create `pokemon-dashboard-app/src/components/layout/Sidebar.tsx`:
    - Collapsible sidebar with icon-based navigation
    - Type-colored active state indicator
  - Create `pokemon-dashboard-app/src/components/layout/LoadingScreen.tsx`:
    - Full-screen loading animation while DuckDB WASM initializes
    - Pokeball-style spinner animation
    - Progress text: "Initializing database... Loading Pokemon data..."
  - Create `pokemon-dashboard-app/src/components/layout/ErrorBoundary.tsx`:
    - Cyberpunk-styled error display for DuckDB init failures
  - Create `pokemon-dashboard-app/src/components/layout/PageHeader.tsx`:
    - Reusable page header with title + description + optional action buttons
  - Set up route structure:
    - `/` → Home/Pokedex
    - `/types` → Type Matchup Calculator
    - `/team` → Team Builder
    - `/compare` → Stat Comparison
    - `/evolution` → Evolution Visualizer
    - `/moves` → Move Explorer
    - `/abilities` → Ability Explorer
    - `/quiz` → Who's That Pokemon?

  **Must NOT do**:
  - Don't use SSR for navigation — client-only with DuckDB
  - Don't add user authentication UI — no auth system
  - Don't use heavy animations on navigation — keep it snappy

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Layout, navigation, animations — pure visual/UX work
  - **Skills**: [`/frontend-ui-ux`]
    - `/frontend-ui-ux`: Navigation design, responsive layout, loading animations

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 14-16, 18-19)
  - **Parallel Group**: Wave 3
  - **Blocks**: Tasks 20-27 (all feature pages need layout)
  - **Blocked By**: Tasks 4, 5

  **References**:

  **Pattern References**:
  - Design tokens from Task 5 — color palette, glassmorphism, glow effects
  - DuckDBProvider from Task 4 — loading state integration

  **Acceptance Criteria**:
  - [ ] All 8 routes accessible via navigation
  - [ ] Navigation highlights active route
  - [ ] Loading screen displays during DuckDB initialization
  - [ ] Layout is responsive (mobile sidebar collapses)
  - [ ] Cyberpunk theme applied (dark bg, glassmorphism nav, glow effects)

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Navigation works across all routes
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to http://localhost:3000
      2. Click each navigation link (Pokedex, Types, Team, Compare, Evolution, Moves, Abilities, Quiz)
      3. Assert URL changes to correct path for each
      4. Assert active nav link is highlighted
    Expected Result: All 8 routes accessible, active state visible
    Failure Indicators: 404 errors, no active state, navigation crash
    Evidence: .sisyphus/evidence/task-17-navigation-screenshot.png

  Scenario: Loading screen displays during DuckDB init
    Tool: Playwright
    Preconditions: Fresh page load (no cached data)
    Steps:
      1. Open new incognito browser context
      2. Navigate to http://localhost:3000
      3. Observe loading screen appears (Pokeball spinner)
      4. Wait for data to load (max 15s)
      5. Assert loading screen disappears, content appears
    Expected Result: Loading screen → content transition works
    Failure Indicators: Blank screen, stuck on loading, flash of unstyled content
    Evidence: .sisyphus/evidence/task-17-loading-screen.png
  ```

  **Commit**: YES
  - Message: `feat(dashboard): add layout, navigation, and loading states`
  - Files: `pokemon-dashboard-app/src/app/layout.tsx, src/components/layout/`

- [x] 18. DuckDB Data Export Pipeline

  **What to do**:
  - Enhance `pokemon-dlt-pipeline/pokemon_pipeline/export.py` from Task 7:
    - ATTACH both raw.duckdb and curated.duckdb
    - Copy curated mart tables to fresh pokemon.db:
      - `marts.dim_pokemon`
      - `marts.dim_pokemon_types`
      - `marts.dim_pokemon_stats`
      - `marts.fct_type_matchup_matrix`
      - `marts.dim_evolution_tree`
      - `marts.fct_evolution_paths`
      - `marts.dim_type_summary`
    - Also copy sprite URL data from raw (needed for images)
    - Optimize: Run ANALYZE on all tables for query planning
    - Compress: Check if DuckDB compression reduces file size
    - Validate: Ensure all tables exist, have data, file < 100MB
    - Copy to `pokemon-dashboard-app/public/pokemon.db`
  - Add `just data` recipe that runs full pipeline + transform + export:
    ```just
    data: pipeline transform export
      @echo "Full data pipeline complete! pokemon.db ready for dashboard"
    ```

  **Must NOT do**:
  - Don't include staging or intermediate tables — only marts + raw sprite data
  - Don't export dlt metadata tables (_dlt_pipeline_state, etc.)
  - Don't skip the ANALYZE step — query performance matters in browser

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Enhancing existing script with table list and validation
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 17, 19)
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 32 (deployment needs the .db)
  - **Blocked By**: Tasks 7, 14, 15, 16

  **References**:

  **Pattern References**:
  - `pokemon-dlt-pipeline/pokemon_pipeline/export.py` — Script from Task 7

  **External References**:
  - `https://duckdb.org/docs/sql/statements/attach` — ATTACH pattern for multi-database access
  - `https://duckdb.org/docs/sql/statements/analyze` — ANALYZE for query optimization

  **Acceptance Criteria**:
  - [ ] `just data` runs full pipeline: dlt → dbt → export
  - [ ] `data/pokemon.db` created and copied to `pokemon-dashboard-app/public/pokemon.db`
  - [ ] File size < 100MB (likely ~5MB)
  - [ ] All curated mart tables present in pokemon.db
  - [ ] `ANALYZE` run on all tables

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Full data pipeline produces exportable .db
    Tool: Bash
    Preconditions: All pipeline + dbt code complete
    Steps:
      1. Run `just data`
      2. Check `ls -la data/pokemon.db pokemon-dashboard-app/public/pokemon.db` — both exist, same size
      3. Run `duckdb data/pokemon.db "SELECT table_name FROM information_schema.tables WHERE table_schema='marts'"` — list mart tables
      4. Run `du -h data/pokemon.db` — assert < 100MB
    Expected Result: Complete .db with all mart tables, under size limit
    Failure Indicators: Missing tables, oversized file, copy failure
    Evidence: .sisyphus/evidence/task-18-export-pipeline.txt
  ```

  **Commit**: YES
  - Message: `feat(pipeline): add full data export pipeline to pokemon.db`
  - Files: `pokemon-dlt-pipeline/pokemon_pipeline/export.py, justfile`

- [x] 19. Pokemon Image/Sprite Loading Utilities

  **What to do**:
  - Create `pokemon-dashboard-app/src/lib/sprites.ts`:
    - Sprite URL builder using PokeAPI CDN:
      ```typescript
      export function getSpriteUrl(pokemonId: number, variant: 'default' | 'official' | 'shiny' = 'default'): string {
        if (variant === 'official') {
          return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
        }
        if (variant === 'shiny') {
          return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${pokemonId}.png`;
        }
        return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
      }
      ```
    - Silhouette generator for quiz mode (CSS filter or canvas):
      ```typescript
      export function getSilhouetteStyle(): React.CSSProperties {
        return { filter: 'brightness(0)', transition: 'filter 0.5s' };
      }
      export function getRevealedStyle(): React.CSSProperties {
        return { filter: 'brightness(1)' };
      }
      ```
  - Configure `next.config.js` for remote image patterns:
    ```js
    images: {
      remotePatterns: [
        { protocol: 'https', hostname: 'raw.githubusercontent.com', pathname: '/PokeAPI/sprites/**' },
      ],
    }
    ```
  - Create `pokemon-dashboard-app/src/components/ui/PokemonSprite.tsx`:
    - Renders Pokemon image with loading skeleton
    - Supports default, official-artwork, shiny variants
    - Silhouette mode for quiz
    - Hover glow effect matching Pokemon's primary type color
  - Create `pokemon-dashboard-app/src/components/ui/TypeIcon.tsx`:
    - Renders type badge with icon and type-colored background/glow

  **Must NOT do**:
  - Don't store images in DuckDB — use PokeAPI CDN URLs
  - Don't download all sprites upfront — lazy load per Pokemon
  - Don't use base64 encoded images — CDN is faster

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Utility functions + simple components
  - **Skills**: [`/frontend-ui-ux`]
    - `/frontend-ui-ux`: Image component design, loading states, hover effects

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: Tasks 20, 27 (Pokedex + Quiz need sprites)
  - **Blocked By**: Task 4

  **References**:

  **External References**:
  - `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/` — Pokemon sprite CDN base URL
  - `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/` — Official artwork CDN

  **Acceptance Criteria**:
  - [ ] Sprite URLs correctly resolve to Pokemon images
  - [ ] Silhouette filter works (image appears as black shape)
  - [ ] next.config.js allows remote PokeAPI sprites
  - [ ] PokemonSprite component renders with loading skeleton

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Pokemon sprites load from CDN
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Create test page rendering PokemonSprite for Pokemon ID 1 (Bulbasaur)
      2. Navigate to test page
      3. Wait for image to load (timeout 10s)
      4. Assert img element has src containing "raw.githubusercontent.com"
      5. Assert image is visible (not broken)
    Expected Result: Bulbasaur sprite renders from PokeAPI CDN
    Failure Indicators: Broken image icon, blocked remote pattern, 404
    Evidence: .sisyphus/evidence/task-19-sprite-loading.png

  Scenario: Silhouette mode works for quiz
    Tool: Playwright
    Preconditions: PokemonSprite with silhouette enabled
    Steps:
      1. Render PokemonSprite with silhouette=true
      2. Screenshot — should appear as black silhouette shape
      3. Toggle silhouette off — image should appear in full color
    Expected Result: Silhouette → reveal transition works
    Failure Indicators: Image fully visible in silhouette mode, no transition
    Evidence: .sisyphus/evidence/task-19-silhouette-mode.png
  ```

  **Commit**: YES
  - Message: `feat(dashboard): add Pokemon sprite loading and silhouette utilities`
  - Files: `pokemon-dashboard-app/src/lib/sprites.ts, src/components/ui/PokemonSprite.tsx, src/components/ui/TypeIcon.tsx, next.config.js`

- [x] 20. Pokedex Browser Page

  **What to do**:
  - Create `pokemon-dashboard-app/src/app/page.tsx` (home page = Pokedex Browser):
    - Search bar with glassmorphism styling, real-time filtering via DuckDB ILIKE
    - Type filter pills (click to filter by type) — all 18 types as clickable badges
    - Pokemon card grid — glassmorphism cards showing:
      - Official artwork (from PokeAPI CDN)
      - Pokemon name + genus
      - Type badges with glow
      - Base stats total
      - Habitat badge
    - Click card → expand to detail view with:
      - Full stat bars (animated, type-colored)
      - Flavor text (Pokedex description)
      - Abilities list (hidden abilities marked)
      - Evolution chain preview
    - Sort options: ID, name, total stats, HP, attack, etc.
  - Use `useDuckDBQuery` with `GET_ALL_POKEMON` and `SEARCH_POKEMON` queries
  - Responsive grid: 4 columns desktop → 2 tablet → 1 mobile
  - Smooth card entrance animations (staggered fade-in)

  **Must NOT do**:
  - Don't paginate (only 20 Pokemon) — show all in grid
  - Don't add infinite scroll — not needed for small dataset
  - Don't use heavy animations that lag on mobile

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Primary feature page — heavy UI/UX work with cards, animations, layout
  - **Skills**: [`/frontend-ui-ux`]
    - `/frontend-ui-ux`: Card grid design, search UX, responsive layout, animations
  - **Skills Evaluated but Omitted**:
    - `playwright`: For QA only, not implementation

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 21-27)
  - **Parallel Group**: Wave 4
  - **Blocks**: Tasks 28, 30, 31, 33
  - **Blocked By**: Tasks 17, 13, 19

  **References**:

  **Pattern References**:
  - Design tokens from Task 5 — card styling, type colors, glassmorphism
  - DuckDB query hooks from Task 13 — `useDuckDBQuery`, `GET_ALL_POKEMON`
  - Sprite utilities from Task 19 — `PokemonSprite`, `TypeIcon`
  - Types from Task 6 — `EnrichedPokemon`, `dim_pokemon` shape

  **Acceptance Criteria**:
  - [ ] Page loads and displays all 20 Pokemon as cards
  - [ ] Search bar filters Pokemon by name in real-time
  - [ ] Type filter pills filter by Pokemon type
  - [ ] Clicking a card expands detail view with stats, abilities, flavor text
  - [ ] Cards have glassmorphism effect with type-colored borders
  - [ ] Responsive layout works on mobile

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Pokedex browser displays Pokemon cards
    Tool: Playwright
    Preconditions: Dev server running, data loaded
    Steps:
      1. Navigate to http://localhost:3000
      2. Wait for Pokemon cards to render (timeout 15s for DuckDB init)
      3. Assert at least 15 Pokemon cards visible (some may be below fold)
      4. Assert first card shows "bulbasaur" name
      5. Assert type badges visible on cards
    Expected Result: Card grid with 20 Pokemon, type badges, artwork
    Failure Indicators: Empty grid, missing images, no type badges
    Evidence: .sisyphus/evidence/task-20-pokedex-grid.png

  Scenario: Search and type filters work
    Tool: Playwright
    Preconditions: Pokedex page loaded
    Steps:
      1. Type "char" in search bar
      2. Assert only Charmander/Charmeleon/Charizard cards visible
      3. Clear search
      4. Click "Fire" type filter pill
      5. Assert only Fire-type Pokemon visible (Charmander, Charmeleon, Charizard)
    Expected Result: Filters narrow results correctly
    Failure Indicators: No filtering, all Pokemon still shown
    Evidence: .sisyphus/evidence/task-20-pokedex-filter.png

  Scenario: Card detail view expands
    Tool: Playwright
    Preconditions: Pokedex loaded
    Steps:
      1. Click on Bulbasaur card
      2. Assert detail view shows: stat bars, flavor text, abilities
      3. Assert stat bars have animated fill (not zero-width)
      4. Assert "Overgrow" ability visible
    Expected Result: Detail view with full Pokemon information
    Failure Indicators: No expansion, missing stats, empty abilities
    Evidence: .sisyphus/evidence/task-20-pokedex-detail.png
  ```

  **Commit**: YES
  - Message: `feat(dashboard): add Pokedex Browser page with search and filters`
  - Files: `pokemon-dashboard-app/src/app/page.tsx, src/components/pokedex/`

- [x] 21. Type Matchup Calculator Page

  **What to do**:
  - Create `pokemon-dashboard-app/src/app/types/page.tsx`:
    - Interactive 18×18 type matchup grid:
      - Rows = attacking types, Columns = defending types
      - Cells colored by effectiveness: 2x (green), 1x (neutral), 0.5x (orange/red), 0 (black/immune)
      - Cell shows multiplier value (2, 1, 0.5, 0)
    - Click a cell → highlight entire row + column with glow effect
    - Select attacking type → show all defending types ranked by effectiveness
    - Select defending type → show all attacking types ranked by damage taken
    - "Battle Scenario" mini-tool: Pick attacker type + defender type → show effectiveness result with animated calculation
    - Type-to-type quick summary cards: "Fire is super effective against Grass, Ice, Bug, Steel"
  - Use `useDuckDBQuery` with `GET_TYPE_MATCHUP_MATRIX`
  - Neon color coding: super effective = bright green glow, not very effective = orange glow, immune = red glow, neutral = dim

  **Must NOT do**:
  - Don't make the grid too small on mobile — add horizontal scroll or accordion
  - Don't hardcode matchup data — query from DuckDB

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Grid visualization, color coding, interactive highlighting
  - **Skills**: [`/frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: Tasks 30, 33
  - **Blocked By**: Tasks 17, 13, 15

  **References**:
  - `fct_type_matchup_matrix` from Task 15 — 324 rows of attacking_type × defending_type × effectiveness

  **Acceptance Criteria**:
  - [ ] 18×18 grid renders with all type names
  - [ ] Cell colors match effectiveness (2=green, 0.5=orange, 0=red, 1=neutral)
  - [ ] Clicking cell highlights row and column
  - [ ] Battle scenario tool shows correct effectiveness result

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Type matchup grid displays correctly
    Tool: Playwright
    Preconditions: Dev server running, data loaded
    Steps:
      1. Navigate to http://localhost:3000/types
      2. Wait for grid to render (timeout 10s)
      3. Assert 18 column headers (type names) visible
      4. Assert 18 row headers visible
      5. Find Fire-Grass cell — assert it shows "2" with green background
      6. Find Fire-Water cell — assert it shows "0.5" with orange background
    Expected Result: Complete 18x18 grid with correct colors and values
    Failure Indicators: Missing cells, wrong colors, no data
    Evidence: .sisyphus/evidence/task-21-type-grid.png

  Scenario: Battle scenario calculation works
    Tool: Playwright
    Preconditions: Type page loaded
    Steps:
      1. Select "Fire" as attacking type
      2. Select "Grass" as defending type
      3. Assert result shows "Super Effective! (2x)" with green glow
      4. Change defending to "Water" → assert "Not Very Effective (0.5x)"
    Expected Result: Correct effectiveness display for type pairings
    Failure Indicators: Wrong multiplier, no visual feedback
    Evidence: .sisyphus/evidence/task-21-battle-scenario.png
  ```

  **Commit**: YES
  - Message: `feat(dashboard): add Type Matchup Calculator page`
  - Files: `pokemon-dashboard-app/src/app/types/page.tsx, src/components/types/`

- [x] 22. Team Builder + Coverage Page

  **What to do**:
  - Create `pokemon-dashboard-app/src/app/team/page.tsx`:
    - Team slots: 6 Pokemon slots displayed as cards
    - Pokemon search/selection per slot (autocomplete with sprite)
    - Team summary panel:
      - Type coverage % — what % of types your team can hit super-effectively
      - Weakness map — types your team is weak to (highlighted red)
      - Resistance map — types your team resists (highlighted green)
    - Visual type coverage chart — radial or grid showing covered vs uncovered types
    - "Suggest Pokemon" feature — shows types not covered, suggests Pokemon that fill gaps
    - Team stat totals — sum of all base stats
    - Session-only state (no persistence — no user accounts)
  - Team coverage calculation logic:
    - For each team member, get their types → get super-effective attacking types from matchup matrix
    - Union of all super-effective types = offensive coverage
    - For each team member, get their types → get weaknesses from matchup matrix
    - Intersection of weaknesses (types multiple members are weak to) = critical weaknesses
  - Use `useDuckDBQuery` for Pokemon data and type matchup matrix

  **Must NOT do**:
  - Don't persist team selections — session-only, reset on page reload
  - Don't add save/share features — out of scope
  - Don't simulate actual battles — just type coverage analysis

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Complex coverage calculation logic + visual dashboard
  - **Skills**: [`/frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: Tasks 30, 33
  - **Blocked By**: Tasks 17, 13, 15

  **References**:
  - `fct_type_matchup_matrix` from Task 15 — for coverage calculations
  - `dim_pokemon` + `dim_pokemon_types` from Task 14 — for team member data

  **Acceptance Criteria**:
  - [ ] 6 team slots rendered
  - [ ] Can select Pokemon for each slot via search
  - [ ] Type coverage % displayed after adding team members
  - [ ] Weakness map shows types team is vulnerable to
  - [ ] Coverage calculation is correct (Fire + Water covers Fire, Ground, Rock, Grass, Ice)
  - [ ] State resets on page reload

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Team builder shows coverage analysis
    Tool: Playwright
    Preconditions: Dev server running, data loaded
    Steps:
      1. Navigate to http://localhost:3000/team
      2. Search and select "Charmander" for slot 1
      3. Search and select "Squirtle" for slot 2
      4. Search and select "Bulbasaur" for slot 3
      5. Assert type coverage > 50%
      6. Assert weakness map shows some types
    Expected Result: Coverage analysis updates as Pokemon are added
    Failure Indicators: No coverage calculation, 0% coverage, missing team members
    Evidence: .sisyphus/evidence/task-22-team-builder.png

  Scenario: Team state resets on reload
    Tool: Playwright
    Preconditions: Team with Pokemon selected
    Steps:
      1. Add 3 Pokemon to team
      2. Reload page
      3. Assert all slots are empty
    Expected Result: No persistent state
    Failure Indicators: Team persists after reload
    Evidence: .sisyphus/evidence/task-22-team-reset.png
  ```

  **Commit**: YES
  - Message: `feat(dashboard): add Team Builder with type coverage analysis`
  - Files: `pokemon-dashboard-app/src/app/team/page.tsx, src/components/team/`

- [x] 23. Stat Comparison Radar Charts Page

  **What to do**:
  - Create `pokemon-dashboard-app/src/app/compare/page.tsx`:
    - Two Pokemon selectors (autocomplete with sprite thumbnails)
    - Side-by-side radar chart comparing 6 base stats: HP, Attack, Defense, Sp.Atk, Sp.Def, Speed
    - Stat bars below radar chart with animated fill
    - Total stat comparison bar
    - Type comparison badges side-by-side
    - "Advantage" indicators: "Charizard has higher Sp.Atk (+39)"
    - Support swapping Pokemon positions
    - Default comparison: Bulbasaur vs Charmander (or first two Pokemon)
  - Use a charting library that works client-side (recharts or visx — both React-native)
  - Radar chart styled with cyberpunk aesthetic: dark background, neon lines, type-colored fills

  **Must NOT do**:
  - Don't compare more than 2 Pokemon at a time (keep it simple)
  - Don't use D3 directly — use React wrapper (recharts/visx)
  - Don't use SSR for chart rendering

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Radar chart visualization, animated stat bars, comparison layout
  - **Skills**: [`/frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: Tasks 30, 33
  - **Blocked By**: Tasks 17, 13, 14

  **References**:
  - `dim_pokemon_stats` from Task 14 — long-format stats for radar chart data
  - recharts `RadarChart` component — standard React radar chart

  **Acceptance Criteria**:
  - [ ] Two Pokemon selectors work
  - [ ] Radar chart displays 6 stat axes
  - [ ] Both Pokemon's stats visible on radar chart
  - [ ] Stat bars with animated fills below radar
  - [ ] Advantage indicators show which Pokemon is stronger in each stat

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Radar chart compares two Pokemon
    Tool: Playwright
    Preconditions: Dev server running, data loaded
    Steps:
      1. Navigate to http://localhost:3000/compare
      2. Select "Bulbasaur" for left slot
      3. Select "Charmander" for right slot
      4. Assert radar chart shows two overlapping polygons
      5. Assert stat bars visible for both Pokemon
      6. Assert advantage indicators appear (e.g., "Charmander has higher Speed")
    Expected Result: Visual radar comparison with stat analysis
    Failure Indicators: No chart rendering, missing stats, no advantage text
    Evidence: .sisyphus/evidence/task-23-radar-chart.png
  ```

  **Commit**: YES
  - Message: `feat(dashboard): add Stat Comparison Radar Charts page`
  - Files: `pokemon-dashboard-app/src/app/compare/page.tsx, src/components/compare/`

- [x] 24. Evolution Chain Visualizer Page

  **What to do**:
  - Create `pokemon-dashboard-app/src/app/evolution/page.tsx`:
    - Evolution chain selector (dropdown or search)
    - Visual tree rendering of evolution chain:
      - Nodes = Pokemon with sprites + names
      - Edges = arrows with evolution trigger labels (Level 16, Thunder Stone, Trade, etc.)
      - Multi-branch trees for Eevee-like Pokemon (if in dataset)
    - Click a node → show Pokemon details card
    - Animated path highlighting (glow travels along evolution path)
    - Alternative: Horizontal flow diagram for linear chains
  - Use a graph/tree visualization approach:
    - Option A: CSS-based tree with flex layout (simpler, works for most chains)
    - Option B: SVG-based graph with dagre or elkjs layout (for complex trees like Eevee)
  - Filter by chain or search by Pokemon name to find its evolution family

  **Must NOT do**:
  - Don't assume linear 3-stage evolution — support branching trees
  - Don't use heavy 3D rendering — 2D tree/diagram is sufficient
  - Don't over-engineer for edge cases — most chains are simple linear paths

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Tree/graph visualization logic, layout algorithms
  - **Skills**: [`/frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: Tasks 30, 33
  - **Blocked By**: Tasks 17, 13, 16

  **References**:
  - `fct_evolution_paths` from Task 16 — edge list (from_pokemon → to_pokemon)
  - `dim_evolution_tree` from Task 16 — chain metadata

  **Acceptance Criteria**:
  - [ ] Evolution chain selector works
  - [ ] Visual tree renders with Pokemon sprites as nodes
  - [ ] Evolution trigger labels on edges (level, item, trade)
  - [ ] Clicking node shows Pokemon details
  - [ ] Bulbasaur → Ivysaur → Venusaur chain renders correctly

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Evolution tree visualizes correctly
    Tool: Playwright
    Preconditions: Dev server running, data loaded
    Steps:
      1. Navigate to http://localhost:3000/evolution
      2. Select "Bulbasaur" evolution chain
      3. Assert tree shows 3 nodes (Bulbasaur, Ivysaur, Venusaur)
      4. Assert arrows between nodes with "Level 16" and "Level 32" labels
      5. Click on Ivysaur node → assert detail card appears
    Expected Result: Visual evolution tree with sprites and trigger labels
    Failure Indicators: Missing nodes, no arrows, wrong triggers
    Evidence: .sisyphus/evidence/task-24-evolution-tree.png
  ```

  **Commit**: YES
  - Message: `feat(dashboard): add Evolution Chain Visualizer page`
  - Files: `pokemon-dashboard-app/src/app/evolution/page.tsx, src/components/evolution/`

- [x] 25. Move Set Explorer Page

  **What to do**:
  - Create `pokemon-dashboard-app/src/app/moves/page.tsx`:
    - Move table with columns: Name, Type (badge), Category (Physical/Special/Status), Power, Accuracy, PP
    - Type filter — filter moves by type
    - Category filter — Physical / Special / Status
    - Search by move name
    - Sort by power, accuracy, PP, name
    - Click a move → detail panel:
      - Move effect description
      - Pokemon that learn this move (with sprites)
    - "STAB Finder" mini-feature: Select a type → show all moves of that type + which Pokemon get Same Type Attack Bonus
  - Use `useDuckDBQuery` for move data

  **Must NOT do**:
  - Don't add damage calculation formulas — just data display
  - Don't paginate for 20 moves — show all

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Data table with filters, detail panel, STAB finder
  - **Skills**: [`/frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: Tasks 30, 33
  - **Blocked By**: Tasks 17, 13, 14

  **References**:
  - Move data from `stg_moves__base` or curated move model

  **Acceptance Criteria**:
  - [ ] Move table displays all moves with type/category/power
  - [ ] Type and category filters work
  - [ ] Search by name works
  - [ ] Click move shows detail with effect + learning Pokemon
  - [ ] STAB finder shows type-matching moves

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Move explorer displays and filters moves
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to http://localhost:3000/moves
      2. Assert move table visible with columns
      3. Click "Fire" type filter → assert only Fire moves shown
      4. Search "tackle" → assert Tackle move appears
      5. Click Tackle → assert detail panel with "Normal" type and learning Pokemon
    Expected Result: Move table with working filters and detail view
    Failure Indicators: Empty table, filters not working, no detail panel
    Evidence: .sisyphus/evidence/task-25-move-explorer.png
  ```

  **Commit**: YES
  - Message: `feat(dashboard): add Move Set Explorer page`
  - Files: `pokemon-dashboard-app/src/app/moves/page.tsx, src/components/moves/`

- [x] 26. Ability Explorer Page

  **What to do**:
  - Create `pokemon-dashboard-app/src/app/abilities/page.tsx`:
    - Ability card grid (similar to Pokedex but for abilities):
      - Ability name
      - Short effect description
      - Number of Pokemon with this ability
      - Hidden ability indicator (star icon)
    - Search by ability name
    - Filter: All / Regular / Hidden
    - Click ability → detail card:
      - Full effect description
      - List of Pokemon with this ability (sprites + names, hidden marked)
    - Alphabetical sorting

  **Must NOT do**:
  - Don't add competitive tier ratings — subjective, out of scope
  - Don't link to external ability databases

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Card grid, search, filters — standard UI pattern
  - **Skills**: [`/frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: Tasks 30, 33
  - **Blocked By**: Tasks 17, 13, 14

  **References**:
  - Ability data from `stg_abilities__base` or curated model

  **Acceptance Criteria**:
  - [ ] Ability cards display with name + short effect
  - [ ] Search by name works
  - [ ] Filter by regular/hidden works
  - [ ] Click shows detail with Pokemon list

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Ability explorer displays abilities
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to http://localhost:3000/abilities
      2. Assert ability cards visible with names and descriptions
      3. Search "overgrow" → assert Overgrow ability card appears
      4. Click Overgrow → assert detail shows Pokemon with this ability
    Expected Result: Ability grid with search and detail view
    Failure Indicators: Empty grid, no search results, no detail
    Evidence: .sisyphus/evidence/task-26-ability-explorer.png
  ```

  **Commit**: YES
  - Message: `feat(dashboard): add Ability Explorer page`
  - Files: `pokemon-dashboard-app/src/app/abilities/page.tsx, src/components/abilities/`

- [x] 27. "Who's That Pokemon?" Quiz Page

  **What to do**:
  - Create `pokemon-dashboard-app/src/app/quiz/page.tsx`:
    - **Game Flow**:
      1. Show silhouette of a random Pokemon (using CSS filter: brightness(0))
      2. Player types their guess
      3. If correct: Reveal animation (silhouette → full color), celebration effect (particle burst), score +1
      4. If wrong after 3 attempts: Reveal answer with "It was {name}!" message, show full sprite
      5. "Next Pokemon" button → new random silhouette
    - **Scoring**:
      - Session score tracker: correct / attempted
      - Streak counter: consecutive correct answers
      - Best streak this session
    - **Difficulty modes**:
      - Easy: Shows type hint + silhouette
      - Medium: Shows silhouette only
      - Hard: Shows silhouette + wrong answer options (multiple choice)
    - **Visual flair**:
      - Dramatic reveal animation (silhouette fades → full color with glow burst)
      - Correct answer: Confetti/particle explosion
      - Wrong answer: Screen shake effect
      - Cyberpunk-styled answer input with glow on focus
      - Score display with neon number animation
    - Use `useDuckDBQuery` to get random Pokemon from dataset
    - Use `getSilhouetteStyle()` from sprites.ts for silhouette mode

  **Must NOT do**:
  - Don't persist scores across sessions — session-only
  - Don't use all 20 Pokemon at once — random selection from dataset
  - Don't add leaderboards — no user accounts
  - Don't make the quiz too easy — proper silhouette (no color hints)

  **Recommended Agent Profile**:
  - **Category**: `artistry`
    - Reason: Creative quiz game mechanics, particle effects, animations — needs creative touch beyond standard UI patterns
  - **Skills**: [`/frontend-ui-ux`]
    - `/frontend-ui-ux`: Animations, micro-interactions, game UX

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: Tasks 30, 33
  - **Blocked By**: Tasks 17, 13, 14, 19

  **References**:
  - Sprite silhouette utilities from Task 19 — `getSilhouetteStyle()`, `getRevealedStyle()`
  - `dim_pokemon` from Task 14 — random Pokemon selection

  **Acceptance Criteria**:
  - [ ] Quiz shows Pokemon silhouette
  - [ ] Correct guess triggers reveal animation + score increment
  - [ ] 3 wrong guesses reveal answer
  - [ ] Score and streak trackers display
  - [ ] Difficulty modes work (Easy with hints, Medium, Hard multiple choice)
  - [ ] Session resets on page reload

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Quiz game flow works
    Tool: Playwright
    Preconditions: Dev server running, data loaded
    Steps:
      1. Navigate to http://localhost:3000/quiz
      2. Assert silhouette image visible (dark shape)
      3. Type correct Pokemon name (check which one is shown)
      4. Assert reveal animation plays
      5. Assert score increments
      6. Click "Next" → new silhouette appears
    Expected Result: Full quiz game loop works
    Failure Indicators: No silhouette, no reveal, score doesn't update
    Evidence: .sisyphus/evidence/task-27-quiz-game.png

  Scenario: Wrong answer handling works
    Tool: Playwright
    Preconditions: Quiz page loaded
    Steps:
      1. Type wrong answer "pikachu" (likely not in first 20)
      2. Assert "Wrong!" feedback appears, attempts decrement
      3. After 3 wrong attempts, assert answer is revealed
      4. Assert "Next" button appears
    Expected Result: Wrong answers handled with reveal after 3 attempts
    Failure Indicators: No feedback, no reveal, infinite attempts
    Evidence: .sisyphus/evidence/task-27-quiz-wrong-answer.png
  ```

  **Commit**: YES
  - Message: `feat(dashboard): add Who's That Pokemon quiz page`
  - Files: `pokemon-dashboard-app/src/app/quiz/page.tsx, src/components/quiz/`

- [x] 28. Pipeline Integration Tests

  **What to do**:
  - Create `pokemon-dlt-pipeline/tests/` directory with pytest tests:
    - `test_pipeline_run.py` — Full pipeline run test:
      - Run pipeline against PokeAPI
      - Assert raw.duckdb created
      - Assert all 6 tables exist with 20 rows each
      - Assert pokemon_list NOT in database
      - Assert Pokemon data has expected fields (id, name, types, stats)
    - `test_transformers.py` — Transformer-specific tests:
      - Test `@dlt.defer` parallel execution works
      - Test `selected=False` prevents pokemon_list from loading
      - Test pipe operator chains correctly
    - `test_data_quality.py` — Data quality assertions:
      - Pokemon IDs are sequential (1-20)
      - All Pokemon have at least 1 type
      - All Pokemon have 6 stats
      - Species data has pokemon_id foreign key
      - Type damage_relations arrays are non-empty
  - Add `just test-pipeline` recipe
  - Create `pytest.ini` or `pyproject.toml` test config

  **Must NOT do**:
  - Don't mock PokeAPI — hit the real API (it's free, no auth)
  - Don't test dbt models here — that's Task 29

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Test writing, data quality assertions, no complex logic
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 29-32)
  - **Parallel Group**: Wave 5
  - **Blocks**: Task 33
  - **Blocked By**: Tasks 8, 9, 10, 11

  **References**:
  - Pipeline code from Tasks 8-11

  **Acceptance Criteria**:
  - [ ] `pytest pokemon-dlt-pipeline/tests/` passes all tests
  - [ ] At least 8 test functions covering pipeline run, transformers, data quality

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Pipeline tests pass
    Tool: Bash
    Preconditions: Pipeline code complete
    Steps:
      1. Run `cd pokemon-dlt-pipeline && uv run pytest tests/ -v`
      2. Assert all tests pass (8+ tests)
      3. Assert no warnings or errors
    Expected Result: Clean test run, all pass
    Failure Indicators: Test failures, import errors, API connection issues
    Evidence: .sisyphus/evidence/task-28-pipeline-tests.txt
  ```

  **Commit**: YES
  - Message: `test(pipeline): add integration and data quality tests`
  - Files: `pokemon-dlt-pipeline/tests/`

- [x] 29. dbt Model Tests

  **What to do**:
  - Add dbt tests in `pokemon-dbt-pipeline/models/` and `pokemon-dbt-pipeline/tests/`:
    - Schema yml tests for all staging models:
      - `unique` on id columns
      - `not_null` on name columns
      - `accepted_values` for type names (18 Pokemon types)
      - `relationships` for pokemon_id foreign keys
    - Singular tests in `tests/`:
      - `test_matchup_matrix_completeness.sql` — 18×18 = 324 rows
      - `test_matchup_effectiveness_values.sql` — Only valid values (0, 0.25, 0.5, 1, 2, 4)
      - `test_pokemon_stat_totals.sql` — Total stats > 0 for all Pokemon
      - `test_evolution_paths_bidirectional.sql` — Every from_pokemon is a valid Pokemon
      - `test_no_duplicate_pokemon.sql` — Each Pokemon ID appears exactly once in dim_pokemon
    - Add `just test-transform` recipe
  - Ensure `dbt test` passes end-to-end

  **Must NOT do**:
  - Don't add tests that depend on specific Pokemon names (data-dependent fragility)
  - Don't test staging and marts separately — run full `dbt test`

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: dbt test writing, schema yml assertions
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5
  - **Blocks**: Task 33
  - **Blocked By**: Tasks 14, 15, 16

  **References**:
  - dbt models from Tasks 12, 14-16

  **Acceptance Criteria**:
  - [ ] `dbt test` passes all tests with 0 failures
  - [ ] At least 5 singular tests + schema tests for all models

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: dbt tests pass
    Tool: Bash
    Preconditions: dbt models built
    Steps:
      1. Run `cd pokemon-dbt-pipeline && uv run dbt test`
      2. Assert all tests pass (0 failures)
      3. Run `uv run dbt test --select test_type:singular` — all singular tests pass
    Expected Result: Clean dbt test run
    Failure Indicators: Test failures, compilation errors
    Evidence: .sisyphus/evidence/task-29-dbt-tests.txt
  ```

  **Commit**: YES
  - Message: `test(transform): add dbt model and data quality tests`
  - Files: `pokemon-dbt-pipeline/tests/, pokemon-dbt-pipeline/models/**/_*.yml`

- [x] 30. Dashboard Component Tests

  **What to do**:
  - Set up Vitest + React Testing Library in `pokemon-dashboard-app/`:
    - Install: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
    - Create `vitest.config.ts` with jsdom environment
  - Write component tests for key components:
    - `src/components/ui/Card.test.tsx` — Renders with glassmorphism, accepts type glow
    - `src/components/ui/Badge.test.tsx` — Renders type name with correct color
    - `src/components/ui/PokemonSprite.test.tsx` — Renders image, silhouette mode
    - `src/components/ui/TypeIcon.test.tsx` — Renders type icon with color
    - `src/components/pokedex/PokemonCard.test.tsx` — Renders Pokemon name, types, stats
    - `src/components/quiz/QuizGame.test.tsx` — Game flow: silhouette → guess → reveal
    - `src/lib/duckdb/arrow-parser.test.ts` — Arrow conversion edge cases
  - Add `just test-dashboard` recipe
  - Mock DuckDB WASM for component tests (don't initialize real WASM in tests)

  **Must NOT do**:
  - Don't try to initialize DuckDB WASM in test environment — mock it
  - Don't test CSS styles pixel-perfectly — test class names and data attributes
  - Don't skip tests for complex components (quiz, team builder)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Test infrastructure setup + component tests
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5
  - **Blocks**: Task 33
  - **Blocked By**: Tasks 20-27

  **References**:
  - Dashboard components from Tasks 20-27

  **Acceptance Criteria**:
  - [ ] `pnpm test` runs all Vitest tests
  - [ ] At least 7 component tests pass
  - [ ] DuckDB WASM is properly mocked in test environment

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Dashboard component tests pass
    Tool: Bash
    Preconditions: Dashboard code complete
    Steps:
      1. Run `cd pokemon-dashboard-app && pnpm test`
      2. Assert all tests pass (7+ tests)
      3. Assert test coverage report generated
    Expected Result: Clean Vitest run, all pass
    Failure Indicators: Test failures, WASM initialization in test env
    Evidence: .sisyphus/evidence/task-30-dashboard-tests.txt
  ```

  **Commit**: YES
  - Message: `test(dashboard): add component tests with Vitest and React Testing Library`
  - Files: `pokemon-dashboard-app/vitest.config.ts, src/**/*.test.tsx`

- [x] 31. DuckDB WASM Integration Tests

  **What to do**:
  - Create `pokemon-dashboard-app/tests/integration/` with Playwright tests:
    - `duckdb-init.spec.ts` — Test DuckDB WASM initialization:
      - Page loads → WASM initializes → .db file fetches → connection ready
      - Verify loading screen appears then transitions to content
    - `duckdb-query.spec.ts` — Test actual query execution:
      - Run `SELECT COUNT(*) FROM marts.dim_pokemon` → assert count > 0
      - Run `SELECT * FROM marts.fct_type_matchup_matrix WHERE attacking_type='fire'` → assert results
    - `duckdb-error.spec.ts` — Test error handling:
      - What happens if .db file is missing or corrupted
  - Add `just test-integration` recipe running Playwright

  **Must NOT do**:
  - Don't use Jest/Vitest for these — Playwright runs real browser with real WASM
  - Don't skip error scenario tests

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Playwright integration tests with real DuckDB WASM execution
  - **Skills**: [`playwright`]
    - `playwright`: Browser automation for integration testing

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5
  - **Blocks**: Task 33
  - **Blocked By**: Tasks 13, 20

  **References**:
  - DuckDB WASM integration from Task 4, query hooks from Task 13

  **Acceptance Criteria**:
  - [ ] Playwright tests pass
  - [ ] DuckDB WASM initializes successfully in browser
  - [ ] Queries return data from pokemon.db
  - [ ] Error scenario handled gracefully

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: DuckDB WASM integration tests pass
    Tool: Bash
    Preconditions: Dev server running with data
    Steps:
      1. Run `cd pokemon-dashboard-app && pnpm exec playwright test tests/integration/`
      2. Assert all 3 test files pass
      3. Assert screenshots captured for each test
    Expected Result: All integration tests pass with evidence
    Failure Indicators: WASM init timeout, query failures, missing .db
    Evidence: .sisyphus/evidence/task-31-integration-tests.txt
  ```

  **Commit**: YES
  - Message: `test(dashboard): add DuckDB WASM integration tests with Playwright`
  - Files: `pokemon-dashboard-app/tests/integration/`

- [x] 32. Vercel Deployment Config + Production Build

  **What to do**:
  - Create `pokemon-dashboard-app/vercel.json`:
    ```json
    {
      "framework": "nextjs",
      "buildCommand": "cd ../.. && just data && cd pokemon-dashboard-app && pnpm build",
      "outputDirectory": ".next"
    }
    ```
  - Ensure `next.config.js` has correct static asset handling for pokemon.db:
    ```js
    // Ensure pokemon.db is served as static asset
    // It's already in public/ so Next.js handles it automatically
    ```
  - Optimize pokemon.db for production:
    - Verify file size < 100MB
    - Run `ANALYZE` on all tables for query performance
    - Consider HTTP/2 push hints for pokemon.db
  - Configure Next.js for production:
    - Static export if possible (no server needed)
    - Or standard build with client-only rendering
  - Test production build locally:
    - `pnpm build` succeeds
    - `pnpm start` works
    - All 8 pages render
    - DuckDB WASM loads pokemon.db from static path
  - Create deployment documentation in README:
    - `vercel --prod` deploy command
    - Environment setup (Node.js version, pnpm)
  - Test Vercel deployment:
    - `vercel` (preview deploy) → verify URL works
    - All features functional on deployed URL
    - DuckDB WASM loads data correctly on Vercel

  **Must NOT do**:
  - Don't use Vercel Serverless Functions — everything is client-side
  - Don't add CI/CD pipeline — manual deploy is fine for now
  - Don't use Vercel Edge Runtime — DuckDB WASM needs standard browser

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Deployment config, build optimization, production testing
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5
  - **Blocks**: Task 33
  - **Blocked By**: Tasks 18, 20-27

  **References**:

  **External References**:
  - `https://vercel.com/docs/deployments/overview` — Vercel deployment documentation
  - `https://vercel.com/docs/limits` — Static asset size limits

  **Acceptance Criteria**:
  - [ ] `pnpm build` succeeds without errors
  - [ ] `vercel` deploy succeeds and returns URL
  - [ ] Deployed URL loads all 8 feature pages
  - [ ] DuckDB WASM loads data on Vercel deployment
  - [ ] pokemon.db < 100MB served as static asset

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Production build works locally
    Tool: Bash
    Preconditions: All code complete, data generated
    Steps:
      1. Run `cd pokemon-dashboard-app && pnpm build`
      2. Assert build succeeds (exit code 0)
      3. Run `pnpm start`
      4. Navigate to http://localhost:3000
      5. Assert all pages load
    Expected Result: Production build works
    Failure Indicators: Build errors, missing static assets
    Evidence: .sisyphus/evidence/task-32-production-build.txt

  Scenario: Vercel deployment works
    Tool: Bash
    Preconditions: Vercel CLI installed and authenticated
    Steps:
      1. Run `cd pokemon-dashboard-app && vercel --yes`
      2. Wait for deployment to complete
      3. Get deployment URL from output
      4. curl the URL — assert HTML returned
      5. Navigate to URL in browser — assert DuckDB loads
    Expected Result: Live deployment with working features
    Failure Indicators: Build failure, missing .db file, WASM errors
    Evidence: .sisyphus/evidence/task-32-vercel-deploy.txt
  ```

  **Commit**: YES
  - Message: `feat(deploy): add Vercel deployment config and production build`
  - Files: `pokemon-dashboard-app/vercel.json, next.config.js, README.md`

- [x] 33. End-to-End QA — Full Pipeline to Vercel Deploy

  **What to do**:
  - Run the complete end-to-end workflow:
    1. Clean start: `rm -rf data/` and rebuild everything
    2. `just data` — pipeline → dbt → export
    3. Verify data/pokemon.db created and valid
    4. `just dashboard` — dev server with live data
    5. Test all 8 features in browser (Playwright)
    6. `just build` — production build
    7. `just deploy` — Vercel deployment
    8. Verify deployed URL works
  - Run comprehensive Playwright test suite across all pages:
    - Home/Pokedex: Search, filter, card detail
    - Types: Grid renders, cell click, battle scenario
    - Team: Select Pokemon, coverage analysis, state reset
    - Compare: Radar chart, stat comparison
    - Evolution: Tree renders, node click
    - Moves: Table, filters, STAB finder
    - Abilities: Grid, search, detail
    - Quiz: Silhouette, guess, reveal, scoring
  - Cross-feature integration tests:
    - Navigate between all pages via nav bar
    - Pokemon detail links from different features point to same data
    - Type colors consistent across all features
  - Performance checks:
    - DuckDB WASM initialization < 5 seconds
    - Page transitions < 1 second
    - pokemon.db download < 3 seconds on broadband

  **Must NOT do**:
  - Don't skip any feature — test ALL 8
  - Don't test on localhost only — also test on Vercel deployed URL
  - Don't skip performance checks

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Comprehensive QA across full stack, integration testing, performance validation
  - **Skills**: [`playwright`]
    - `playwright`: Full browser automation for all 8 feature tests

  **Parallelization**:
  - **Can Run In Parallel**: NO — sequential (depends on everything)
  - **Parallel Group**: Sequential (Wave 5 final)
  - **Blocks**: FINAL verification wave
  - **Blocked By**: Tasks 28, 29, 30, 31, 32

  **References**:
  - All feature pages from Tasks 20-27
  - All test scenarios from previous tasks

  **Acceptance Criteria**:
  - [ ] `just data` completes full pipeline without errors
  - [ ] All 8 features tested via Playwright
  - [ ] Cross-feature navigation works
  - [ ] DuckDB WASM init < 5s
  - [ ] Vercel deployment URL works
  - [ ] All evidence captured in .sisyphus/evidence/

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Full pipeline to deploy end-to-end
    Tool: Bash + Playwright
    Preconditions: All code written, clean state
    Steps:
      1. Run `rm -rf data/` — clean slate
      2. Run `just data` — full pipeline
      3. Assert data/pokemon.db exists, size < 100MB
      4. Run `just dashboard` in background
      5. Run Playwright test suite across all 8 pages
      6. Run `just build && just deploy`
      7. Navigate to Vercel URL, re-test all pages
    Expected Result: Complete end-to-end success
    Failure Indicators: Pipeline failure, test failures, deploy failure
    Evidence: .sisyphus/evidence/task-33-e2e-qa/

  Scenario: Performance benchmarks met
    Tool: Playwright
    Preconditions: Deployed URL accessible
    Steps:
      1. Navigate to deployed URL (fresh load)
      2. Measure time from page load to DuckDB content visible
      3. Assert < 5 seconds
      4. Click between pages, measure transition time
      5. Assert < 1 second per transition
    Expected Result: Performance within acceptable bounds
    Failure Indicators: Slow WASM init, laggy transitions
    Evidence: .sisyphus/evidence/task-33-performance.txt
  ```

  **Commit**: YES
  - Message: `test(e2e): add full pipeline-to-deploy end-to-end QA`
  - Files: `pokemon-dashboard-app/tests/e2e/, justfile`

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run linters + type checks + tests. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Start from clean state. Execute EVERY QA scenario from EVERY task. Test cross-feature integration. Test edge cases. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff. Verify 1:1. Check "Must NOT do" compliance. Detect cross-task contamination.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | VERDICT`

---

## Commit Strategy

- **Wave 1**: `feat(scaffold): initialize monorepo structure` — all scaffold files
- **Wave 2**: `feat(pipeline): add dlt Pokemon API resources with transformers` — pipeline package
- **Wave 2**: `feat(transform): add dbt staging models` — dbt staging
- **Wave 2**: `feat(dashboard): add DuckDB WASM query hooks` — dashboard hooks
- **Wave 3**: `feat(transform): add dbt curated models` — dbt curated
- **Wave 3**: `feat(dashboard): add layout and navigation` — dashboard shell
- **Wave 3**: `feat(pipeline): add DuckDB export utility` — export script
- **Wave 4**: `feat(dashboard): add [feature-name] page` — per feature
- **Wave 5**: `test: add pipeline, dbt, and dashboard test suites` — all tests
- **Wave 5**: `feat(deploy): add Vercel deployment configuration` — deploy config
- **Wave 5**: `test(e2e): add end-to-end pipeline-to-deploy QA` — e2e tests

---

## Success Criteria

### Verification Commands
```bash
just pipeline          # Expected: dlt loads 6 tables to data/raw.duckdb, 20 rows each
just transform         # Expected: dbt builds staging + curated models in data/curated.duckdb
just export            # Expected: creates data/pokemon.db < 10MB
just dashboard         # Expected: Next.js dev server starts at localhost:3000
just test              # Expected: all pytest + vitest tests pass
just build             # Expected: Next.js production build succeeds, pokemon.db in .next/static
just deploy            # Expected: Vercel deployment succeeds, URL returned
```

### Final Checklist
- [ ] All 6 PokeAPI endpoints loaded via dlt transformers with parallel execution
- [ ] dbt curated models produce type matchup matrix, evolution trees, enriched Pokemon
- [ ] DuckDB .db file < 100MB (Vercel limit)
- [ ] All 8 dashboard features functional with cyberpunk design
- [ ] DuckDB WASM queries work client-side in browser
- [ ] Vercel deployment succeeds
- [ ] No auth, no backend, no user state — as specified
- [ ] All tests pass
