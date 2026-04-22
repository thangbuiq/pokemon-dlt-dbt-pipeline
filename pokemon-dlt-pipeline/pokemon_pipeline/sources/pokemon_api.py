import dlt
from dlt.sources.helpers import requests

POKEMON_API_URL = "https://pokeapi.co/api/v2"

@dlt.source(max_table_nesting=2)
def pokemon_source(api_url: str = POKEMON_API_URL):
    # TODO: Implement in Task 8
    pass