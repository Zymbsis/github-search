import { useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import useOutsideClick from '../../hooks/useOutsideClick';
import {
  DEFAULT_ENTITY_TYPE,
  GITHUB_ENTITY_OPTIONS,
  QUERY_PARAMS,
} from '../../constants';

const EntityTypeDropdown = () => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const entityType = searchParams.get(QUERY_PARAMS.entityType);

  const selectedOption = GITHUB_ENTITY_OPTIONS[entityType]
    ? entityType
    : DEFAULT_ENTITY_TYPE;

  const selectOption = (value: string) => {
    if (value !== selectedOption)
      setSearchParams((params) => {
        const nextParams = new URLSearchParams(params);
        nextParams.set(QUERY_PARAMS.entityType, value);

        return nextParams;
      });

    setIsOpen(false);
  };

  useOutsideClick(dropdownRef, () => setIsOpen(false));

  return (
    <div
      className='search-dropdown-root'
      ref={dropdownRef}
      aria-haspopup='listbox'
      aria-expanded={isOpen}>
      <button
        type='button'
        className='search-dropdown-button'
        onClick={() => setIsOpen((prev) => !prev)}>
        <span>{GITHUB_ENTITY_OPTIONS[selectedOption]}</span>
        <span
          className={`search-dropdown-chevron ${
            isOpen ? 'dropdown-open' : ''
          }`}>
          &#9662;
        </span>
      </button>

      {isOpen && (
        <div className='search-dropdown-popover'>
          <ul className='search-dropdown-list' role='listbox'>
            {Object.entries(GITHUB_ENTITY_OPTIONS).map(([key, value]) => (
              <li key={key}>
                <button
                  type='button'
                  className={`search-dropdown-item ${
                    key === selectedOption ? 'search-dropdown-item-active' : ''
                  }`}
                  role='option'
                  aria-selected={key === selectedOption}
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

export default EntityTypeDropdown;
