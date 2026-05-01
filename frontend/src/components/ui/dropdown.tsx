import { useMemo, useRef, useState } from 'react';
import useOutsideClick from '../../hooks/use-outside-click';

const SEARCH_TYPE_OPTIONS = [
  { value: 'users' as const, label: 'Users' },
  { value: 'repositories' as const, label: 'Repositories' },
  { value: 'issues' as const, label: 'Issues' },
];

type SearchType = (typeof SEARCH_TYPE_OPTIONS)[number]['value'];

export const isCorrectSearchType = (value: string): value is SearchType => {
  return SEARCH_TYPE_OPTIONS.some((option) => option.value === value);
};

type DropdownProps = {
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
};

const Dropdown = ({ value, onChange }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = useMemo(
    () =>
      SEARCH_TYPE_OPTIONS.find((option) => option.value === value) ??
      SEARCH_TYPE_OPTIONS[0],
    [value],
  );

  const selectOption = (v: string) => {
    onChange(v);
    setIsOpen(false);
  };

  useOutsideClick(dropdownRef, () => setIsOpen(false));

  return (
    <div className="search-dropdown-root" ref={dropdownRef}>
      <button
        type="button"
        className="search-dropdown-button"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>{selectedOption.label}</span>
        <span className="search-dropdown-chevron" aria-hidden="true">
          ▾
        </span>
      </button>

      {isOpen ? (
        <div className="search-dropdown-popover">
          <ul className="search-dropdown-list">
            {SEARCH_TYPE_OPTIONS.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  className={`search-dropdown-item ${
                    option.value === selectedOption.value
                      ? 'search-dropdown-item-active'
                      : ''
                  }`}
                  role="option"
                  aria-selected={option.value === selectedOption.value}
                  onClick={() => selectOption(option.value)}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default Dropdown;
