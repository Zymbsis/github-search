import type { ComponentPropsWithRef } from 'react';

type Props = ComponentPropsWithRef<'svg'>;

const ChevronIcon = ({ width = 16, height = 16, ...props }: Props) => {
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
      {...props}>
      <path d='m6 9 6 6 6-6' />
    </svg>
  );
};

export default ChevronIcon;
