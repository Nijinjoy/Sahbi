import { useSyncExternalStore } from 'react';

let read: ReadonlySet<string> = new Set();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return read;
}

export function markChatRead(id: string) {
  if (read.has(id)) {
    return;
  }
  read = new Set(read).add(id);
  listeners.forEach(listener => listener());
}

export function useReadChats() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
