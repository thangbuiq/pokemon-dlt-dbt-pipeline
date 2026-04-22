SELECT 
  evolves_from as from_pokemon,
  species_name as to_pokemon,
  evolution_trigger,
  chain_id
FROM {{ ref('int_evolution__flattened') }}
WHERE evolves_from IS NOT NULL
