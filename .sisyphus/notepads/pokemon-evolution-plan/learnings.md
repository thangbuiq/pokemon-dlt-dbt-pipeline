Plan learnings:
- Implemented a three-file DBT evolution model: intermediate flatten, and two core marts for dimension and fact chains.
- Recursive CTE approach flattens nested evolution chains in a single pass; relies on JSON interpretation in source data.
- Edge cases to validate in tests: single-step evolutions, missing evolves_to arrays, and null evolution_details.
- Next: run dbt tests and validate edge cases; ensure Bulbasaur path resolves to Ivysaur and Venusaur.
