select chain_id, species_name, stage, evolves_from, evolution_trigger
from {{ ref("int_evolution__flattened") }}
order by chain_id, stage
