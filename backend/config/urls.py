from django.urls import include, path

urlpatterns = [path("api/", include("github_search.urls"))]
