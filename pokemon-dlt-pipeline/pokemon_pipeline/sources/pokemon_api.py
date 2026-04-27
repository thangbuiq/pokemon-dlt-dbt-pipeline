import json
from pathlib import Path

import dlt
from dlt.sources.helpers import requests

POKEMON_API_URL = "https://pokeapi.co/api/v2"


@dlt.source(max_table_nesting=2)
def pokemon_source(
    api_url: str = POKEMON_API_URL,
    pokemon_page_size: int = 200,
    pokemon_max_items: int | None = None,
    checkpoint_path: str | None = None,
    resume_from_checkpoint: bool = True,
):
    checkpoint_file = Path(checkpoint_path) if checkpoint_path else None

    def _read_checkpoint(default_offset: int) -> int:
        if not (
            checkpoint_file and resume_from_checkpoint and checkpoint_file.exists()
        ):
            return default_offset
        try:
            payload = json.loads(checkpoint_file.read_text())
            return int(payload.get("pokemon_next_offset", default_offset))
        except (json.JSONDecodeError, ValueError, TypeError):
            return default_offset

    def _write_checkpoint(offset_value: int) -> None:
        if not checkpoint_file:
            return
        checkpoint_file.parent.mkdir(parents=True, exist_ok=True)
        checkpoint_file.write_text(
            json.dumps({"pokemon_next_offset": int(offset_value)}, indent=2)
        )

    @dlt.resource(write_disposition="replace", selected=False)
    def pokemon_list():
        """Incrementally fetch Pokemon list via offset pagination."""
        state = dlt.current.resource_state()
        state_offset = (
            int(state.get("pokemon_next_offset", 0)) if pokemon_max_items is None else 0
        )
        offset = _read_checkpoint(state_offset) if pokemon_max_items is None else 0
        yielded_items = 0

        while True:
            if pokemon_max_items is None:
                limit = pokemon_page_size
            else:
                remaining_items = pokemon_max_items - yielded_items
                if remaining_items <= 0:
                    break
                limit = min(pokemon_page_size, remaining_items)

            response = requests.get(
                f"{api_url}/pokemon", params={"limit": limit, "offset": offset}
            ).json()

            total_count = response.get("count")
            if total_count is not None and offset >= total_count:
                state["pokemon_next_offset"] = int(total_count)
                _write_checkpoint(int(total_count))
                break

            results = response.get("results", [])
            if not results:
                break

            yield results

            offset += len(results)
            yielded_items += len(results)

            if pokemon_max_items is None:
                state["pokemon_next_offset"] = offset
                _write_checkpoint(offset)

            if response.get("next") is None:
                break

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
        offset = 0
        page_size = 100
        while True:
            response = requests.get(
                f"{api_url}/move", params={"limit": page_size, "offset": offset}
            ).json()
            results = response.get("results", [])
            if not results:
                break
            yield results
            offset += len(results)
            if response.get("next") is None:
                break

    @dlt.transformer(parallelized=True)
    def pokemon_moves(move_items):
        for m in move_items:
            yield requests.get(m["url"]).json()

    @dlt.resource(write_disposition="replace", selected=False)
    def evolution_chain_list():
        offset = 0
        page_size = 20
        while True:
            response = requests.get(
                f"{api_url}/evolution-chain",
                params={"limit": page_size, "offset": offset},
            ).json()
            results = response.get("results", [])
            if not results:
                break
            yield results
            offset += len(results)
            if response.get("next") is None:
                break

    @dlt.transformer(parallelized=True)
    def evolution_chains(chain_list):
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
