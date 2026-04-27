select distinct id, name, height, weight, sprites__front_default as sprite_url
from {{ source("raw_data", "pokemon_details") }}
