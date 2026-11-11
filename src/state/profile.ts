import { useSyncExternalStore } from 'react';

export type Profile = {
  phone: string | null;
  name: string | null;
  bio: string | null;
  gender: string | null;
  city: string | null;
  /** Neighbourhood from the device location, e.g. "Dubai Marina". */
  area: string | null;
  /** Full street address from Google Geocoding. */
  address: string | null;
  coords: { latitude: number; longitude: number } | null;
};

const EMPTY: Profile = {
  phone: null,
  name: null,
  bio: null,
  gender: null,
  city: null,
  area: null,
  address: null,
  coords: null,
};

let profile: Profile = EMPTY;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return profile;
}

function emit() {
  listeners.forEach(listener => listener());
}

export function updateProfile(changes: Partial<Profile>) {
  profile = { ...profile, ...changes };
  emit();
}

export function clearProfile() {
  profile = EMPTY;
  emit();
}

export function useProfile() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
