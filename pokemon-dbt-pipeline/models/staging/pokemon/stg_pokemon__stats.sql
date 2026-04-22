SELECT 
    p.id as pokemon_id,
    s.stat->>'name' as stat_name,
    s.base_stat
FROM {{ source('raw_data', 'pokemon_details') }} p,
UNNEST(p.stats) as s
