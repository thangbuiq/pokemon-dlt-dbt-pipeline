import subprocess
from pathlib import Path

from dagster import (
    AssetSelection,
    Definitions,
    MaterializeResult,
    OpExecutionContext,
    ScheduleDefinition,
    asset,
    define_asset_job,
)

REPO_ROOT = Path(__file__).resolve().parents[4]
DBT_PROJECT_DIR = REPO_ROOT / "pokemon-dbt-pipeline"


def _run_step(context: OpExecutionContext, step_name: str) -> None:
    command = ["just", step_name]
    context.log.info("Running command: %s", " ".join(command))
    subprocess.run(command, cwd=REPO_ROOT, check=True)


def _run_dbt_seed(context: OpExecutionContext, seed_name: str) -> None:
    command = [
        "uv",
        "run",
        "dbt",
        "seed",
        "--project-dir",
        str(DBT_PROJECT_DIR),
        "--profiles-dir",
        str(DBT_PROJECT_DIR),
        "--select",
        seed_name,
    ]
    context.log.info("Running command: %s", " ".join(command))
    subprocess.run(command, cwd=DBT_PROJECT_DIR, check=True)


def _run_dbt_materialized(context: OpExecutionContext) -> None:
    command = [
        "uv",
        "run",
        "dbt",
        "run",
        "--project-dir",
        str(DBT_PROJECT_DIR),
        "--profiles-dir",
        str(DBT_PROJECT_DIR),
    ]
    context.log.info("Running command: %s", " ".join(command))
    subprocess.run(command, cwd=DBT_PROJECT_DIR, check=True)


@asset(group_name="pokemon_data", kinds=["duckdb", "dlt"])
def dlt_ingest(context: OpExecutionContext) -> MaterializeResult:
    _run_step(context, "pipeline")
    return MaterializeResult(metadata={"step": "pipeline", "repo_root": str(REPO_ROOT)})


@asset(group_name="pokemon_data", kinds=["duckdb", "dbt", "seed"])
def dbt_seed(context: OpExecutionContext) -> MaterializeResult:
    _run_dbt_seed(context, "type_effectiveness")
    return MaterializeResult(metadata={"dbt_seed": "type_effectiveness"})


@asset(
    group_name="pokemon_data",
    kinds=["duckdb", "dbt", "sql"],
    deps=[dlt_ingest, dbt_seed],
)
def dbt_materialized(context: OpExecutionContext) -> MaterializeResult:
    _run_dbt_materialized(context)
    return MaterializeResult(metadata={"dbt": "materialized"})


@asset(group_name="pokemon_data", kinds=["json", "react"], deps=[dbt_materialized])
def export_dashboard_data(context: OpExecutionContext) -> MaterializeResult:
    _run_step(context, "export")
    return MaterializeResult(metadata={"step": "export"})


pokemon_data_job = define_asset_job(
    name="pokemon_data_job",
    selection=AssetSelection.assets(
        dlt_ingest,
        dbt_seed,
        dbt_materialized,
        export_dashboard_data,
    ),
)


daily_pokemon_data_schedule = ScheduleDefinition(
    job=pokemon_data_job,
    cron_schedule="0 2 * * *",
)


defs = Definitions(
    assets=[
        dlt_ingest,
        dbt_seed,
        dbt_materialized,
        export_dashboard_data,
    ],
    jobs=[pokemon_data_job],
    schedules=[daily_pokemon_data_schedule],
)
