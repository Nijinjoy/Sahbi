import { useSyncExternalStore } from 'react';

let going: ReadonlySet<string> = new Set();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return going;
}

export function toggleCityEventGoing(id: string) {
  const next = new Set(going);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  going = next;
  listeners.forEach(listener => listener());
}

export function useCityEventsGoing() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
