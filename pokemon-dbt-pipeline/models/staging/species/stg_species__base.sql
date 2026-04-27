select distinct id, pokemon_id, color__name as color, capture_rate, base_happiness
from {{ source("raw_data", "pokemon_species") }}
