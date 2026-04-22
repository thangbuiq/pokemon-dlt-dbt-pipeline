"""
Tests for dlt transformers and parallel execution.
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
    return data_dir / "test_transformers.duckdb"


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
        dataset_name='raw_data',
        dev_mode=False
    )
    
    load_info = pipeline.run(pokemon_source())
    return load_info, pipeline


class TestTransformers:
    def test_defer_parallel_execution(self, test_db_path):
        load_info, pipeline = run_test_pipeline(test_db_path, "pokemon_test_defer")
        
        assert load_info is not None
        assert len(load_info.load_packages) > 0
        
        conn = duckdb.connect(str(test_db_path))
        count = conn.execute("SELECT COUNT(*) FROM raw_data.pokemon_details").fetchone()[0]
        assert count == 20
        conn.close()
        
        cleanup_db_and_pipeline(test_db_path, "pokemon_test_defer")
    
    def test_selected_false_prevents_loading(self, test_db_path):
        run_test_pipeline(test_db_path, "pokemon_test_selected")
        
        conn = duckdb.connect(str(test_db_path))
        
        unselected_tables = ['pokemon_list', 'type_list', 'ability_list', 'move_list', 'evolution_chain_list']
        
        for table in unselected_tables:
            result = conn.execute(f"""
                SELECT COUNT(*) FROM information_schema.tables 
                WHERE table_schema = 'raw_data' AND table_name = '{table}'
            """).fetchone()
            assert result[0] == 0, f"{table} should not exist (selected=False)"
        
        conn.close()
        cleanup_db_and_pipeline(test_db_path, "pokemon_test_selected")
    
    def test_pipe_operator_chains_correctly(self, test_db_path):
        run_test_pipeline(test_db_path, "pokemon_test_pipe")
        
        conn = duckdb.connect(str(test_db_path))
        
        pokemon_count = conn.execute("SELECT COUNT(*) FROM raw_data.pokemon_details").fetchone()[0]
        species_count = conn.execute("SELECT COUNT(*) FROM raw_data.pokemon_species").fetchone()[0]
        
        assert pokemon_count == 20, f"Expected 20 pokemon_details, got {pokemon_count}"
        assert species_count == 20, f"Expected 20 pokemon_species, got {species_count}"
        
        species_with_pokemon_id = conn.execute(
            "SELECT COUNT(*) FROM raw_data.pokemon_species WHERE pokemon_id IS NOT NULL"
        ).fetchone()[0]
        assert species_with_pokemon_id == 20, f"Expected 20 species with pokemon_id, got {species_with_pokemon_id}"
        
        conn.close()
        cleanup_db_and_pipeline(test_db_path, "pokemon_test_pipe")
    
    def test_parallelized_transformer_attribute(self, test_db_path):
        run_test_pipeline(test_db_path, "pokemon_test_parallel")
        
        conn = duckdb.connect(str(test_db_path))
        
        for table in ['pokemon_types', 'pokemon_abilities', 'pokemon_moves']:
            count = conn.execute(f"SELECT COUNT(*) FROM raw_data.{table}").fetchone()[0]
            assert count == 20, f"Expected 20 rows in {table}, got {count}"
        
        conn.close()
        cleanup_db_and_pipeline(test_db_path, "pokemon_test_parallel")
