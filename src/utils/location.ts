import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation, {
  GeolocationError,
} from '@react-native-community/geolocation';
import { GOOGLE_MAPS_API_KEY } from '@env';
import { updateProfile } from '../state/profile';

export const UAE_CITIES = [
  { name: 'Dubai', latitude: 25.2048, longitude: 55.2708 },
  { name: 'Abu Dhabi', latitude: 24.4539, longitude: 54.3773 },
  { name: 'Sharjah', latitude: 25.3463, longitude: 55.4209 },
  { name: 'Al Ain', latitude: 24.2075, longitude: 55.7447 },
  { name: 'Ajman', latitude: 25.4052, longitude: 55.5136 },
  { name: 'Ras Al Khaimah', latitude: 25.8007, longitude: 55.9762 },
  { name: 'Fujairah', latitude: 25.1288, longitude: 56.3265 },
  { name: 'Umm Al Quwain', latitude: 25.5647, longitude: 55.5552 },
] as const;

export type UaeCity = (typeof UAE_CITIES)[number]['name'];

export type Coordinates = { latitude: number; longitude: number };

export type LocationResult =
  | {
      status: 'ok';
      city: UaeCity;
      /** Neighbourhood / district from Google, e.g. "Dubai Marina". */
      area: string | null;
      /** Full street address from Google, without the country. */
      address: string | null;
      coords: Coordinates;
    }
  | {
      status: 'outside';
      area: string | null;
      address: string | null;
      coords: Coordinates;
    }
  | { status: 'denied'; canAskAgain: boolean }
  | { status: 'unavailable' };

Geolocation.setRNConfiguration({
  skipPermissionRequests: true,
  authorizationLevel: 'whenInUse',
  locationProvider: 'auto',
});

const UAE_BOUNDS = { minLat: 22.5, maxLat: 26.5, minLng: 51.0, maxLng: 56.6 };

function distanceKm(a: Coordinates, b: Coordinates) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) *
      Math.cos(toRad(b.latitude)) *
      Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

export function nearestUaeCity(coords: Coordinates): UaeCity | null {
  const inUae =
    coords.latitude >= UAE_BOUNDS.minLat &&
    coords.latitude <= UAE_BOUNDS.maxLat &&
    coords.longitude >= UAE_BOUNDS.minLng &&
    coords.longitude <= UAE_BOUNDS.maxLng;
  if (!inUae) {
    return null;
  }
  let best: UaeCity = UAE_CITIES[0].name;
  let bestDistance = Infinity;
  for (const city of UAE_CITIES) {
    const d = distanceKm(coords, city);
    if (d < bestDistance) {
      bestDistance = d;
      best = city.name;
    }
  }
  return best;
}

export type PermissionResult = 'granted' | 'denied' | 'blocked';

/** Shows the native location permission prompt (no-op if already decided). */
export async function requestLocationPermission(): Promise<PermissionResult> {
  if (Platform.OS === 'android') {
    // Ask for precise + approximate together (required on Android 12+, where
    // the user can still pick "Approximate" — we accept either).
    const { ACCESS_FINE_LOCATION: FINE, ACCESS_COARSE_LOCATION: COARSE } =
      PermissionsAndroid.PERMISSIONS;
    const results = await PermissionsAndroid.requestMultiple([FINE, COARSE]);
    const { GRANTED, NEVER_ASK_AGAIN } = PermissionsAndroid.RESULTS;
    if (results[FINE] === GRANTED || results[COARSE] === GRANTED) {
      return 'granted';
    }
    return results[FINE] === NEVER_ASK_AGAIN ||
      results[COARSE] === NEVER_ASK_AGAIN
      ? 'blocked'
      : 'denied';
  }

  return new Promise(resolve => {
    Geolocation.requestAuthorization(
      () => resolve('granted'),
      (error: GeolocationError) =>
        resolve(error.code === error.PERMISSION_DENIED ? 'blocked' : 'denied'),
    );
  });
}

function getPositionOnce(highAccuracy: boolean): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      reject,
      { enableHighAccuracy: highAccuracy, timeout: 15000, maximumAge: 60 * 1000 },
    );
  });
}

/**
 * GPS-level fix first; if that times out (common indoors), fall back to a
 * Wi-Fi/cell fix so we still get a location.
 */
async function getPosition(): Promise<Coordinates> {
  try {
    return await getPositionOnce(true);
  } catch (error) {
    const geoError = error as GeolocationError;
    if (geoError?.code === geoError?.PERMISSION_DENIED) {
      throw error;
    }
    console.warn('[location] precise fix failed, retrying', geoError?.message);
    return getPositionOnce(false);
  }
}

type GeocodeComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

type GeocodeResponse = {
  status: string;
  error_message?: string;
  results: {
    formatted_address: string;
    types: string[];
    address_components: GeocodeComponent[];
  }[];
};

type ReverseGeocode = {
  inUae: boolean;
  city: UaeCity | null;
  area: string | null;
  address: string | null;
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/emirate( of)?/g, '')
    .replace(/[^a-z]/g, '');

function matchUaeCity(name: string | undefined): UaeCity | null {
  if (!name) {
    return null;
  }
  const key = normalize(name);
  return UAE_CITIES.find(c => normalize(c.name) === key)?.name ?? null;
}

/** Reverse-geocodes coordinates with the Google Geocoding API. */
async function reverseGeocode(coords: Coordinates): Promise<ReverseGeocode> {
  const url =
    'https://maps.googleapis.com/maps/api/geocode/json' +
    `?latlng=${coords.latitude},${coords.longitude}` +
    `&language=en&key=${GOOGLE_MAPS_API_KEY}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    const data: GeocodeResponse = await response.json();
    if (data.status !== 'OK' || data.results.length === 0) {
      throw new Error(
        `Geocoding failed: ${data.status} ${data.error_message ?? ''}`,
      );
    }

    const components = data.results.flatMap(r => r.address_components);
    const find = (type: string) => components.find(c => c.types.includes(type));

    const inUae = find('country')?.short_name === 'AE';
    const locality = find('locality')?.long_name;
    const emirate = find('administrative_area_level_1')?.long_name;
    // Locality first so Al Ain wins over its emirate (Abu Dhabi).
    const city = matchUaeCity(locality) ?? matchUaeCity(emirate);
    const area =
      find('neighborhood')?.long_name ??
      find('sublocality_level_1')?.long_name ??
      find('sublocality')?.long_name ??
      null;

    // Results come most-specific first; skip bare plus-code-only results.
    const best =
      data.results.find(r => !r.types.includes('plus_code')) ?? data.results[0];
    const address = best.formatted_address
      .replace(/\s*[-,]\s*United Arab Emirates$/i, '')
      // Drop a leading plus code segment: "34JR+647 - Braih St - …".
      .replace(/^[23456789CFGHJMPQRVWX]{2,8}\+[23456789CFGHJMPQRVWX]{0,3}\s*[-,]\s*/i, '')
      .trim();

    return {
      inUae,
      city,
      area: area && area !== city ? area : null,
      address: address || null,
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchCurrentCity(): Promise<LocationResult> {
  const permission = await requestLocationPermission();
  if (permission !== 'granted') {
    return { status: 'denied', canAskAgain: permission === 'denied' };
  }
  return locateCity();
}

/** Gets the current city. Assumes location permission is already granted. */
export async function locateCity(): Promise<LocationResult> {
  let coords: Coordinates;
  try {
    coords = await getPosition();
  } catch (error) {
    const geoError = error as GeolocationError;
    console.warn('[location] could not get position', geoError?.message);
    if (geoError?.code === geoError?.PERMISSION_DENIED) {
      return { status: 'denied', canAskAgain: false };
    }
    return { status: 'unavailable' };
  }

  try {
    const place = await reverseGeocode(coords);
    if (!place.inUae) {
      return {
        status: 'outside',
        area: place.area,
        address: place.address,
        coords,
      };
    }
    const city = place.city ?? nearestUaeCity(coords);
    if (city) {
      return {
        status: 'ok',
        city,
        area: place.area,
        address: place.address,
        coords,
      };
    }
  } catch (error) {
    // Network/API problem: fall back to the offline nearest-city lookup.
    console.warn('[location] reverse geocoding failed', error);
  }

  const city = nearestUaeCity(coords);
  return city
    ? { status: 'ok', city, area: null, address: null, coords }
    : { status: 'outside', area: null, address: null, coords };
}

/**
 * Looks up the current location and saves it to the profile. Outside the UAE
 * the street address is still saved, just without a UAE city.
 */
export async function refreshProfileLocation(): Promise<LocationResult> {
  const result = await locateCity();
  console.log('[location]', result.status);
  if (result.status === 'ok') {
    updateProfile({
      city: result.city,
      area: result.area,
      address: result.address,
      coords: result.coords,
    });
  } else if (result.status === 'outside') {
    updateProfile({
      city: null,
      area: result.area,
      address: result.address,
      coords: result.coords,
    });
  }
  return result;
}
