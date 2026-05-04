import type { GithubRepository } from '../../store/schemas';
import StarIcon from '../icons/star';
import css from './SearchResults.module.css';

type Props = {
  repository: GithubRepository;
};

const RepositoryCard = ({ repository }: Props) => {
  return (
    <div className={css.repositoryCard}>
      <div className={css.repositoryCardHeader}>
        <div className={css.repositoryCardOwner}>
          <img
            className={css.repositoryCardOwnerAvatar}
            src={repository.owner.avatar_url}
            alt={`${repository.owner.login} avatar`}
          />
          <a
            href={repository.owner.html_url}
            rel='noreferrer'
            target='_blank'
            className={css.resultCardSub}>
            {repository.owner.login}
          </a>
        </div>

        <div className={css.repositoryCardStats}>
          <span title='Stars' className={css.repositoryCardStars}>
            <StarIcon /> {repository.stargazers_count}
          </span>
          {repository.language && (
            <span className={css.repositoryCardLanguage}>
              {repository.language}
            </span>
          )}
        </div>
      </div>

      <div className={css.resultCardBody}>
        <a
          href={repository.html_url}
          rel='noreferrer'
          target='_blank'
          className={css.resultCardName}>
          {repository.name}
        </a>

        <p className={css.resultCardDesc}>
          {repository.description ?? 'No description provided'}
        </p>
      </div>
    </div>
  );
};

export default RepositoryCard;
