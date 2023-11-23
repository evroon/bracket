import { DependencyList, EffectCallback, useEffect, useRef } from 'react';

export function useWatch(func: EffectCallback, deps: DependencyList | undefined) {
  const mounted = useRef<boolean>(false);

  useEffect(() => {
    if (mounted.current === true) {
      func();
    }
  }, deps);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
}
