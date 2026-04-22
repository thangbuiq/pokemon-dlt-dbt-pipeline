WITH type_agg AS (
  SELECT pokemon_id, GROUP_CONCAT(type_name) as type_names
  FROM {{ ref('stg_pokemon__types') }}
  GROUP BY pokemon_id
),
stat_pivot AS (
  SELECT pokemon_id,
    MAX(CASE WHEN stat_name = 'hp' THEN base_stat END) as hp,
    MAX(CASE WHEN stat_name = 'attack' THEN base_stat END) as attack,
    MAX(CASE WHEN stat_name = 'defense' THEN base_stat END) as defense,
    MAX(CASE WHEN stat_name = 'special-attack' THEN base_stat END) as special_attack,
    MAX(CASE WHEN stat_name = 'special-defense' THEN base_stat END) as special_defense,
    MAX(CASE WHEN stat_name = 'speed' THEN base_stat END) as speed
  FROM {{ ref('stg_pokemon__stats') }}
  GROUP BY pokemon_id
)
SELECT 
  p.id,
  p.name,
  p.height,
  p.weight,
  p.sprite_url,
  s.color,
  t.type_names,
  st.hp, st.attack, st.defense, st.special_attack, st.special_defense, st.speed,
  (st.hp + st.attack + st.defense + st.special_attack + st.special_defense + st.speed) as total_stats
FROM {{ ref('stg_pokemon__base') }} p
LEFT JOIN {{ ref('stg_species__base') }} s ON p.id = s.pokemon_id
LEFT JOIN type_agg t ON p.id = t.pokemon_id
LEFT JOIN stat_pivot st ON p.id = st.pokemon_id
