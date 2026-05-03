import hashlib

from github_search.constants import GITHUB_SEARCH_BASE_URL, VALID_SEARCH_TYPES


def github_search_url(endpoint: str) -> str:
    if endpoint not in VALID_SEARCH_TYPES:
        raise ValueError(f"Invalid search endpoint: {endpoint!r}")
    return f"{GITHUB_SEARCH_BASE_URL}/{endpoint}"


def make_cache_key(search_type: str, search: str) -> str:
    raw = f"{search_type}:{search.strip().lower()}"
    return "github_search:" + hashlib.md5(raw.encode()).hexdigest()
