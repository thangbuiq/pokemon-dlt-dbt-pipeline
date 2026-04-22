SELECT 
    p.id as pokemon_id,
    t.type->>'name' as type_name,
    t.slot
FROM {{ source('raw_data', 'pokemon_details') }} p,
UNNEST(p.types) as t
