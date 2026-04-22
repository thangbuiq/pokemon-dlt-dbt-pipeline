-- Test: Total stats > 0 for all Pokemon
-- Returns rows where total_stats is 0 or NULL

SELECT
    id,
    name,
    total_stats
FROM {{ ref('dim_pokemon') }}
WHERE total_stats IS NULL OR total_stats <= 0
