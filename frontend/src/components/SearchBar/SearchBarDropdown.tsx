import { useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import useOutsideClick from '../../hooks/useOutsideClick';
import {
  DEFAULT_ENTITY_TYPE,
  GITHUB_ENTITY_OPTIONS,
  QUERY_PARAMS,
} from '../../constants';
import ChevronIcon from '../icons/chevron';
import css from './SearchBar.module.css';

type GitHubEntityType = keyof typeof GITHUB_ENTITY_OPTIONS;

const isGitHubEntityType = (value: string | null): value is GitHubEntityType =>
  value !== null && value in GITHUB_ENTITY_OPTIONS;

const SearchBarDropdown = () => {
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const entityType =
    searchParams.get(QUERY_PARAMS.entityType) ?? DEFAULT_ENTITY_TYPE;

  const selectedOption = isGitHubEntityType(entityType)
    ? entityType
    : DEFAULT_ENTITY_TYPE;

  const selectOption = (value: string) => {
    if (value !== selectedOption)
      setSearchParams((params) => {
        const nextParams = new URLSearchParams(params);

        nextParams.set(QUERY_PARAMS.entityType, value);
        nextParams.delete(QUERY_PARAMS.page);

        return nextParams;
      });

    setIsOpen(false);
  };

  useOutsideClick(dropdownRef, () => setIsOpen(false));

  return (
    <div className={css.searchDropdownRoot} ref={dropdownRef}>
      <button
        type='button'
        className={css.searchDropdownButton}
        onClick={() => setIsOpen((prev) => !prev)}>
        {GITHUB_ENTITY_OPTIONS[selectedOption]}
        <ChevronIcon className={css.searchDropdownChevron} data-open={isOpen} />
      </button>

      {isOpen && (
        <div className={css.searchDropdownPopover}>
          <ul>
            {Object.entries(GITHUB_ENTITY_OPTIONS).map(([key, value]) => (
              <li key={key}>
                <button
                  type='button'
                  data-active={key === selectedOption}
                  className={css.searchDropdownItem}
                  onClick={() => selectOption(key)}>
                  {value}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchBarDropdown;
