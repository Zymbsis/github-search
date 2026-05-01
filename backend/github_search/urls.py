from django.urls import path

from github_search import views

urlpatterns = [
    path("github-search", views.github_search),
    path("clear-cache", views.clear_cache),
]
