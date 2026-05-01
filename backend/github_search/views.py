from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(["POST"])
def github_search(request):
    return Response()


@api_view(["POST"])
def clear_cache(request):
    return Response()
