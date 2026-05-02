import GithubIcon from '../icons/github';
import SearchInput from './SearchInput';
import EntityTypeDropdown from './EntityTypeDropdown';

const SearchBar = () => {
  return (
    <>
      <div className='search-container'>
        <GithubIcon width={64} height={64} />
        <div className='title-container'>
          <p className='title'>GitHub Searcher</p>
          <p className='subtitle'>Search users or repositories below</p>
        </div>
      </div>

      <div className='search-controls'>
        <SearchInput />
        <EntityTypeDropdown />
      </div>
    </>
  );
};

export default SearchBar;
