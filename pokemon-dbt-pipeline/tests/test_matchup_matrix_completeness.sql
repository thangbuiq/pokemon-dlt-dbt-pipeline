-- Test: 18×18 = 324 rows in fct_type_matchup_matrix
-- Returns a row if the count is not 324
select actual_count, expected_count
from
    (
        select count(*) as actual_count, 324 as expected_count
        from {{ ref("fct_type_matchup_matrix") }}
    )
where actual_count != expected_count
