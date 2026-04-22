SELECT 
    id,
    name,
    damage_relations
FROM {{ source('raw_data', 'pokemon_types') }}
