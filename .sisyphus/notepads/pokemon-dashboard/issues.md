# Issues and Fixes

## 2026-04-22: dbt Staging Model Fix

**Problem**: dlt pipeline with `max_table_nesting=2` created separate child tables instead of nested arrays.

**Models affected**:

- stg_pokemon\_\_types.sql
- stg_pokemon\_\_stats.sql
- stg_pokemon\_\_abilities.sql
- stg_pokemon\_\_base.sql
- stg_species\_\_base.sql
- stg_types\_\_base.sql
- int_evolution\_\_flattened.sql
- int_pokemon\_\_enriched.sql

**Solution**:

1. Join parent table with child tables on `_dlt_id = _dlt_parent_id`
2. Use flattened column names (double underscore): `type__name` instead of `type->>'name'`
3. Add child table sources to sources.yml

**Pattern**:

```sql
SELECT
    p.id as pokemon_id,
    t.type__name as type_name
FROM {{ source('raw_data', 'pokemon_details') }} p
JOIN {{ source('raw_data', 'pokemon_details__types') }} t
    ON p._dlt_id = t._dlt_parent_id
```
