import { skipToken } from '@reduxjs/toolkit/query';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { toast } from 'sonner';
import {
  DEFAULT_ENTITY_TYPE,
  MIN_SEARCH_STRING_LENGTH,
  QUERY_PARAMS,
} from '../../constants';
import type { SearchQueryArgs } from '../../store/searchApi';
import { useSearchQuery } from '../../store/searchApi';
import Loader from '../Loader/Loader';
import SearchResultsCard from './SearchResultsCard';
import css from './SearchResults.module.css';

const SearchResults = () => {
  const [searchParams] = useSearchParams();

  const searchValue = searchParams.get(QUERY_PARAMS.searchString)?.trim() ?? '';
  const entityType: SearchQueryArgs['type'] =
    searchParams.get(QUERY_PARAMS.entityType) === 'repositories'
      ? 'repositories'
      : DEFAULT_ENTITY_TYPE;

  const queryArg =
    searchValue.length >= MIN_SEARCH_STRING_LENGTH
      ? { type: entityType, search: searchValue }
      : skipToken;

  const { data, isFetching, isError, error } = useSearchQuery(queryArg);

  const items = data?.data.items;
  const isExpanded = isFetching || !!items;
  const isNotFound = !isFetching && items && items.length === 0;

  useEffect(() => {
    if (isError && error) {
      const errorMessage =
        typeof error === 'string' ? error : 'Unable to fetch search results.';

      toast.error(errorMessage);
    }
  }, [isError, error]);

  return (
    <>
      <ul
        className={css.resultsList}
        data-expanded={isExpanded}
        data-empty={items && items.length === 0}>
        {isFetching && <Loader backdrop>Loading...</Loader>}
        {items &&
          items.length > 0 &&
          items.map((item) => <SearchResultsCard key={item.id} item={item} />)}
        {isNotFound && <li>No results found</li>}
      </ul>
    </>
  );
};

export default SearchResults;
