-- Test: 18×18 = 324 rows in fct_type_matchup_matrix
-- Returns a row if the count is not 324

SELECT
    actual_count,
    expected_count
FROM (
    SELECT
        COUNT(*) as actual_count,
        324 as expected_count
    FROM {{ ref('fct_type_matchup_matrix') }}
)
WHERE actual_count != expected_count
