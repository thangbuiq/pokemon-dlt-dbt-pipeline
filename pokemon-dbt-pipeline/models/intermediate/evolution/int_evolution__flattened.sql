-- Simplified evolution model using flattened columns
-- Evolution chains are flattened by dlt, we join parent with child tables

SELECT 
    ec.id as chain_id,
    ec.chain__species__name as species_name,
    1 as stage,
    NULL as evolves_from,
    NULL as evolution_trigger
FROM {{ source('raw_data', 'evolution_chains') }} ec

UNION ALL

SELECT 
    ec.id as chain_id,
    ev.species__name as species_name,
    2 as stage,
    ec.chain__species__name as evolves_from,
    NULL as evolution_trigger
FROM {{ source('raw_data', 'evolution_chains') }} ec
JOIN {{ source('raw_data', 'evolution_chains__chain__evolves_to') }} ev
    ON ec._dlt_id = ev._dlt_parent_id
