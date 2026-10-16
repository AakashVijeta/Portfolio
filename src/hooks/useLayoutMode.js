import { useSyncExternalStore } from 'react';

export const FLOW_QUERY = '(max-width: 900px)';

const mql = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(FLOW_QUERY) : null;

const subscribe = (cb) => {
  if (!mql) return () => {};
  mql.addEventListener('change', cb);
  return () => mql.removeEventListener('change', cb);
};

const getSnapshot = () => (mql?.matches ? 'flow' : 'paged');

// 'flow' = natural-scroll mobile layout (≤ 900px); 'paged' = full-screen desktop sections.
export function useLayoutMode() {
  return useSyncExternalStore(subscribe, getSnapshot, () => 'paged');
}
