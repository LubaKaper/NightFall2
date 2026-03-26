import * as L from 'leaflet';
import { initMap, createUserMarker, createBlastMarker } from './map';
import { geocodeAddress, getUserPosition } from './gps';
import { enablePlaceBlastMode } from './blast';
import { getNearestShelter, getDistanceMeters, getWalkingTimeMin, renderShelterMarkers } from './shelters';
import { drawBlastZones, drawFalloutPlume, renderThreatTab, getUserZone } from './threat';
import { drawWalkRoute, updateShelterCard } from './routing';
import { renderWalkingDirections } from './directions';
import { drawEvacRoute, renderEvacTab } from './evacuate';
import { initSidebar, openSidebar, updateAlertBanner } from './sidebar';
import { initDisclaimerModal } from './disclaimer';
import * as turf from '@turf/turf';
import { BlastConfig, UserPosition, YieldPreset } from './types';

// ─── State ───────────────────────────────────────────────────────────
let map: L.Map;
let userPos: UserPosition | null = null;
let blastConfig: BlastConfig = {
  epicenterLat: 40.7580,
  epicenterLng: -73.9855,
  yieldPreset: '10kt',
  windBearing: 225,
};

let userMarker: L.CircleMarker | null = null;
let blastMarker: L.CircleMarker | null = null;
let analysisLayers: L.Layer[] = [];
let shelterMarkers: L.LayerGroup | null = null;

// ─── Init ─────────────────────────────────────────────────────────────
initDisclaimerModal();
map = initMap('map');
initSidebar();

// ─── Yield buttons ────────────────────────────────────────────────────
document.querySelectorAll<HTMLButtonElement>('.yield-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.yield-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    blastConfig.yieldPreset = btn.dataset.yield as YieldPreset;
  });
});

// ─── GPS button ───────────────────────────────────────────────────────
const gpsBtn = document.getElementById('gps-btn')!;
const gpsBanner = document.getElementById('gps-banner')!;

gpsBtn.addEventListener('click', async () => {
  gpsBtn.classList.add('loading');
  gpsBanner.classList.remove('hidden');
  gpsBanner.textContent = 'Acquiring GPS...';
  try {
    userPos = await getUserPosition();
    (document.getElementById('address-input') as HTMLInputElement).value = 'My Location';
    placeUserMarker(userPos.lat, userPos.lng);
    map.setView([userPos.lat, userPos.lng], 13);
    gpsBanner.classList.add('hidden');
  } catch {
    gpsBanner.textContent = 'GPS unavailable — enter address manually';
    setTimeout(() => gpsBanner.classList.add('hidden'), 3000);
  } finally {
    gpsBtn.classList.remove('loading');
  }
});

// ─── Address input ────────────────────────────────────────────────────
const addressInput = document.getElementById('address-input') as HTMLInputElement;
addressInput.addEventListener('keydown', async (e) => {
  if (e.key === 'Enter' && addressInput.value.trim()) {
    await resolveAddress(addressInput.value.trim());
  }
});

async function resolveAddress(query: string): Promise<void> {
  gpsBanner.textContent = 'Locating...';
  gpsBanner.classList.remove('hidden');
  try {
    userPos = await geocodeAddress(query);
    addressInput.value = userPos.label?.split(',').slice(0, 2).join(',') ?? query;
    placeUserMarker(userPos.lat, userPos.lng);
    gpsBanner.classList.add('hidden');
  } catch {
    gpsBanner.textContent = 'Address not found — try again';
    gpsBanner.style.background = 'rgba(231,76,60,0.92)';
    setTimeout(() => gpsBanner.classList.add('hidden'), 3000);
  }
}

// ─── Place Blast button ───────────────────────────────────────────────
const placeBlastBtn = document.getElementById('place-blast-btn')!;
const blastBanner   = document.getElementById('blast-banner')!;

placeBlastBtn.addEventListener('click', () => {
  placeBlastBtn.classList.add('active');
  placeBlastBtn.textContent = 'Click map...';

  enablePlaceBlastMode(map, (latlng) => {
    blastConfig.epicenterLat = latlng.lat;
    blastConfig.epicenterLng = latlng.lng;

    if (blastMarker) blastMarker.remove();
    blastMarker = createBlastMarker(latlng.lat, latlng.lng).addTo(map);

    placeBlastBtn.classList.remove('active');
    placeBlastBtn.textContent = 'Place Blast';
    blastBanner.classList.remove('hidden');
    setTimeout(() => blastBanner.classList.add('hidden'), 3000);
  });
});

// ─── Analyze button ───────────────────────────────────────────────────
document.getElementById('analyze-btn')!.addEventListener('click', async () => {
  // If no user position, try to resolve the address field
  if (!userPos) {
    const val = addressInput.value.trim();
    if (val && val !== 'My Location') {
      await resolveAddress(val);
    }
    if (!userPos) {
      blastBanner.textContent = 'Enter your address or click GPS first';
      blastBanner.classList.remove('hidden');
      setTimeout(() => blastBanner.classList.add('hidden'), 3000);
      return;
    }
  }

  runAnalysis();
});

// ─── Core analysis ────────────────────────────────────────────────────
function runAnalysis(): void {
  if (!userPos) return;

  // Clear previous layers
  analysisLayers.forEach(l => l.remove());
  analysisLayers = [];
  if (shelterMarkers) { shelterMarkers.remove(); shelterMarkers = null; }

  // Hide how-to card
  document.getElementById('how-to-card')!.classList.add('hidden');

  // Draw blast zones + fallout
  const blastGroup = drawBlastZones(map, blastConfig);
  const plume = drawFalloutPlume(map, blastConfig);
  analysisLayers.push(blastGroup, plume);

  // Shelter markers
  shelterMarkers = renderShelterMarkers(map);

  // Find nearest shelter
  const nearest = getNearestShelter(userPos);
  const distM = getDistanceMeters(userPos, nearest);
  const walkMin = getWalkingTimeMin(distM);

  // Walk route
  const walkLine = drawWalkRoute(map, userPos, nearest);
  analysisLayers.push(walkLine);

  // Evac route
  const evacLine = drawEvacRoute(map, userPos, blastConfig);
  analysisLayers.push(evacLine);

  // Update shelter card + directions
  updateShelterCard(nearest, distM, walkMin);
  renderWalkingDirections(nearest);

  // Update threat tab
  const threatContainer = document.getElementById('threat-content')!;
  renderThreatTab(threatContainer, blastConfig, userPos);

  // Update evacuate tab
  const evacContainer = document.getElementById('evacuate-content')!;
  renderEvacTab(evacContainer, blastConfig);

  // Update alert banner
  const epi = turf.point([blastConfig.epicenterLng, blastConfig.epicenterLat]);
  const user = turf.point([userPos.lng, userPos.lat]);
  const distKm = turf.distance(epi, user, { units: 'kilometers' });
  const zoneLabel = getUserZone(userPos, blastConfig);
  updateAlertBanner(distKm, zoneLabel);

  // Open sidebar
  openSidebar();

  // Fit map to show both epicenter + user
  const bounds = L.latLngBounds(
    [blastConfig.epicenterLat, blastConfig.epicenterLng],
    [userPos.lat, userPos.lng]
  ).pad(0.3);
  map.fitBounds(bounds);
}

// ─── Helpers ──────────────────────────────────────────────────────────
function placeUserMarker(lat: number, lng: number): void {
  if (userMarker) userMarker.remove();
  userMarker = createUserMarker(lat, lng).addTo(map);
  userMarker.bindPopup('Your Location').openPopup();
}
