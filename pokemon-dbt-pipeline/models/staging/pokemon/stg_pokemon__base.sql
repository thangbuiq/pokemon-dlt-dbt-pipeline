SELECT DISTINCT
    id,
    name,
    height,
    weight,
    sprites__front_default as sprite_url
FROM {{ source('raw_data', 'pokemon_details') }}
