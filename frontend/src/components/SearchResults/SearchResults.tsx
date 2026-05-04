import { skipToken } from '@reduxjs/toolkit/query';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { toast } from 'sonner';
import {
  DEFAULT_ENTITY_TYPE,
  DEFAULT_PAGE,
  MIN_SEARCH_STRING_LENGTH,
  QUERY_PARAMS,
} from '../../constants';
import type { SearchQueryArgs } from '../../store/searchApi';
import { useSearchQuery } from '../../store/searchApi';
import Loader from '../Loader/Loader';
import SearchPagination from './SearchPagination';
import SearchResultsCard from './SearchResultsCard';
import css from './SearchResults.module.css';

const SearchResults = () => {
  const [searchParams] = useSearchParams();

  const searchValue = searchParams.get(QUERY_PARAMS.searchString)?.trim() ?? '';
  const entityType: SearchQueryArgs['type'] =
    searchParams.get(QUERY_PARAMS.entityType) === 'repositories'
      ? 'repositories'
      : DEFAULT_ENTITY_TYPE;
  const parsedPage = Number.parseInt(
    searchParams.get(QUERY_PARAMS.page) ?? '',
    10,
  );
  const searchPage =
    Number.isFinite(parsedPage) && parsedPage >= 1 ? parsedPage : DEFAULT_PAGE;

  const queryArg =
    searchValue.length >= MIN_SEARCH_STRING_LENGTH
      ? { type: entityType, search: searchValue, page: searchPage }
      : skipToken;

  const { data, isFetching, isLoading, isError, error } =
    useSearchQuery(queryArg);

  const items = data?.data.items;
  const itemsCount = items?.length ?? 0;
  const totalCount = data?.data.total_count ?? 0;
  const apiPage = data?.data.page;

  const searchReady = searchValue.length >= MIN_SEARCH_STRING_LENGTH;
  const listIdle = !isFetching && !isLoading;

  const isExpanded =
    (isFetching || isLoading || !!items) && searchReady;
  const isNotFound = !isFetching && !isLoading && items && items.length === 0;

  const showResults =
    listIdle && !isError && !!items?.length && searchReady;

  const showPagination =
    !!data &&
    !isError &&
    searchReady &&
    (totalCount > 0 || (apiPage ?? searchPage) > 1);

  useEffect(() => {
    if (isError && error) {
      const errorMessage =
        typeof error === 'string' ? error : 'Unable to fetch search results.';

      toast.error(errorMessage);
    }
  }, [isError, error]);

  return (
    <div className={css.resultsRoot} data-expanded={isExpanded}>
      <ul className={css.resultsList} data-empty={isNotFound}>
        {isFetching && <Loader backdrop>Loading...</Loader>}
        {showResults &&
          items.map((item) => <SearchResultsCard key={item.id} item={item} />)}
        {isNotFound && <li>No results found</li>}
      </ul>
      {showPagination && (
        <SearchPagination
          itemsCount={itemsCount}
          totalCount={totalCount}
          currentPage={apiPage}
          pageFromUrl={searchPage}
          isFetching={isFetching}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default SearchResults;
