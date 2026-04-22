SELECT 
    p.id as pokemon_id,
    t.type__name as type_name,
    t.slot
FROM {{ source('raw_data', 'pokemon_details') }} p
JOIN {{ source('raw_data', 'pokemon_details__types') }} t 
    ON p._dlt_id = t._dlt_parent_id
