import { type ComponentPropsWithRef } from 'react';
import css from '../Loader/Loader.module.css';

type Props = ComponentPropsWithRef<'svg'>;

const Spinner = ({ width = 24, height = 24, ...props }: Props) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width}
      height={height}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={css.spinnerAnimation}
      {...props}>
      <path d='M21 12a9 9 0 1 1-6.219-8.56' />
    </svg>
  );
};

export default Spinner;
