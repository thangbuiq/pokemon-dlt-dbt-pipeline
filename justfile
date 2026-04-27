install:
  uv sync --all-groups --all-extras --all-packages

pipeline:
  cd pokemon-dlt-pipeline && uv run python pokemon_pipeline/pipeline.py

transform:
  cd pokemon-dbt-pipeline && uv run dbt seed && uv run dbt run

export:
  cd pokemon-dlt-pipeline && uv run python -m pokemon_pipeline.export
  mkdir -p pokemon-dashboard-app/public/data
  cd pokemon-dlt-pipeline && uv run python -c "from pokemon_pipeline.export import export_json; export_json()"

dashboard:
  cd pokemon-dashboard-app && bun dev

dagster:
  cd pokemon-dagster-app && uv run dg dev

dagster-materialize:
  cd pokemon-dagster-app && uv run dagster job execute -m pokemon_dagster_app.defs.orchestration -j pokemon_data_job

test:
  echo "Running tests..."
  cd pokemon-dlt-pipeline && uv run pytest
  cd pokemon-dbt-pipeline && uv run dbt test

build:
  cd pokemon-dashboard-app && bun build

clean:
  rm -rf pokemon-dlt-pipeline/__pycache__ pokemon-dlt-pipeline/.venv pokemon-dlt-pipeline/*.pyc
  rm -rf pokemon-dbt-pipeline/target pokemon-dbt-pipeline/dbt_packages
  rm -rf pokemon-dashboard-app/.next pokemon-dashboard-app/dist
  rm -f data/*.duckdb data/*.wal

data: pipeline transform export
