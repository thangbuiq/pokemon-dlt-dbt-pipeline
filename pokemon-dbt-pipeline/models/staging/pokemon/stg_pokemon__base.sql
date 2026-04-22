SELECT 
    id,
    name,
    height,
    weight,
    sprites->>'front_default' as sprite_url
FROM {{ source('raw_data', 'pokemon_details') }}
