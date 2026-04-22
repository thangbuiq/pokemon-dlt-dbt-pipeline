"""
Data quality tests for Pokemon pipeline.
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
    return data_dir / "test_dq.duckdb"


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


class TestDataQuality:
    def test_pokemon_ids_are_sequential(self, test_db_path):
        run_test_pipeline(test_db_path, "pokemon_test_ids")

        conn = duckdb.connect(str(test_db_path))

        ids = conn.execute(
            "SELECT id FROM raw_data.pokemon_details ORDER BY id"
        ).fetchall()
        id_list = [row[0] for row in ids]

        expected_ids = list(range(1, 21))
        assert id_list == expected_ids, f"IDs not sequential: {id_list}"

        conn.close()
        cleanup_db_and_pipeline(test_db_path, "pokemon_test_ids")

    def test_all_pokemon_have_at_least_one_type(self, test_db_path):
        run_test_pipeline(test_db_path, "pokemon_test_types")

        conn = duckdb.connect(str(test_db_path))

        type_counts = conn.execute("""
            SELECT d.id, COUNT(t._dlt_parent_id) as type_count
            FROM raw_data.pokemon_details d
            LEFT JOIN raw_data.pokemon_details__types t ON d._dlt_id = t._dlt_parent_id
            GROUP BY d.id
        """).fetchall()

        for pokemon_id, type_count in type_counts:
            assert type_count >= 1, f"Pokemon {pokemon_id} has no types"

        conn.close()
        cleanup_db_and_pipeline(test_db_path, "pokemon_test_types")

    def test_all_pokemon_have_six_stats(self, test_db_path):
        run_test_pipeline(test_db_path, "pokemon_test_stats")

        conn = duckdb.connect(str(test_db_path))

        stat_counts = conn.execute("""
            SELECT d.id, COUNT(s._dlt_parent_id) as stat_count
            FROM raw_data.pokemon_details d
            LEFT JOIN raw_data.pokemon_details__stats s ON d._dlt_id = s._dlt_parent_id
            GROUP BY d.id
        """).fetchall()

        for pokemon_id, stat_count in stat_counts:
            assert stat_count == 6, (
                f"Pokemon {pokemon_id} has {stat_count} stats, expected 6"
            )

        conn.close()
        cleanup_db_and_pipeline(test_db_path, "pokemon_test_stats")

    def test_species_data_has_pokemon_id_foreign_key(self, test_db_path):
        run_test_pipeline(test_db_path, "pokemon_test_fk")

        conn = duckdb.connect(str(test_db_path))

        null_count = conn.execute("""
            SELECT COUNT(*) FROM raw_data.pokemon_species
            WHERE pokemon_id IS NULL
        """).fetchone()[0]

        assert null_count == 0, f"Found {null_count} species records without pokemon_id"

        species_count = conn.execute(
            "SELECT COUNT(DISTINCT pokemon_id) FROM raw_data.pokemon_species"
        ).fetchone()[0]

        assert species_count == 20, (
            f"Expected 20 distinct pokemon_ids in species, got {species_count}"
        )

        pokemon_ids = conn.execute(
            "SELECT id FROM raw_data.pokemon_details ORDER BY id"
        ).fetchall()
        pokemon_id_list = [row[0] for row in pokemon_ids]

        species_ids = conn.execute(
            "SELECT pokemon_id FROM raw_data.pokemon_species ORDER BY pokemon_id"
        ).fetchall()
        species_id_list = [row[0] for row in species_ids]

        assert pokemon_id_list == species_id_list, (
            "pokemon_id foreign keys don't match pokemon_details ids"
        )

        conn.close()
        cleanup_db_and_pipeline(test_db_path, "pokemon_test_fk")
