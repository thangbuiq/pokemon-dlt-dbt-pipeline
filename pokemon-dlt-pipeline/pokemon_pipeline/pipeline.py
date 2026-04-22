import dlt

def create_pipeline():
    return dlt.pipeline(
        pipeline_name='pokemon_etl',
        destination=dlt.destinations.duckdb('../data/raw.duckdb'),
        dataset_name='raw_data',
        dev_mode=False
    )