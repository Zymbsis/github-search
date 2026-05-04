import hmac

from adrf.decorators import api_view
from django.core.cache import cache
from drf_spectacular.utils import (
    OpenApiParameter,
    OpenApiResponse,
    OpenApiTypes,
    PolymorphicProxySerializer,
    extend_schema,
)
from rest_framework import status
from rest_framework.response import Response

from config.env import settings as env_settings
from github_search.enums import SearchType
from github_search.schemas import (
    RepositorySearchResultSerializer,
    SearchErrorSerializer,
    UserSearchResultSerializer,
)
from github_search.serializers import GithubSearchSerializer
from github_search.services import search_github


@extend_schema(
    summary="Search GitHub users or repositories",
    request=GithubSearchSerializer,
    responses={
        200: PolymorphicProxySerializer(
            component_name="SearchResult",
            serializers=[
                UserSearchResultSerializer,
                RepositorySearchResultSerializer,
            ],
            resource_type_field_name=None,
        ),
        400: OpenApiResponse(
            response=OpenApiTypes.OBJECT, description="Validation error."
        ),
        502: SearchErrorSerializer,
    },
)
@api_view(["POST"])
async def github_search(request):
    serializer = GithubSearchSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    result = await search_github(
        search_type=SearchType(serializer.validated_data["type"]),
        search=serializer.validated_data["search"],
        page=serializer.validated_data.get("page", 1),
    )

    if "error" in result:
        return Response(result, status=status.HTTP_502_BAD_GATEWAY)

    return Response(result)


@extend_schema(
    summary="Clear cached GitHub search results",
    request=None,
    parameters=[
        OpenApiParameter(
            name="X-Cache-Token",
            type=str,
            location=OpenApiParameter.HEADER,
            required=True,
            description="Shared secret token configured via CACHE_CLEAR_TOKEN.",
        ),
    ],
    responses={
        200: OpenApiResponse(
            response=OpenApiTypes.OBJECT, description="Cache cleared."
        ),
        403: OpenApiResponse(
            response=OpenApiTypes.OBJECT, description="Forbidden."
        ),
    },
)
@api_view(["POST"])
async def clear_cache(request):
    token = request.headers.get("X-Cache-Token")
    expected = env_settings.CACHE_CLEAR_TOKEN
    if not hmac.compare_digest(token or "", expected):
        return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)

    if hasattr(cache, "delete_pattern"):
        cache.delete_pattern("github_search:*")
    else:
        cache.clear()

    return Response({"detail": "Cache cleared."})
