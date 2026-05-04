from github_search.enums import SearchType

CACHE_TTL = 60 * 60 * 2

GITHUB_SEARCH_BASE_URL = "https://api.github.com/search"

USER_ENRICH_CONCURRENCY = 5

SEARCH_QUALIFIERS = {
    SearchType.USERS: "in:name,login",
    SearchType.REPOSITORIES: "in:name",
}

SEARCH_QUERY_MIN_LENGTH = 3
SEARCH_QUERY_MAX_LENGTH = 256

FORBIDDEN_QUERY_QUALIFIERS = (
    "in",
    "user",
    "org",
    "repo",
    "language",
    "stars",
    "forks",
    "is",
    "type",
    "created",
    "pushed",
    "followers",
    "size",
    "topic",
    "license",
    "archived",
    "mirror",
    "fork",
    "sort",
)
