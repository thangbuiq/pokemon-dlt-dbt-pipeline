select p.id as pokemon_id, t.type__name as type_name, t.slot
from {{ source("raw_data", "pokemon_details") }} p
join
    {{ source("raw_data", "pokemon_details__types") }} t on p._dlt_id = t._dlt_parent_id
