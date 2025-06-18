# Kawihlogy

## Description

Kawihlogy is a backend service that transforms daily journal entries into poetry, then brings those poems to life through spoken audio.
Using advanced language models, it generates expressive poems from your personal reflections and converts them into natural-sounding speech.

## Core Features

- Submit a journal entry about your day
- Automatically generate a poem from your writing
- Listen to the poem as narrated audio
- Designed for emotional reflection, self-expression, and creative journaling

Kawihlogy turns everyday thoughts into poetic experiences.

## Project Setup & Usage

### Prerequisites

Make sure you have Docker and pnpm installed on your system. Copy the `.env.example` file to `.env` and fill in the required environment variables.

```bash
$ pnpm install
```

### Running the Services

Start the required services (PostgreSQL, Redis, PgAdmin) using Docker Compose:

```bash
$ docker compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Redis server on port 6379
- PgAdmin interface on port 8080

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## License

This project is [MIT licensed]().
