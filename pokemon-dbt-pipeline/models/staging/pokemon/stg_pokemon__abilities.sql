SELECT 
    p.id as pokemon_id,
    a.ability__name as ability_name,
    a.is_hidden
FROM {{ source('raw_data', 'pokemon_details') }} p
JOIN {{ source('raw_data', 'pokemon_details__abilities') }} a 
    ON p._dlt_id = a._dlt_parent_id
