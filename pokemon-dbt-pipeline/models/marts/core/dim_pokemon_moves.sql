with
    deduped_moves as (
        select name, type__name, power, accuracy, pp, damage_class__name
        from {{ source("raw_data", "pokemon_moves") }}
        qualify row_number() over (partition by name order by _dlt_load_id desc) = 1
    )
select
    sm.pokemon_id,
    sm.move_name,
    dm.type__name as move_type,
    dm.power,
    dm.accuracy,
    dm.pp,
    dm.damage_class__name as damage_class
from {{ ref("stg_pokemon__moves") }} sm
left join deduped_moves dm on sm.move_name = dm.name
