import { UserPosition } from './types';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const HEADERS = { 'Accept-Language': 'en', 'User-Agent': 'NuclearForce/1.0' };

export async function geocodeAddress(query: string): Promise<UserPosition> {
  const url = `${NOMINATIM_BASE}/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=us`;
  const res = await fetch(url, { headers: HEADERS });
  const data = await res.json();
  if (!data.length) throw new Error('Address not found');
  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    label: data[0].display_name,
  };
}

export function getUserPosition(): Promise<UserPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({
        lat: coords.latitude,
        lng: coords.longitude,
        accuracy: coords.accuracy,
        label: 'My Location',
      }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  });
}
