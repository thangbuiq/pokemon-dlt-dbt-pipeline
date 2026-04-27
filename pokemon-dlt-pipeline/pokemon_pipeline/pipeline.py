import dlt
from pokemon_pipeline.sources.pokemon_api import pokemon_source


def create_pipeline():
    return dlt.pipeline(
        pipeline_name="pokemon_etl",
        destination=dlt.destinations.duckdb("../data/raw.duckdb"),
        dataset_name="raw_data",
        dev_mode=False,
    )


def run_pipeline(
    checkpoint_path: str | None = "../data/pokemon_offset_checkpoint.json",
    resume_from_checkpoint: bool = True,
):
    pipeline = create_pipeline()
    load_info = pipeline.run(
        pokemon_source(
            checkpoint_path=checkpoint_path,
            resume_from_checkpoint=resume_from_checkpoint,
        )
    )
    print(load_info)
    return load_info


if __name__ == "__main__":
    run_pipeline()
