import dlt
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from sources.pokemon_api import pokemon_source


def create_pipeline():
    return dlt.pipeline(
        pipeline_name="pokemon_etl",
        destination=dlt.destinations.duckdb("../data/raw.duckdb"),
        dataset_name="raw_data",
        dev_mode=False,
    )


def run_pipeline():
    pipeline = create_pipeline()
    load_info = pipeline.run(pokemon_source())
    print(load_info)
    return load_info


if __name__ == "__main__":
    run_pipeline()
