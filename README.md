# Pokemon Dashboard - Cyberpunk Pokedex

A modern data pipeline combining dlt + DuckDB + dbt + Next.js + DuckDB WASM for Pokemon data visualization.

## Monorepo Structure

```
pokemon-dlt-dbt-pipeline/
├── pokemon-dlt-pipeline/     # Data ingestion with dlt
├── pokemon-dbt-pipeline/     # Transformations with dbt
├── pokemon-dashboard-app/    # Next.js frontend
└── data/                     # DuckDB storage
```

## Quickstart

```bash
# Run full pipeline: extract → transform → export
just data

# Run individual steps
just pipeline     # Extract data from APIs
just transform    # Run dbt transformations
just export       # Export to DuckDB

# Development
just dashboard    # Start Next.js dev server
just test         # Run all tests
just build        # Production build
just deploy       # Deploy to Vercel
```