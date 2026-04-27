-- Test: Only valid effectiveness values (0, 0.25, 0.5, 1, 2, 4)
-- Returns rows with invalid effectiveness values
select attacking_type, defending_type, effectiveness
from {{ ref("fct_type_matchup_matrix") }}
where effectiveness not in (0, 0.25, 0.5, 1.0, 2.0, 4.0)
