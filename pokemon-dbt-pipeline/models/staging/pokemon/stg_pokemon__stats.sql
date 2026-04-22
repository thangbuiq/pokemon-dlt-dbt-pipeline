SELECT 
    p.id as pokemon_id,
    s.stat__name as stat_name,
    s.base_stat
FROM {{ source('raw_data', 'pokemon_details') }} p
JOIN {{ source('raw_data', 'pokemon_details__stats') }} s 
    ON p._dlt_id = s._dlt_parent_id
