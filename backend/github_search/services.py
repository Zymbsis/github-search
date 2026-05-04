import asyncio

import httpx
from django.core.cache import cache

from github_search.constants import CACHE_TTL, SEARCH_QUALIFIERS, USER_ENRICH_CONCURRENCY
from github_search.enums import SearchType
from github_search.schemas import serialize_github_response
from github_search.utils import (
    github_headers,
    github_search_url,
    make_cache_key,
    parse_github_error,
)


async def search_github(search_type: SearchType, search: str, *, page: int) -> dict:
    cache_key = make_cache_key(search_type, search, page)
    cached = cache.get(cache_key)

    if cached is not None:
        return {"data": cached}

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                github_search_url(search_type),
                headers=github_headers(),
                params={
                    "q": f"{search} {SEARCH_QUALIFIERS[search_type]}",
                    "page": page,
                },
                timeout=10,
            )

            if not response.is_success:
                return {"error": parse_github_error(response)}

            raw = response.json()

            if search_type is SearchType.USERS:
                raw["items"] = await enrich_users(client, raw["items"])

    except httpx.TimeoutException:
        return {"error": "GitHub API request timed out."}
    except httpx.RequestError as e:
        return {"error": f"GitHub API connection error: {e}"}

    data = serialize_github_response(raw, search_type, page=page)
    cache.set(cache_key, data, CACHE_TTL)

    return {"data": data}


async def enrich_users(client: httpx.AsyncClient, items: list) -> list:
    semaphore = asyncio.Semaphore(USER_ENRICH_CONCURRENCY)

    async def fetch_user_details(item: dict) -> dict:
        item.setdefault("location", None)
        item.setdefault("name", None)

        async with semaphore:
            try:
                response = await client.get(
                    item["url"],
                    headers=github_headers(),
                    timeout=10,
                )
                if response.is_success:
                    data = response.json()
                    item["location"] = data.get("location")
                    item["name"] = data.get("name")
            except Exception:
                pass

        return item

    return await asyncio.gather(*[fetch_user_details(item) for item in items])
