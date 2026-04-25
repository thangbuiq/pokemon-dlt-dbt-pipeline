import dlt
from dlt.sources.helpers import requests

POKEMON_API_URL = "https://pokeapi.co/api/v2"


@dlt.source(max_table_nesting=2)
def pokemon_source(api_url: str = POKEMON_API_URL):
    @dlt.resource(write_disposition="replace", selected=False)
    def pokemon_list():
        """All Pokemon - NOT loaded, used as input to transformers"""
        yield requests.get(f"{api_url}/pokemon?limit=1500").json()["results"]

    @dlt.transformer
    def pokemon_details(pokemons):
        """Fetch Pokemon details in parallel using @dlt.defer"""

        @dlt.defer
        def _get_pokemon(p):
            return requests.get(p["url"]).json()

        for p in pokemons:
            yield _get_pokemon(p)

    @dlt.transformer(parallelized=True)
    def pokemon_species(pokemon_details):
        """Fetch species details for each Pokemon"""
        species_data = requests.get(pokemon_details["species"]["url"]).json()
        species_data["pokemon_id"] = pokemon_details["id"]
        return species_data

    @dlt.resource(write_disposition="replace", selected=False)
    def type_list():
        """First page of Types"""
        yield requests.get(f"{api_url}/type").json()["results"]

    @dlt.transformer(parallelized=True)
    def pokemon_types(type_items):
        """Fetch type details"""
        for t in type_items:
            yield requests.get(t["url"]).json()

    @dlt.resource(write_disposition="replace", selected=False)
    def ability_list():
        """First page of Abilities"""
        yield requests.get(f"{api_url}/ability").json()["results"]

    @dlt.transformer(parallelized=True)
    def pokemon_abilities(ability_items):
        """Fetch ability details"""
        for a in ability_items:
            yield requests.get(a["url"]).json()

    @dlt.resource(write_disposition="replace", selected=False)
    def move_list():
        """First page of Moves"""
        yield requests.get(f"{api_url}/move").json()["results"]

    @dlt.transformer(parallelized=True)
    def pokemon_moves(move_items):
        """Fetch move details"""
        for m in move_items:
            yield requests.get(m["url"]).json()

    @dlt.resource(write_disposition="replace", selected=False)
    def evolution_chain_list():
        """First page of Evolution Chains"""
        yield requests.get(f"{api_url}/evolution-chain").json()["results"]

    @dlt.transformer(parallelized=True)
    def evolution_chains(chain_list):
        """Fetch evolution chain details"""
        for chain in chain_list:
            yield requests.get(chain["url"]).json()

    return (
        pokemon_list | pokemon_details,
        pokemon_list | pokemon_details | pokemon_species,
        type_list | pokemon_types,
        ability_list | pokemon_abilities,
        move_list | pokemon_moves,
        evolution_chain_list | evolution_chains,
    )
