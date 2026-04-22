-- Test: Only valid effectiveness values (0, 0.25, 0.5, 1, 2, 4)
-- Returns rows with invalid effectiveness values

SELECT
    attacking_type,
    defending_type,
    effectiveness
FROM {{ ref('fct_type_matchup_matrix') }}
WHERE effectiveness NOT IN (0, 0.25, 0.5, 1.0, 2.0, 4.0)
