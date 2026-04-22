SELECT DISTINCT
    id,
    name
FROM {{ source('raw_data', 'pokemon_types') }}
