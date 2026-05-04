import re

from rest_framework import serializers

from github_search.constants import (
    FORBIDDEN_QUERY_QUALIFIERS,
    SEARCH_QUERY_MAX_LENGTH,
    SEARCH_QUERY_MIN_LENGTH,
)
from github_search.enums import SearchType

_QUALIFIER_RE = re.compile(
    rf"\b({'|'.join(FORBIDDEN_QUERY_QUALIFIERS)})\s*:\S*",
    re.IGNORECASE,
)


class GithubSearchSerializer(serializers.Serializer):
    type = serializers.ChoiceField(choices=[t.value for t in SearchType])
    search = serializers.CharField(
        min_length=SEARCH_QUERY_MIN_LENGTH, max_length=SEARCH_QUERY_MAX_LENGTH
    )

    def validate_search(self, value: str) -> str:
        cleaned = _QUALIFIER_RE.sub("", value)
        cleaned = re.sub(r"\s+", " ", cleaned).strip()

        if len(cleaned) < SEARCH_QUERY_MIN_LENGTH:
            raise serializers.ValidationError(
                f"Search query must contain at least {SEARCH_QUERY_MIN_LENGTH} "
                "characters after removing GitHub qualifiers."
            )

        return cleaned
