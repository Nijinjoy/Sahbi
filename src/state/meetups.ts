import { useSyncExternalStore } from 'react';
import { Meetup, SAMPLE_MEETUPS } from '../data/sampleMeetups';

let created: Meetup[] = [];
let all: Meetup[] = SAMPLE_MEETUPS;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return all;
}

export function addMeetup(meetup: Omit<Meetup, 'id'>) {
  const id = `mine-${Date.now()}`;
  created = [{ ...meetup, id, hostedByMe: true }, ...created];
  all = [...created, ...SAMPLE_MEETUPS];
  listeners.forEach(listener => listener());
  return id;
}

export function useMeetups() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
