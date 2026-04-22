pipeline:
  cd pokemon-dlt-pipeline && uv run python pokemon_pipeline/pipeline.py

transform:
  cd pokemon-dbt-pipeline && uv run dbt run

export:
  cd pokemon-dlt-pipeline && uv run python -c "import duckdb; duckdb.execute('EXPORT DATABASE TO \"data/pokemon.db\" (FORMAT parquet)'); print('Exported to data/pokemon.db')"

dashboard:
  cd pokemon-dashboard-app && pnpm dev

test:
  echo "Running tests..."
  cd pokemon-dlt-pipeline && uv run pytest
  cd pokemon-dbt-pipeline && uv run dbt test

build:
  cd pokemon-dashboard-app && pnpm build

deploy:
  cd pokemon-dashboard-app && vercel --prod

clean:
  rm -rf pokemon-dlt-pipeline/__pycache__ pokemon-dlt-pipeline/.venv pokemon-dlt-pipeline/*.pyc
  rm -rf pokemon-dbt-pipeline/target pokemon-dbt-pipeline/dbt_packages
  rm -rf pokemon-dashboard-app/.next pokemon-dashboard-app/dist
  rm -f data/*.duckdb data/*.wal

data: pipeline transform export