# AGENTS.md - dlt Pipeline

Python dlt pipeline fetching from PokeAPI into DuckDB.

## Structure

```
pokemon-dlt-pipeline/
├── pokemon_pipeline/
│   ├── pipeline.py       # Main entry: create_pipeline(), run_pipeline()
│   ├── sources/
│   │   └── pokemon_api.py  # @dlt.source, @dlt.resource, @dlt.transformer
│   └── export.py         # Exports curated tables to pokemon.db + JSON
└── tests/                # pytest suite (integration against real PokeAPI)
```

## Where to Look

| Task           | Location                                  | Notes                              |
| -------------- | ----------------------------------------- | ---------------------------------- |
| Run pipeline   | `pokemon_pipeline/pipeline.py`            | Executed by `just pipeline`        |
| Modify sources | `pokemon_pipeline/sources/pokemon_api.py` | PokeAPI fetch logic                |
| Export data    | `pokemon_pipeline/export.py`              | Creates `data/pokemon.db` and JSON |
| Add tests      | `tests/`                                  | Integration tests against live API |

## Conventions

- **`@dlt.source(max_table_nesting=2)`** - Child tables use `__` separator
- **`selected=False`** on intermediate resources (e.g., `pokemon_list`)
- **`@dlt.transformer` + `@dlt.defer`** for parallel fetching
- **Column flattening**: `type__name` not nested JSON
- **pytest**: `testpaths = ["tests"]`, `python_files = "test_*.py"`

## Anti-Patterns

- **Never commit `.pytest_cache/`** - Already in `.gitignore`
- **Don't assume nested JSON** - dlt creates separate child tables
- **Don't run export from wrong directory** - Uses relative paths to `data/`

## Commands

```bash
cd pokemon-dlt-pipeline
uv run python pokemon_pipeline/pipeline.py   # Run ingestion
uv run python -m pokemon_pipeline.export     # Export curated tables
uv run pytest tests/ -v                      # Run tests (live API calls)
```
