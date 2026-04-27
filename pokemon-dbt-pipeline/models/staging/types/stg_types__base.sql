select distinct id, name from {{ source("raw_data", "pokemon_types") }}
