SELECT 
  chain_id,
  species_name,
  stage,
  evolves_from,
  evolution_trigger
FROM {{ ref('int_evolution__flattened') }}
ORDER BY chain_id, stage
