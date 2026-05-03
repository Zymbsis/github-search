from github_search.enums import SearchType
from github_search.schemas import (
    RepositoryItem,
    RepositoryOwner,
    SearchResponse,
    UserItem,
)


def map_users_response(data: dict) -> SearchResponse[UserItem]:
    return SearchResponse[UserItem](
        total_count=data["total_count"],
        items=[
            UserItem(
                id=item["id"],
                login=item["login"],
                html_url=item["html_url"],
                avatar_url=item["avatar_url"],
                score=item["score"],
                location=item.get("location"),
                name=item.get("name"),
            )
            for item in data["items"]
        ],
    )


def map_repositories_response(data: dict) -> SearchResponse[RepositoryItem]:
    return SearchResponse[RepositoryItem](
        total_count=data["total_count"],
        items=[
            RepositoryItem(
                name=item["name"],
                full_name=item["full_name"],
                html_url=item["html_url"],
                description=item.get("description"),
                language=item.get("language"),
                score=item["score"],
                owner=RepositoryOwner(
                    login=item["owner"]["login"],
                    avatar_url=item["owner"]["avatar_url"],
                    html_url=item["owner"]["html_url"],
                ),
            )
            for item in data["items"]
        ],
    )


def map_github_response(
    data: dict, search_type: SearchType
) -> SearchResponse[UserItem] | SearchResponse[RepositoryItem]:
    mappers = {
        SearchType.USERS: map_users_response,
        SearchType.REPOSITORIES: map_repositories_response,
    }
    return mappers[search_type](data)
