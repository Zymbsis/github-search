import { useEffect, type RefObject } from 'react';

const useOutsideClick = (ref: RefObject<HTMLElement>, callback: () => void) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('pointerdown', handleClickOutside);

    return () =>
      document.removeEventListener('pointerdown', handleClickOutside);
  }, [ref, callback]);
};

export default useOutsideClick;
