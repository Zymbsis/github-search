from rest_framework import serializers

from github_search.constants import (
    SEARCH_QUERY_MAX_LENGTH,
    SEARCH_QUERY_MIN_LENGTH,
    VALID_SEARCH_TYPES,
)


class GithubSearchSerializer(serializers.Serializer):
    type = serializers.ChoiceField(choices=list(VALID_SEARCH_TYPES))
    search = serializers.CharField(
        min_length=SEARCH_QUERY_MIN_LENGTH, max_length=SEARCH_QUERY_MAX_LENGTH
    )
