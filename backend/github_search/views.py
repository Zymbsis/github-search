import hmac

from adrf.decorators import api_view
from django.core.cache import cache
from rest_framework import status
from rest_framework.response import Response

from config.env import settings as env_settings
from github_search.serializers import GithubSearchSerializer
from github_search.services import search_github


@api_view(["POST"])
async def github_search(request):
    serializer = GithubSearchSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    result = await search_github(
        search_type=serializer.validated_data["type"],
        search=serializer.validated_data["search"],
    )

    if "error" in result:
        return Response(result, status=status.HTTP_502_BAD_GATEWAY)

    return Response(result)


@api_view(["POST"])
async def clear_cache(request):
    token = request.headers.get("X-Cache-Token")
    expected = env_settings.CACHE_CLEAR_TOKEN
    if not hmac.compare_digest(token or "", expected):
        return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)

    cache.clear()
    return Response({"detail": "Cache cleared."})
