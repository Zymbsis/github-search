import { type ResultItem } from '../../store/schemas';
import RepositoryCard from './RepositoryCard';
import UserCard from './UserCard';
import css from './SearchResults.module.css';

type Props = {
  item: ResultItem;
};

const SearchResultsCard = ({ item }: Props) => {
  return (
    <div className={css.resultCard}>
      {item.entity === 'user' && <UserCard user={item} />}
      {item.entity === 'repository' && <RepositoryCard repository={item} />}
    </div>
  );
};

export default SearchResultsCard;
