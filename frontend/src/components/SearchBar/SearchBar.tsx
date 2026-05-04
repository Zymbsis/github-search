import GithubIcon from '../icons/github';
import SearchInput from './SearchInput';
import SearchBarDropdown from './SearchBarDropdown';
import css from './SearchBar.module.css';

const SearchBar = () => {
  return (
    <>
      <div className={css.searchBarHeader}>
        <GithubIcon width={64} height={64} />
        <div className={css.titleWrapper}>
          <p className={css.title}>GitHub Searcher</p>
          <p className={css.subtitle}>Search users or repositories below</p>
        </div>
      </div>

      <div className={css.searchBarControls}>
        <SearchInput />
        <SearchBarDropdown />
      </div>
    </>
  );
};

export default SearchBar;
