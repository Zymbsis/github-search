import httpx
from django.core.cache import cache

from github_search.constants import CACHE_TTL, SEARCH_QUALIFIERS
from github_search.utils import github_search_url, make_cache_key


async def search_github(search_type: str, search: str) -> dict:
    cache_key = make_cache_key(search_type, search)
    cached = cache.get(cache_key)
    if cached is not None:
        return {"source": "cache", "data": cached}

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                github_search_url(search_type),
                headers={"Accept": "application/vnd.github+json"},
                params={
                    "q": f"{search} {SEARCH_QUALIFIERS[search_type]}",
                    "per_page": 30,
                },
                timeout=10,
            )
    except httpx.TimeoutException:
        return {"error": "GitHub API request timed out."}
    except httpx.RequestError as e:
        return {"error": f"GitHub API connection error: {e}"}

    if not response.is_success:
        return {"error": f"GitHub API error: {response.status_code}"}

    data = response.json()
    cache.set(cache_key, data, CACHE_TTL)

    return {"source": "github", "data": data}
