-- Complete 18×18 type matchup matrix
-- Joins all type combinations with effectiveness data (defaulting to 1.0 for neutral)

WITH all_types AS (
    SELECT name as type_name
    FROM {{ ref('stg_types__base') }}
    WHERE id <= 18  -- Only main 18 types
),

all_combinations AS (
    SELECT 
        a.type_name as attacking_type,
        d.type_name as defending_type
    FROM all_types a
    CROSS JOIN all_types d
),

effectiveness_data AS (
    SELECT 
        attacking_type,
        defending_type,
        effectiveness
    FROM {{ ref('type_effectiveness') }}
)

SELECT 
    c.attacking_type,
    c.defending_type,
    COALESCE(e.effectiveness, 1.0) as effectiveness
FROM all_combinations c
LEFT JOIN effectiveness_data e 
    ON c.attacking_type = e.attacking_type 
    AND c.defending_type = e.defending_type
