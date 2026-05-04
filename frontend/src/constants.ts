export const QUERY_PARAMS = {
  searchString: 'search',
  entityType: 'type',
};

export const DEFAULT_ENTITY_TYPE = 'users' as const;

export const GITHUB_ENTITY_OPTIONS = {
  users: 'users' as const,
  repositories: 'repositories' as const,
};

export const MIN_SEARCH_STRING_LENGTH = 3;
export const MAX_SEARCH_STRING_LENGTH = 256;
