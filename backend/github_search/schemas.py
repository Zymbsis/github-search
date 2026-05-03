from rest_framework import serializers

from github_search.enums import SearchType


class UserItemSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    login = serializers.CharField()
    html_url = serializers.URLField()
    avatar_url = serializers.URLField()
    score = serializers.FloatField()
    location = serializers.CharField(allow_null=True, required=False)
    name = serializers.CharField(allow_null=True, required=False)


class RepositoryOwnerSerializer(serializers.Serializer):
    login = serializers.CharField()
    avatar_url = serializers.URLField()
    html_url = serializers.URLField()


class RepositoryItemSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    full_name = serializers.CharField()
    html_url = serializers.URLField()
    description = serializers.CharField(allow_null=True)
    language = serializers.CharField(allow_null=True)
    score = serializers.FloatField()
    stargazers_count = serializers.IntegerField()
    owner = RepositoryOwnerSerializer()


class UserSearchResponseSerializer(serializers.Serializer):
    total_count = serializers.IntegerField()
    items = UserItemSerializer(many=True)


class RepositorySearchResponseSerializer(serializers.Serializer):
    total_count = serializers.IntegerField()
    items = RepositoryItemSerializer(many=True)


class UserSearchResultSerializer(serializers.Serializer):
    data = UserSearchResponseSerializer()


class RepositorySearchResultSerializer(serializers.Serializer):
    data = RepositorySearchResponseSerializer()


class SearchErrorSerializer(serializers.Serializer):
    error = serializers.CharField()


_RESPONSE_SERIALIZERS = {
    SearchType.USERS: UserSearchResponseSerializer,
    SearchType.REPOSITORIES: RepositorySearchResponseSerializer,
}


def serialize_github_response(data: dict, search_type: SearchType) -> dict:
    serializer_cls = _RESPONSE_SERIALIZERS[search_type]
    return serializer_cls(instance=data).data
