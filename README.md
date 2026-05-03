# GitHub Search

A web application for searching GitHub users and repositories, with server-side
caching.

## Backend

### Tech Stack

- **Django 6 + Django REST Framework** - API layer
- **adrf** - async view support for Django
- **httpx** - async HTTP client for GitHub API calls
- **django-redis** - Redis-backed cache
- **drf-spectacular** - OpenAPI 3 schema generation
- **pydantic-settings** - environment variable management
- **uv** - dependency management and runner

### Architecture

The backend is a lightweight async Django application with no database. All
persistence is through Redis cache only.

```
config/          Django project settings, URL routing, env vars
github_search/
  views.py       Two API endpoints: search and cache clear
  services.py    GitHub API calls + user enrichment logic
  serializers.py Request validation
  schemas.py     Response serializers (also used for OpenAPI docs)
  utils.py       Cache key generation, error parsing, request headers
  constants.py   TTL, concurrency limit, query qualifiers
  enums.py       SearchType enum (users / repositories)
```

### API Endpoints

| Method | Path               | Description                         |
| ------ | ------------------ | ----------------------------------- |
| `POST` | `/api/search`      | Search GitHub users or repositories |
| `POST` | `/api/clear-cache` | Invalidate all cached results       |
| `GET`  | `/api/docs/`       | Swagger UI                          |
| `GET`  | `/api/schema/`     | OpenAPI YAML schema                 |

#### POST `/api/search`

```json
{ "type": "users", "search": "torvalds" }
{ "type": "repositories", "search": "django" }
```

Returns `{ "data": { "total_count": ..., "items": [...] } }` on success, or
`{ "error": "..." }` on GitHub API failure.

#### POST `/api/clear-cache`

Requires `X-Cache-Token` header matching the `CACHE_CLEAR_TOKEN` environment
variable. Uses `hmac.compare_digest` for timing-safe comparison.

### Key Decisions

**Async views with adrf** GitHub API calls are I/O-bound. Using `async def`
views with `httpx.AsyncClient` avoids blocking threads and allows concurrent
enrichment requests within a single view call.

**User enrichment with semaphore** When searching users, the GitHub search API
returns minimal data. Each user's full profile (name, location) is fetched via a
separate `/users/{login}` call. These run concurrently with `asyncio.gather`,
limited by a semaphore (`USER_ENRICH_CONCURRENCY = 5`) to avoid hitting GitHub's
secondary rate limits. A single failed enrichment sets `name` and `location` to
`null` without cancelling the others.

**Server-side qualifier stripping** GitHub's query syntax allows qualifiers like
`type:org`, `in:email`, `followers:>1000` that could be used to bypass the
intended search scope. Rather than rejecting such queries with an error, the
server silently strips forbidden qualifiers before forwarding the query to
GitHub. A `ValidationError` is raised only if the cleaned query falls below the
minimum length.

**Cache key normalization** Cache keys are MD5 hashes of
`{type}:{normalized_query}`. The query is lowercased and whitespace-normalized
before hashing, so `" React "` and `"react"` resolve to the same cache entry.
Keys are prefixed with `github_search:v1:` to allow pattern-based invalidation
via `delete_pattern`.

**DRF serializers for response schema** Response shapes are defined as DRF
`Serializer` classes. This serves two purposes: it validates and serializes
GitHub API responses, and it is picked up automatically by `drf-spectacular` to
generate accurate OpenAPI documentation without manual schema annotation.

**No database** The application does not require a database. Django's
ORM-dependent apps (`django.contrib.auth`, `django.contrib.contenttypes`) are
included only because some DRF internals expect them; no migrations are needed.

### Environment Variables

| Variable               | Description                                               |
| ---------------------- | --------------------------------------------------------- |
| `SECRET_KEY`           | Django secret key                                         |
| `DEBUG`                | Django debug mode                                         |
| `ALLOWED_HOSTS`        | Comma-separated allowed hosts                             |
| `GITHUB_TOKEN`         | GitHub personal access token (requires no special scopes) |
| `REDIS_URL`            | Redis connection URL                                      |
| `CACHE_CLEAR_TOKEN`    | Shared secret for the cache clear endpoint                |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed CORS origins                      |

### Running Locally

```bash
docker compose up
```

The backend starts at `http://localhost:8000`. Redis is started automatically.

### Running Tests

```bash
cd backend
uv run --group dev pytest tests/ -v
```

Tests are unit tests only. They cover cache key normalization, GitHub error
parsing, request validation (including qualifier stripping), and response
serialization. No HTTP calls or database access occur during the test suite.
