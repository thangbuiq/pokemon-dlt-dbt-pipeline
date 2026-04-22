import duckdb
import os
from pathlib import Path


def export_pokemon_db():
    script_dir = Path(__file__).parent
    data_dir = script_dir.parent.parent / "data"
    raw_db_path = data_dir / "raw.duckdb"
    export_db_path = data_dir / "pokemon.db"

    print(f"Source: {raw_db_path}")
    print(f"Target: {export_db_path}")

    if export_db_path.exists():
        os.remove(export_db_path)
        print(f"Removed existing: {export_db_path}")

    conn = duckdb.connect(str(export_db_path))
    conn.execute(f"ATTACH '{raw_db_path}' AS src (READ_ONLY)")

    tables_to_export = [
        "dim_pokemon",
        "dim_pokemon_types",
        "dim_pokemon_stats",
        "dim_evolution_tree",
        "fct_evolution_paths",
        "pokemon_abilities",
        "pokemon_abilities__effect_entries",
        "pokemon_abilities__pokemon",
        "pokemon_abilities__names",
        "pokemon_details__abilities",
        "pokemon_moves",
        "pokemon_moves__effect_entries",
        "pokemon_moves__names",
    ]

    exported_count = 0
    for table in tables_to_export:
        try:
            exists = conn.execute(
                f"SELECT 1 FROM duckdb_tables() WHERE schema_name = 'raw_data' AND table_name = '{table}'"
            ).fetchone()
            if exists:
                conn.execute(
                    f"CREATE TABLE {table} AS SELECT * FROM src.raw_data.{table}"
                )
                count = conn.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
                print(f"  Exported: {table} ({count} rows)")
                exported_count += 1
            else:
                print(f"  Skipped: {table} (not found)")
        except Exception as e:
            print(f"  Error exporting {table}: {e}")

    conn.execute("ANALYZE")
    conn.close()

    if export_db_path.exists():
        size_mb = os.path.getsize(export_db_path) / (1024 * 1024)
        print(
            f"\nExport complete: {exported_count} tables -> {export_db_path} ({size_mb:.2f} MB)"
        )
    else:
        print("\nExport failed: pokemon.db not created")

    return export_db_path


if __name__ == "__main__":
    export_pokemon_db()
