select
    evolves_from as from_pokemon,
    species_name as to_pokemon,
    evolution_trigger,
    chain_id
from {{ ref("int_evolution__flattened") }}
where evolves_from is not null
