# AGENTS.md - dbt Transforms

dbt-duckdb project transforming raw dlt data into marts.

## Structure

```
pokemon-dbt-pipeline/
├── models/
│   ├── staging/         # stg_* - join child tables on _dlt_id/_dlt_parent_id
│   ├── intermediate/    # int_* - enriched, evolution flattened
│   └── marts/core/      # dim_* + fct_* models
├── seeds/               # type_effectiveness.csv
├── tests/               # Singular SQL tests
├── models/sources.yml   # Source declarations (must include child tables)
└── profiles.yml         # DuckDB connection config
```

## Where to Look

| Task              | Location             | Notes                           |
| ----------------- | -------------------- | ------------------------------- |
| Add staging model | `models/staging/`    | Join child tables, never UNNEST |
| Add mart          | `models/marts/core/` | Prefix `dim_` or `fct_`         |
| Add test          | `tests/`             | Use `{{ ref('model_name') }}`   |
| Update seeds      | `seeds/`             | CSV files loaded by `dbt seed`  |

## Conventions

- **Working dir**: Always `cd pokemon-dbt-pipeline` before running dbt commands
- **Child table joins**: `ON parent._dlt_id = child._dlt_parent_id`
- **Flattened columns**: `type__name` (not JSON path operators)
- **Sources**: Must declare child tables in `models/sources.yml`
- **Seeds**: Run `dbt seed` before `dbt run` when CSV changes

## Anti-Patterns

- **Never UNNEST child tables** - dlt creates separate tables (e.g., `pokemon_details__types`)
- **Never run dbt from repo root** - Profiles and `dbt_project.yml` are in this directory
- **Don't forget child tables in sources.yml** - Missing sources break staging models

## Commands

```bash
cd pokemon-dbt-pipeline
uv run dbt seed      # Load CSV seeds
uv run dbt run       # Execute models
uv run dbt test      # Run singular tests + schema tests
```
