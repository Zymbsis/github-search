import css from './Loader.module.css';
import Spinner from '../icons/spinner';
import type { ComponentPropsWithRef } from 'react';

type Props = ComponentPropsWithRef<'div'> & {
  backdrop?: boolean;
};

const Loader = ({ backdrop = false, children }: Props) => {
  return (
    <div className={css.spinnerContainer} data-backdrop={backdrop}>
      <Spinner />
      {children}
    </div>
  );
};

export default Loader;
