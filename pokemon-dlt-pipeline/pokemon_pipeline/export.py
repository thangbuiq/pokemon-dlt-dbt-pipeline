import duckdb
import os

def export_pokemon_db():
    raw_db_path = '../data/raw.duckdb'
    curated_db_path = '../data/curated.duckdb'
    export_db_path = '../data/pokemon.db'

    conn = duckdb.connect(export_db_path)

    conn.execute(f"ATTACH '{raw_db_path}' AS raw_db (READ_ONLY)")
    conn.execute(f"ATTACH '{curated_db_path}' AS curated_db (READ_ONLY)")

    tables_to_export = [
        'dim_pokemon',
        'dim_pokemon_types',
        'dim_pokemon_stats',
        'fct_type_matchup_matrix',
        'dim_evolution_tree',
        'fct_evolution_paths',
        'dim_type_summary'
    ]

    for table in tables_to_export:
        try:
            conn.execute(f"CREATE TABLE {table} AS SELECT * FROM curated_db.{table}")
            print(f"Exported: {table}")
        except Exception as e:
            print(f"Skipped {table}: {e}")

    try:
        conn.execute("CREATE TABLE pokemon_sprites AS SELECT id, name, sprites FROM raw_db.pokemon")
        print("Exported: pokemon_sprites")
    except Exception as e:
        print(f"Skipped pokemon_sprites: {e}")

    conn.execute("ANALYZE")

    conn.close()

    size_mb = os.path.getsize(export_db_path) / (1024 * 1024)
    print(f"Exported to {export_db_path} ({size_mb:.2f} MB)")

    if size_mb > 100:
        print("WARNING: File size exceeds 100MB Vercel limit!")

    return export_db_path

if __name__ == '__main__':
    export_pokemon_db()
