import * as L from 'leaflet';

export function initMap(containerId: string): L.Map {
  const map = L.map(containerId, {
    center: [40.7128, -74.0060],
    zoom: 11,
    zoomControl: true,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  return map;
}

export function createUserMarker(lat: number, lng: number): L.CircleMarker {
  return L.circleMarker([lat, lng], {
    radius: 9,
    fillColor: '#4a90e2',
    color: '#fff',
    weight: 2.5,
    fillOpacity: 1,
  });
}

export function createBlastMarker(lat: number, lng: number): L.CircleMarker {
  return L.circleMarker([lat, lng], {
    radius: 8,
    fillColor: '#fff',
    color: '#e74c3c',
    weight: 3,
    fillOpacity: 1,
  });
}
