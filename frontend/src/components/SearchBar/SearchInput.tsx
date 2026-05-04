import { useSearchParams } from 'react-router';
import { useDebounce } from '../../hooks/useDebounce';
import { useEffect, useState } from 'react';
import {
  MAX_SEARCH_STRING_LENGTH,
  MIN_SEARCH_STRING_LENGTH,
  QUERY_PARAMS,
} from '../../constants';
import css from './SearchBar.module.css';

const SearchInput = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState<string>(
    () => searchParams.get(QUERY_PARAMS.searchString) ?? '',
  );

  const debouncedSearchValue = useDebounce(searchValue);

  const tooShortSearchValue = searchValue.length < MIN_SEARCH_STRING_LENGTH;
  const tooLongSearchValue = searchValue.length === MAX_SEARCH_STRING_LENGTH;

  useEffect(() => {
    setSearchParams((params) => {
      const nextParams = new URLSearchParams(params);

      if (debouncedSearchValue.length < MIN_SEARCH_STRING_LENGTH)
        nextParams.delete(QUERY_PARAMS.searchString);
      else nextParams.set(QUERY_PARAMS.searchString, debouncedSearchValue);

      return nextParams;
    });
  }, [debouncedSearchValue, setSearchParams]);

  return (
    <div className={css.searchInputWrapper}>
      <input
        className={css.searchInput}
        placeholder='Start typing to search ...'
        value={searchValue}
        onChange={(event) =>
          setSearchValue(
            event.target.value.trim().substring(0, MAX_SEARCH_STRING_LENGTH),
          )
        }
      />

      {(tooShortSearchValue || tooLongSearchValue) && (
        <span className={css.searchInputInfo} data-error={tooLongSearchValue}>
          {tooShortSearchValue && `* Min ${MIN_SEARCH_STRING_LENGTH} symbols`}
          {tooLongSearchValue && `* Max ${MAX_SEARCH_STRING_LENGTH} symbols`}
        </span>
      )}
    </div>
  );
};

export default SearchInput;
