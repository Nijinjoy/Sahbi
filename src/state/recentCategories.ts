import { useSyncExternalStore } from 'react';

const MAX_RECENT = 6;

// Seeded so the section isn't empty in the demo; real visits are added on top.
let recent: readonly string[] = ['Furniture', 'Electronics', 'Kids & baby'];
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit() {
  listeners.forEach(listener => listener());
}

/** Moves a category to the front of the recently viewed list. */
export function addRecentCategory(name: string) {
  if (recent[0] === name) {
    return;
  }
  recent = [name, ...recent.filter(n => n !== name)].slice(0, MAX_RECENT);
  emit();
}

export function clearRecentCategories() {
  recent = [];
  emit();
}

export function useRecentCategories() {
  return useSyncExternalStore(
    subscribe,
    () => recent,
    () => recent,
  );
}
