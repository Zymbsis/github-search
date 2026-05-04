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
| `ALLOWED_HOSTS`        | JSON array of allowed hosts                               |
| `GITHUB_TOKEN`         | GitHub personal access token (requires no special scopes) |
| `REDIS_URL`            | Redis connection URL                                      |
| `CACHE_CLEAR_TOKEN`    | Shared secret for the cache clear endpoint                |
| `CORS_ALLOWED_ORIGINS` | JSON array of allowed CORS origins                        |

### Running Locally

```bash
docker compose up
```

The backend starts at `http://localhost:8000`. Redis is started automatically.
The same Compose file also runs the Vite dev server for the frontend on port
`5173` (see [Frontend](#frontend) → Running Locally).

### Running Tests

```bash
cd backend
uv run --group dev pytest tests/ -v
```

Tests are unit tests only. They cover cache key normalization, GitHub error
parsing, request validation (including qualifier stripping), and response
serialization. No HTTP calls or database access occur during the test suite.

## Frontend

### Tech Stack

- **React 19 + TypeScript** - UI and type safety
- **Vite** - dev server and production build
- **React Compiler** (`babel-plugin-react-compiler` via `@rolldown/plugin-babel`) -
  automatic memoization at compile time
- **Redux Toolkit + RTK Query** - global store and cached HTTP layer for search
- **Zod** - runtime parsing of successful API responses into typed data
- **React Router** - `BrowserRouter` and URL-driven search state (`useSearchParams`)
- **Sonner** - toast notifications when a search request fails
- **CSS Modules** - scoped styles for the search bar and results

### Architecture

The frontend is a single-page app with no routing pages beyond the root: search
state lives in the URL query string so results are linkable and refresh-safe.

```
frontend/
  src/
    App.tsx                 Shell: layout, Sonner toaster, search + results
    main.tsx                `Provider`, `BrowserRouter`, app mount
    constants.ts            Query param names, min/max query length, defaults
    components/
      SearchBar/            Header, debounced input, entity type dropdown
      SearchResults/        Result list, user/repository cards, empty states
      Loader/               Inline / backdrop loading indicator
      icons/                SVG icons used in the UI
    hooks/                  `useDebounce`, `useOutsideClick`
    store/
      store.ts              Redux store with RTK Query middleware
      searchApi.ts          `search` endpoint: `POST` to `/search` under `VITE_API_URL`
      schemas.ts            Zod schemas and inferred types for API payloads
```

### Key Decisions

**URL as the source of truth** The input and dropdown sync `search` and `type`
query parameters. The search field is debounced before updating the URL, so the
address bar does not change on every keystroke. RTK Query reads those parameters;
if the trimmed query is shorter than the minimum length (3 characters), the
hook receives `skipToken` and no network request is sent.

**Validated responses** Successful JSON is passed through `SearchApiResponseSchema`
so the UI only renders data that matches the expected shape (discriminated union
on `entity`: `user` vs `repository`). Errors from the API are normalized to a
string message for toasts when possible.

**RTK Query cache** `keepUnusedDataFor` is set to one hour so revisiting the same
search within a session avoids duplicate calls while the tab stays open.

### Environment Variables

| Variable       | Description                                                                                  |
| -------------- | -------------------------------------------------------------------------------------------- |
| `VITE_API_URL` | Base URL for the backend API **including** the `/api` path (e.g. `http://localhost:8000/api`) |

Copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_URL` before
running the dev server. Vite only exposes variables prefixed with `VITE_`.

### Running Locally

From the repository root, Docker Compose starts the frontend dev server together
with the backend and Redis:

```bash
docker compose up
```

The UI is available at `http://localhost:5173` (Vite). Ensure `VITE_API_URL` in
`frontend/.env` points at your backend (for Compose, typically
`http://localhost:8000/api`).

To run the frontend alone:

```bash
cd frontend
npm ci
npm run dev
```

Other scripts: `npm run build` (typecheck + production bundle), `npm run preview`
(local preview of the build), `npm run lint` (ESLint).
