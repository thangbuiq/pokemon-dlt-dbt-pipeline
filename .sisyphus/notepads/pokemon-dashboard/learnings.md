## DuckDB Export Pipeline (Task 19)

### Pattern discovered

When using ATTACH with DuckDB, the alias name matters. Using `raw_data` as the alias conflicts with the schema name `raw_data`, causing "Table not found" errors.

### Solution

Use a different alias (e.g., `src`) when attaching, then reference as `src.raw_data.table_name`.

```python
conn.execute(f"ATTACH '{raw_db_path}' AS src (READ_ONLY)")
conn.execute("CREATE TABLE dim_pokemon AS SELECT * FROM src.raw_data.dim_pokemon")
```

### Tables successfully exported to pokemon.db

- dim_pokemon (20 rows)
- dim_pokemon_types (31 rows)
- dim_pokemon_stats (120 rows)
- dim_evolution_tree (40 rows)
- fct_evolution_paths (20 rows)

### Missing tables (not in raw.duckdb yet)

- fct_type_matchup_matrix (not created by dbt)
- dim_type_summary (not created by dbt)
