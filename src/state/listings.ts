import { useSyncExternalStore } from 'react';
import { Listing, SAMPLE_LISTINGS } from '../data/listings';

let listings: Listing[] = SAMPLE_LISTINGS;
let saved: ReadonlySet<string> = new Set(['l3', 'l5']);

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

export function addListing(
  listing: Omit<Listing, 'id' | 'mine' | 'sold' | 'postedHoursAgo'>,
) {
  const id = `mine-${Date.now()}`;
  listings = [{ ...listing, id, mine: true, postedHoursAgo: 0 }, ...listings];
  emit();
  return id;
}

export function setListingSold(id: string, sold: boolean) {
  listings = listings.map(l => (l.id === id ? { ...l, sold } : l));
  emit();
}

export function deleteListing(id: string) {
  listings = listings.filter(l => l.id !== id);
  emit();
}

export function toggleSaved(id: string) {
  const next = new Set(saved);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  saved = next;
  emit();
}

export function findListing(id: string) {
  return listings.find(l => l.id === id);
}

export function useListings() {
  return useSyncExternalStore(
    subscribe,
    () => listings,
    () => listings,
  );
}

export function useSaved() {
  return useSyncExternalStore(
    subscribe,
    () => saved,
    () => saved,
  );
}
