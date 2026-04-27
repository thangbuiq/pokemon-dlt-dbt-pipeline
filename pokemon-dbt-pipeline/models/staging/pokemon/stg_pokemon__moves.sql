with
    deduped_pokemon as (
        select id, _dlt_id
        from {{ source("raw_data", "pokemon_details") }}
        qualify row_number() over (partition by id order by _dlt_load_id desc) = 1
    )
select distinct p.id as pokemon_id, m.move__name as move_name
from deduped_pokemon p
join
    {{ source("raw_data", "pokemon_details__moves") }} m on p._dlt_id = m._dlt_parent_id
