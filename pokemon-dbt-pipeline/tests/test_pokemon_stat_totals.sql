-- Test: Total stats > 0 for all Pokemon
-- Returns rows where total_stats is 0 or NULL
select id, name, total_stats
from {{ ref("dim_pokemon") }}
where total_stats is null or total_stats <= 0
