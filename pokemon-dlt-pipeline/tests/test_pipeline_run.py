"""
Integration tests for the Pokemon pipeline.
Tests run against real PokeAPI and verify data in DuckDB.
"""

import os
import sys
from pathlib import Path
import pytest
import duckdb
import dlt
import shutil

sys.path.insert(0, str(Path(__file__).parent.parent))

from pokemon_pipeline.sources.pokemon_api import pokemon_source


@pytest.fixture
def test_db_path():
    data_dir = Path(__file__).parent.parent / "data"
    data_dir.mkdir(exist_ok=True)
    return data_dir / "test_raw.duckdb"


def cleanup_db_and_pipeline(test_db_path, pipeline_name):
    if test_db_path.exists():
        os.remove(test_db_path)

    pipeline_dir = Path.home() / ".dlt" / "pipelines" / pipeline_name
    if pipeline_dir.exists():
        shutil.rmtree(pipeline_dir)


def run_test_pipeline(test_db_path, pipeline_name):
    cleanup_db_and_pipeline(test_db_path, pipeline_name)

    pipeline = dlt.pipeline(
        pipeline_name=pipeline_name,
        destination=dlt.destinations.duckdb(str(test_db_path)),
        dataset_name="raw_data",
        dev_mode=False,
    )

    load_info = pipeline.run(pokemon_source())
    return load_info, pipeline


class TestPipelineRun:
    def test_database_created(self, test_db_path):
        run_test_pipeline(test_db_path, "pokemon_test_db_created")

        assert test_db_path.exists(), "Database file was not created"

        cleanup_db_and_pipeline(test_db_path, "pokemon_test_db_created")

    def test_all_six_tables_exist_with_20_rows(self, test_db_path):
        run_test_pipeline(test_db_path, "pokemon_test_tables")

        conn = duckdb.connect(str(test_db_path))

        expected_tables = [
            "pokemon_details",
            "pokemon_species",
            "pokemon_types",
            "pokemon_abilities",
            "pokemon_moves",
            "evolution_chains",
        ]

        for table in expected_tables:
            result = conn.execute(f"""
                SELECT COUNT(*) FROM information_schema.tables
                WHERE table_schema = 'raw_data' AND table_name = '{table}'
            """).fetchone()
            assert result[0] == 1, f"Table {table} does not exist"

            count = conn.execute(f"SELECT COUNT(*) FROM raw_data.{table}").fetchone()[0]
            assert count == 20, f"Table {table} has {count} rows, expected 20"

        conn.close()
        cleanup_db_and_pipeline(test_db_path, "pokemon_test_tables")

    def test_pokemon_list_not_in_database(self, test_db_path):
        run_test_pipeline(test_db_path, "pokemon_test_list")

        conn = duckdb.connect(str(test_db_path))

        result = conn.execute("""
            SELECT COUNT(*) FROM information_schema.tables
            WHERE table_schema = 'raw_data' AND table_name = 'pokemon_list'
        """).fetchone()

        assert result[0] == 0, "pokemon_list table should not exist (selected=False)"

        conn.close()
        cleanup_db_and_pipeline(test_db_path, "pokemon_test_list")

    def test_pokemon_details_has_expected_fields(self, test_db_path):
        run_test_pipeline(test_db_path, "pokemon_test_fields")

        conn = duckdb.connect(str(test_db_path))

        columns = conn.execute("""
            SELECT column_name FROM information_schema.columns
            WHERE table_schema = 'raw_data' AND table_name = 'pokemon_details'
        """).fetchall()
        column_names = [col[0] for col in columns]

        assert "id" in column_names, "pokemon_details missing 'id' field"
        assert "name" in column_names, "pokemon_details missing 'name' field"

        result = conn.execute("""
            SELECT COUNT(*) FROM information_schema.tables
            WHERE table_schema = 'raw_data' AND table_name = 'pokemon_details__types'
        """).fetchone()
        assert result[0] == 1, "pokemon_details__types child table does not exist"

        result = conn.execute("""
            SELECT COUNT(*) FROM information_schema.tables
            WHERE table_schema = 'raw_data' AND table_name = 'pokemon_details__stats'
        """).fetchone()
        assert result[0] == 1, "pokemon_details__stats child table does not exist"

        row = conn.execute("""
            SELECT id, name
            FROM raw_data.pokemon_details
            WHERE id = 1
        """).fetchone()

        assert row is not None, "No Pokemon with id=1 found"
        assert row[0] == 1, "ID should be 1"
        assert row[1] == "bulbasaur", f"Name should be 'bulbasaur', got '{row[1]}'"

        conn.close()
        cleanup_db_and_pipeline(test_db_path, "pokemon_test_fields")
