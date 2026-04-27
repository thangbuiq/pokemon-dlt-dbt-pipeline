select p.id as pokemon_id, a.ability__name as ability_name, a.is_hidden
from {{ source("raw_data", "pokemon_details") }} p
join
    {{ source("raw_data", "pokemon_details__abilities") }} a
    on p._dlt_id = a._dlt_parent_id
