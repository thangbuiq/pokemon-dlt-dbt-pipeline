SELECT 
    id,
    pokemon_id,
    (SELECT flavor_text FROM UNNEST(flavor_text_entries) WHERE language->>'name' = 'en' LIMIT 1) as flavor_text,
    (SELECT genus FROM UNNEST(genera) WHERE language->>'name' = 'en' LIMIT 1) as genus,
    color->>'name' as color,
    habitat->>'name' as habitat,
    capture_rate,
    base_happiness
FROM {{ source('raw_data', 'pokemon_species') }}
