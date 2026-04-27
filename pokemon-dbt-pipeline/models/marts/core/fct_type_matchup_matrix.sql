-- Complete 18×18 type matchup matrix
-- Joins all type combinations with effectiveness data (defaulting to 1.0 for neutral)
with
    all_types as (
        select name as type_name from {{ ref("stg_types__base") }} where id <= 18  -- Only main 18 types
    ),

    all_combinations as (
        select a.type_name as attacking_type, d.type_name as defending_type
        from all_types a
        cross join all_types d
    ),

    effectiveness_data as (
        select attacking_type, defending_type, effectiveness
        from {{ ref("type_effectiveness") }}
    )

select
    c.attacking_type, c.defending_type, coalesce(e.effectiveness, 1.0) as effectiveness
from all_combinations c
left join
    effectiveness_data e
    on c.attacking_type = e.attacking_type
    and c.defending_type = e.defending_type
