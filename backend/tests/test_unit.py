import httpx

from github_search.enums import SearchType
from github_search.schemas import serialize_github_response
from github_search.serializers import GithubSearchSerializer
from github_search.utils import make_cache_key, parse_github_error


class TestMakeCacheKey:
    def test_normalizes_whitespace_and_case(self):
        assert make_cache_key(SearchType.USERS, "Foo  Bar", 1) == make_cache_key(
            SearchType.USERS, "foo bar", 1
        )

    def test_different_types_produce_different_keys(self):
        assert make_cache_key(SearchType.USERS, "react", 1) != make_cache_key(
            SearchType.REPOSITORIES, "react", 1
        )

    def test_different_pages_produce_different_keys(self):
        assert make_cache_key(SearchType.USERS, "react", 1) != make_cache_key(
            SearchType.USERS, "react", 2
        )


class TestParseGithubError:
    def test_401(self):
        assert "token" in parse_github_error(httpx.Response(401)).lower()

    def test_403_forbidden_scope(self):
        r = httpx.Response(403, headers={"X-RateLimit-Remaining": "100"})
        assert "scope" in parse_github_error(r)

    def test_403_rate_limit(self):
        r = httpx.Response(403, headers={"X-RateLimit-Remaining": "0"})
        assert "rate limit" in parse_github_error(r).lower()

    def test_429_with_retry_after(self):
        r = httpx.Response(429, headers={"Retry-After": "30"})
        assert "30s" in parse_github_error(r)

    def test_5xx(self):
        assert "server error" in parse_github_error(httpx.Response(503)).lower()


class TestGithubSearchSerializer:
    def _s(self, data):
        s = GithubSearchSerializer(data=data)
        s.is_valid()
        return s

    def test_valid(self):
        assert self._s({"type": "users", "search": "torvalds"}).is_valid()

    def test_invalid_type(self):
        assert not self._s({"type": "commits", "search": "test"}).is_valid()

    def test_qualifier_stripped(self):
        s = self._s({"type": "users", "search": "tom type:org"})
        assert s.is_valid()
        assert s.validated_data["search"] == "tom"

    def test_only_qualifiers_fails(self):
        assert not self._s({"type": "users", "search": "in:name"}).is_valid()

    def test_page_defaults_to_one(self):
        s = self._s({"type": "users", "search": "tom"})
        assert s.is_valid()
        assert s.validated_data["page"] == 1

    def test_page_explicit(self):
        s = self._s({"type": "users", "search": "tom", "page": 2})
        assert s.is_valid()
        assert s.validated_data["page"] == 2

    def test_page_below_one_invalid(self):
        assert not self._s({"type": "users", "search": "tom", "page": 0}).is_valid()


class TestSerializeGithubResponse:
    def test_users(self):
        raw = {
            "total_count": 1,
            "items": [{
                "id": 1, "login": "a", "html_url": "https://github.com/a",
                "avatar_url": "https://avatars.githubusercontent.com/a",
                "score": 1.0, "location": "Kyiv", "name": "Alice",
            }],
        }
        result = serialize_github_response(raw, SearchType.USERS, page=1)
        assert result["items"][0]["login"] == "a"
        assert result["items"][0]["location"] == "Kyiv"
        assert result["items"][0]["entity"] == "user"
        assert result["page"] == 1

    def test_repositories(self):
        raw = {
            "total_count": 1,
            "items": [{
                "id": 1, "name": "repo", "full_name": "a/repo",
                "html_url": "https://github.com/a/repo",
                "description": None, "language": None, "score": 1.0,
                "stargazers_count": 42,
                "owner": {
                    "login": "a",
                    "avatar_url": "https://avatars.githubusercontent.com/a",
                    "html_url": "https://github.com/a",
                },
            }],
        }
        result = serialize_github_response(raw, SearchType.REPOSITORIES, page=2)
        assert result["items"][0]["owner"]["login"] == "a"
        assert result["items"][0]["stargazers_count"] == 42
        assert result["items"][0]["entity"] == "repository"
        assert result["page"] == 2
