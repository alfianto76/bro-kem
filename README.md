# Authorized Movie Catalog API

Backend Node.js, TypeScript, and Express for movie metadata obtained from an API or feed you are authorized to use. It intentionally does not scrape piracy sites, extract video URLs, bypass access controls, or proxy copyrighted streams.

## Local development

```bash
cp .env.example .env
npm install
npm run dev
```

Without `CATALOG_API_URL`, the server uses a one-item demo catalog.

To scrape a public catalog page you own or are permitted to scrape, set:

```dotenv
SCRAPER_SOURCE_URL=https://catalog.example.com/latest
SCRAPER_ITEM_SELECTOR=article
```

Each matching item is expected to contain `h1`, `img`, and `p`. Relative poster URLs
are resolved against `SCRAPER_SOURCE_URL`; items without a title are skipped. The
scraper collects metadata only and does not discover or expose playback URLs.

Endpoints:

- `GET /health`
- `GET /api/movies`
- `GET /api/movies/search?q=sample`
- `GET /api/movies/:id`

## Authorized upstream contract

Set `CATALOG_API_URL` to an API you own or are licensed to consume. The adapter expects:

- `GET /movies` returning an array of movies
- `GET /movies/search?q=...` returning an array of movies
- `GET /movies/:id` returning one movie or HTTP 404

Example movie object:

```json
{
  "id": "movie-123",
  "title": "Example",
  "overview": "Synopsis",
  "year": 2026,
  "posterUrl": "https://cdn.example/poster.jpg",
  "backdropUrl": "https://cdn.example/backdrop.jpg",
  "genres": ["Drama"]
}
```

## Docker

```bash
docker compose up --build
```

The Compose service exposes port `5376` to Coolify's proxy without binding it
directly on the Docker host. For a direct local test, run:

```bash
docker build -t authorized-movie-catalog-api .
docker run --rm -p 5376:5376 authorized-movie-catalog-api
curl http://localhost:5376/health
```

## Coolify

1. Push the project to a Git repository.
2. In Coolify, create a new resource from that repository and select **Dockerfile**.
3. Configure container port `5376` and health-check path `/health`.
4. Add the variables from `.env.example`; set `CATALOG_API_URL` only to an authorized source.
5. Attach a domain and deploy.

The app listens on `0.0.0.0`, trusts one reverse-proxy hop, handles `SIGTERM`, and includes a Docker health check for rolling deployments.
