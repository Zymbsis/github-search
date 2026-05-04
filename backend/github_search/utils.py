import hashlib
import re

import httpx

from config.env import settings as env_settings
from github_search.constants import GITHUB_SEARCH_BASE_URL
from github_search.enums import SearchType


def github_search_url(search_type: SearchType) -> str:
    return f"{GITHUB_SEARCH_BASE_URL}/{search_type.value}"


def github_headers() -> dict:
    return {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {env_settings.GITHUB_TOKEN}",
    }


def make_cache_key(search_type: SearchType, search: str, page: int) -> str:
    normalized = re.sub(r"\s+", " ", search.strip().lower())
    raw = f"{search_type.value}:{normalized}:p{page}"
    digest = hashlib.md5(raw.encode(), usedforsecurity=False).hexdigest()

    return f"github_search:v1:{digest}"


def parse_github_error(response: httpx.Response) -> str:
    status_code = response.status_code

    if status_code == 401:
        return "Invalid or missing GitHub token."

    if status_code in (403, 429):
        retry_after = response.headers.get("Retry-After")
        rate_remaining = response.headers.get("X-RateLimit-Remaining")
        if (
            status_code == 403
            and not retry_after
            and rate_remaining not in (None, "0")
        ):
            return "GitHub API forbidden: token lacks required scope."
        suffix = f" Retry after: {retry_after}s." if retry_after else ""
        return f"GitHub API rate limit exceeded.{suffix}"

    if status_code >= 500:
        return f"GitHub API server error: {status_code}."

    return f"GitHub API error: {status_code}."
