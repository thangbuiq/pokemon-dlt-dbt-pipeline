SELECT 
    p.id as pokemon_id,
    a.ability->>'name' as ability_name,
    a.is_hidden
FROM {{ source('raw_data', 'pokemon_details') }} p,
UNNEST(p.abilities) as a
