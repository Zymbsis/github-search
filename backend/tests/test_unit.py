import httpx

from github_search.enums import SearchType
from github_search.schemas import serialize_github_response
from github_search.serializers import GithubSearchSerializer
from github_search.utils import make_cache_key, parse_github_error


class TestMakeCacheKey:
    def test_normalizes_whitespace_and_case(self):
        assert make_cache_key(SearchType.USERS, "Foo  Bar") == make_cache_key(SearchType.USERS, "foo bar")

    def test_different_types_produce_different_keys(self):
        assert make_cache_key(SearchType.USERS, "react") != make_cache_key(SearchType.REPOSITORIES, "react")


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
        result = serialize_github_response(raw, SearchType.USERS)
        assert result["items"][0]["login"] == "a"
        assert result["items"][0]["location"] == "Kyiv"
        assert result["items"][0]["entity"] == "user"

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
        result = serialize_github_response(raw, SearchType.REPOSITORIES)
        assert result["items"][0]["owner"]["login"] == "a"
        assert result["items"][0]["stargazers_count"] == 42
        assert result["items"][0]["entity"] == "repository"
