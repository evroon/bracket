import { Fragment, createElement, useEffect, useState } from 'react';

/** React component that renders its children client-side only / after first mount */
export const ClientOnly = ({ children }: any) => {
  const hasMounted = useClientOnly();

  if (!hasMounted) {
    return null;
  }

  // eslint-disable-next-line react/no-children-prop
  return createElement(Fragment, { children });
};

/** React hook that returns true if the component has mounted client-side */
export const useClientOnly = () => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted;
};
