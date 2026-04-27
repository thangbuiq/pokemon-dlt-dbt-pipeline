-- Simplified evolution model using flattened columns
-- Evolution chains are flattened by dlt, we join parent with child tables
with
    stage1 as (
        select distinct
            on (ec.id)
            ec.id as chain_id,
            ec.chain__species__name as species_name,
            1 as stage,
            null::varchar as evolves_from,
            null::varchar as evolution_trigger
        from {{ source("raw_data", "evolution_chains") }} ec
        qualify row_number() over (partition by ec.id order by ec._dlt_load_id desc) = 1
    ),

    stage2 as (
        select distinct
            ec.id as chain_id,
            ev.species__name as species_name,
            2 as stage,
            ec.chain__species__name as evolves_from,
            null as evolution_trigger
        from {{ source("raw_data", "evolution_chains") }} ec
        join
            {{ source("raw_data", "evolution_chains__chain__evolves_to") }} ev
            on ec._dlt_id = ev._dlt_parent_id
    ),

    stage3 as (
        select distinct
            ec.id as chain_id,
            json_extract_string(ev3.species, '$.name') as species_name,
            3 as stage,
            ev2.species__name as evolves_from,
            null as evolution_trigger
        from {{ source("raw_data", "evolution_chains") }} ec
        join
            {{ source("raw_data", "evolution_chains__chain__evolves_to") }} ev2
            on ec._dlt_id = ev2._dlt_parent_id
        join
            {{ source("raw_data", "evolution_chains__chain__evolves_to__evolves_to") }} ev3
            on ev2._dlt_id = ev3._dlt_parent_id
        where json_extract_string(ev3.species, '$.name') is not null
    )

select *
from stage1
union all
select *
from stage2
union all
select *
from stage3
