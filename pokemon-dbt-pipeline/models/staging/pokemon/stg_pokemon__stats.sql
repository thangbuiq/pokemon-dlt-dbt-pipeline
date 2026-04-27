select p.id as pokemon_id, s.stat__name as stat_name, s.base_stat
from {{ source("raw_data", "pokemon_details") }} p
join
    {{ source("raw_data", "pokemon_details__stats") }} s on p._dlt_id = s._dlt_parent_id
