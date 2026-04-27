-- Test: Each Pokemon ID appears exactly once in dim_pokemon
-- Returns rows where a Pokemon ID appears more than once
select id, count(*) as row_count
from {{ ref("dim_pokemon") }}
group by id
having count(*) > 1
