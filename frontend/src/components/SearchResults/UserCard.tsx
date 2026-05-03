import type { GithubUser } from '../../store/schemas';
import css from './SearchResults.module.css';

type Props = {
  user: GithubUser;
};

const UserCard = ({ user }: Props) => {
  const displayName = user.name ?? user.login;

  return (
    <div className={css.userCard}>
      <img
        className={css.userCardAvatar}
        src={user.avatar_url}
        alt={`${user.login} avatar`}
      />
      <div className={css.resultCardBody}>
        <a
          className={css.resultCardName}
          href={user.html_url}
          rel='noreferrer'
          target='_blank'>
          {displayName}
        </a>
        {user.location && <p className={css.resultCardSub}>{user.location}</p>}
      </div>
    </div>
  );
};

export default UserCard;
