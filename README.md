<!-- markdownlint-disable -->

<div align="center">
  <img src="pokemon-dashboard-app/public/pokeball.png" alt="Pokédex Pipeline" width="120" />

# NextGen Pokédex - pokedexgen

**A modern approach to the Pokédex, gotta catch 'em all with data-driven insights!**

[![Pipeline Status](https://github.com/thangbuiq/pokedexgen/actions/workflows/ci.yml/badge.svg)](#)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
![GitHub Stars](https://img.shields.io/github/stars/thangbuiq/pokemon-dlt-dbt-pipeline?style=social)

</div>

---

## why this project slaps

Yeah, yeah, there are a ton of Pokédex apps. But how many actually go hard with a modern data stack and clean, reliable data source? Exactly.

This isn’t just a Pokédex, it’s your all-in-one battle HQ: deep stats, slick team builder, and a type matchup matrix that actually helps you win more Pokemon games. No more endless scrolling or tab-hopping.

<div align="center">
  <img src=".github/assets/banner.png" alt="Pokédexgen banner" width="50%" />
</div>

## features that slaps

- **Pokedex Search**: Find any Pokemon in a flash with detailed stats, radar chart, evolution chain, and more

<div>
  <img src=".github/assets/pokedex-search.png" width="49%" />
  <img src=".github/assets/pokedex-search-detailed.png" width="49%" />
</div>

- **Team Builder And Coverage Analysis**: Build your dream team and analyze type coverage

<div>
  <img src=".github/assets/team-builder.png" width="49%" />
  <img src=".github/assets/team-analysis.png" width="49%" />
</div>

- **Mini Features**

<table>
  <tr>
    <td width="49%" valign="top">
      <strong>Who's That Pokemon?</strong><br/>
      Classic silhouette guessing game that never gets old.<br/><br/>
      <img src=".github/assets/whos-that-pokemon.png" width="100%" />
    </td>
    <td width="49%" valign="top">
      <strong>Pokemon Origins</strong><br/>
      Dive into lore, generations, and legendary status of your favorite Pokémon.<br/><br/>
      <img src=".github/assets/origins.png" width="100%" />
    </td>
  </tr>
</table>

## Motivation why I built this

My work basically goes around building data-related things. But the data that we work with at work is... well, it's not exactly the most exciting data in the world. It's business data, which was SUPER MEGA boring, so it was hard to get excited about building cool dashboards or writing the transformations that I actually not care about. I wanted to build something tha smile every time I opened it.

So one Sunday I asked myself - what if I just built something I actually wanted to look at? And then I look at the Nintendo Switch on my desk. I've just remembered that I have a childhood obsession with Pokémon, and I used to spend 8 hours/day playing Pokémon games when I was a kid, so I thought - why not build a Pokémon dashboard? Because I grew up with Pokémon, and I work with data pipelines when I grow up, somewhere between those two facts (very randomly), this project was born.

It's not that deep. I wanted to play with tools I liked, on data I actually cared about, with a UI that looked cool. No stakeholders. No Jira tickets. No one asking me to change the color of a bar chart.
Just me, a free API, and the completely unnecessary but deeply satisfying goal of making my inside 10-year-old self proud.

Sometimes the best reason to build something is that you genuinely want it to exist.

> tl;dr - I built this for fun, to learn, and to have a cool dashboard that I actually wanted to use. No other reason than that.

## project flow

okay, enough of the backstory. Let's talk about how this thing actually works.

![architecture](.github/assets/architecture.png)

and the dagster orchestration looks like this:

![dagster](.github/assets/dagster.png)

after the data is ingested and transformed, we materialize the mart layer into static JSON files that the Next.js frontend consumes. thanks [motherduck](https://motherduck.com/) for making it easy to query DuckDB data directly from the UI with [`duckdb cli`](https://duckdb.org/docs/current/core_extensions/ui).

![sample-data](.github/assets/duckdb.png)

## monorepo Structure

```
pokemon-dlt-dbt-pipeline/
├── pokemon-dlt-pipeline/     # Data ingestion with dlt
├── pokemon-dbt-pipeline/     # Transformations with dbt
├── pokemon-dashboard-app/    # Next.js 16 + static JSON data
├── pokemon-dagster-app/      # Dagster orchestration
└── data/                     # DuckDB storage, ignored in git
```

## Tech Stack

| Layer         | Technology                                         |
| ------------- | -------------------------------------------------- |
| Ingestion     | [dlt](https://dlthub.com), Python                  |
| Storage       | [DuckDB](https://duckdb.org)                       |
| Transform     | [dbt-duckdb](https://github.com/duckdb/dbt-duckdb) |
| Frontend      | [Next.js 16](https://nextjs.org), React            |
| Data Delivery | Static JSON files materialized from DuckDB marts   |
| Styling       | Tailwind CSS                                       |
| Task Runner   | [Just](https://just.systems)                       |

## Quickstart

### Prerequisites

- [Python 3.11+](https://python.org)
- [uv](https://github.com/astral-sh/uv) (Python package manager)
- [bun](https://bun.sh) (JavaScript runtime)
- [just](https://just.systems) (Task runner)
- [Node.js 18+](https://nodejs.org) (for Vercel CLI)

### Installation

```bash
git clone https://github.com/thangbuiq/pokemon-dlt-dbt-pipeline
cd pokemon-dlt-dbt-pipeline
just install
```

### Run the Pipeline

```bash
just data # Run the entire data pipeline (ingest, transform, export)

# Or run individual steps
just pipeline    # Extract data from PokeAPI
just transform   # Run dbt transformations
just export      # Materialize mart layer to JSON files
```

### Dagster Orchestration

```bash
# Start Dagster UI
just dagster

# One-shot materialization (pipeline -> transform -> export)
just dagster-materialize
```

Dagster project is in `pokemon-dagster-app/` and includes a daily schedule for
`pokemon_data_job`.

Incremental dlt note (short): `pokemon_list` now paginates by `offset` and
stores the latest cursor in `data/pokemon_offset_checkpoint.json`, so the next
run resumes from the saved offset instead of re-reading from the first page.

### Development

```bash
# Start the dashboard
just dashboard   # Opens http://localhost:3000

# build the dashboard for production
just build
```

## Contributing

Contributions are welcome! Whether it's a bug fix, new feature, or documentation improvement-help make this project better.

## License

MIT License - see [LICENSE](LICENSE) for details.
