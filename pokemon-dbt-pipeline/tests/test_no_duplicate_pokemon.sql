-- Test: Each Pokemon ID appears exactly once in dim_pokemon
-- Returns rows where a Pokemon ID appears more than once

SELECT
    id,
    COUNT(*) as row_count
FROM {{ ref('dim_pokemon') }}
GROUP BY id
HAVING COUNT(*) > 1
