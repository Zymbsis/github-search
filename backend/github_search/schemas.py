from dataclasses import dataclass


@dataclass
class UserItem:
    id: int
    login: str
    html_url: str
    avatar_url: str
    score: float
    location: str | None
    name: str | None


@dataclass
class RepositoryOwner:
    login: str
    avatar_url: str
    html_url: str


@dataclass
class RepositoryItem:
    name: str
    full_name: str
    html_url: str
    description: str | None
    language: str | None
    score: float
    owner: RepositoryOwner


@dataclass
class SearchResponse[T]:
    total_count: int
    items: list[T]
