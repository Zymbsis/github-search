import { useSearchParams } from 'react-router';
import {
  DEFAULT_PAGE,
  GITHUB_SEARCH_PAGE_SIZE,
  QUERY_PARAMS,
} from '../../constants';
import css from './SearchPagination.module.css';

type SearchPaginationProps = {
  itemsCount: number;
  totalCount: number;
  currentPage: number | undefined;
  pageFromUrl: number;
  isFetching: boolean;
  isLoading: boolean;
};

const SearchPagination = ({
  itemsCount,
  totalCount,
  currentPage,
  pageFromUrl,
  isFetching,
  isLoading,
}: SearchPaginationProps) => {
  const [, setSearchParams] = useSearchParams();

  const busy = isFetching || isLoading;
  const page = currentPage ?? pageFromUrl;

  const rangeStart =
    itemsCount > 0 ? (page - 1) * GITHUB_SEARCH_PAGE_SIZE + 1 : 0;
  const rangeEnd =
    itemsCount > 0 ? (page - 1) * GITHUB_SEARCH_PAGE_SIZE + itemsCount : 0;

  const hasPrev = page > 1;
  const hasNext =
    totalCount > 0 &&
    itemsCount > 0 &&
    (page - 1) * GITHUB_SEARCH_PAGE_SIZE + itemsCount < totalCount;

  const goToPage = (next: number) => {
    setSearchParams((params) => {
      const nextParams = new URLSearchParams(params);

      if (next <= DEFAULT_PAGE) nextParams.delete(QUERY_PARAMS.page);
      else nextParams.set(QUERY_PARAMS.page, String(next));

      return nextParams;
    });
  };

  return (
    <nav className={css.pagination} aria-label='Search results pages'>
      <button
        type='button'
        className={css.paginationButton}
        disabled={busy || !hasPrev}
        onClick={() => goToPage(page - 1)}>
        Previous
      </button>
      <span className={css.paginationMeta}>
        {busy ? (
          'Loading…'
        ) : (
          <>
            Page {page}
            {totalCount > 0 && (
              <>
                {' '}
                · {Math.min(rangeStart, totalCount)}-
                {Math.min(rangeEnd, totalCount)} of {totalCount}
              </>
            )}
          </>
        )}
      </span>
      <button
        type='button'
        className={css.paginationButton}
        disabled={busy || !hasNext}
        onClick={() => goToPage(page + 1)}>
        Next
      </button>
    </nav>
  );
};

export default SearchPagination;
