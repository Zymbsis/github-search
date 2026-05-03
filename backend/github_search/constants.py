CACHE_TTL = 60 * 60 * 2

GITHUB_SEARCH_BASE_URL = "https://api.github.com/search"

VALID_SEARCH_TYPES = ("users", "repositories")

SEARCH_QUALIFIERS = {
    "users": "in:login",
    "repositories": "in:name",
}

SEARCH_QUERY_MIN_LENGTH = 3
SEARCH_QUERY_MAX_LENGTH = 256

