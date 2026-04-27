# pokemon_dagster_app

Dagster orchestration for this monorepo. It runs:

1. `just pipeline` (dlt extract/load)
2. `dbt_seed` then `dbt_materialized`
3. `just export` (curated DuckDB + JSON export)

## Getting started

### Installing dependencies

**Option 1: uv**

Ensure [`uv`](https://docs.astral.sh/uv/) is installed following their [official documentation](https://docs.astral.sh/uv/getting-started/installation/).

Create a virtual environment, and install the required dependencies using _sync_:

```bash
uv sync
```

Then, activate the virtual environment:

| OS      | Command                     |
| ------- | --------------------------- |
| MacOS   | `source .venv/bin/activate` |
| Windows | `.venv\Scripts\activate`    |

**Option 2: pip**

Install the python dependencies with [pip](https://pypi.org/project/pip/):

```bash
python3 -m venv .venv
```

Then activate the virtual environment:

| OS      | Command                     |
| ------- | --------------------------- |
| MacOS   | `source .venv/bin/activate` |
| Windows | `.venv\Scripts\activate`    |

Install the required dependencies:

```bash
pip install -e ".[dev]"
```

### Running Dagster

Start the Dagster UI web server:

```bash
dg dev
```

Open http://localhost:3000 in your browser to see the project.

### Included job + schedule

- Job: `pokemon_data_job`
- Assets:
  - `dlt_ingest`
  - `dbt_seed` -> `dbt_materialized` (depends on `dlt_ingest` + `dbt_seed`)
  - `export_dashboard_data`
- Schedule: daily at `02:00` (server local time)

### Incremental dlt (short)

`pokemon_list` fetches PokeAPI with `limit/offset` pagination and persists the
latest `pokemon_next_offset` in `data/pokemon_offset_checkpoint.json`. The next
run resumes from that offset for faster incremental loads.

### Run pipeline from Dagster CLI

From `pokemon-dagster-app/`:

```bash
uv run dagster job execute -m pokemon_dagster_app.defs.orchestration -j pokemon_data_job
```

Or from repo root:

```bash
just dagster-materialize
```

## Learn more

To learn more about this template and Dagster in general:

- [Dagster Documentation](https://docs.dagster.io/)
- [Dagster University](https://courses.dagster.io/)
- [Dagster Slack Community](https://dagster.io/slack)
