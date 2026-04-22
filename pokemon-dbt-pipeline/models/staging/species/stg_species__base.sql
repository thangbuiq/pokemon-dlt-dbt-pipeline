SELECT DISTINCT
    id,
    pokemon_id,
    color__name as color,
    capture_rate,
    base_happiness
FROM {{ source('raw_data', 'pokemon_species') }}
