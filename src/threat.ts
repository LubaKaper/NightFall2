import * as turf from '@turf/turf';
import * as L from 'leaflet';
import { BlastConfig, BLAST_RADII, UserPosition, YieldPreset } from './types';

const ZONE_STYLES = [
  { key: 'lightBlast',  color: '#F1C40F', label: 'Light Blast'  },
  { key: 'heavyBlast',  color: '#E67E22', label: 'Heavy Blast'  },
  { key: 'fireball',    color: '#E74C3C', label: 'Fireball'     },
] as const;

export function drawBlastZones(map: L.Map, config: BlastConfig): L.LayerGroup {
  const radii = BLAST_RADII[config.yieldPreset];
  const epi   = turf.point([config.epicenterLng, config.epicenterLat]);
  const group = L.layerGroup();

  ZONE_STYLES.forEach(({ key, color, label }) => {
    const circle = turf.circle(epi, radii[key], { steps: 64, units: 'kilometers' });
    L.geoJSON(circle, {
      style: {
        color,
        fillColor: color,
        fillOpacity: 0.22,
        weight: 1.5,
        opacity: 0.7,
      },
    }).bindTooltip(label, { permanent: false, sticky: true }).addTo(group);
  });

  return group.addTo(map);
}

export function drawFalloutPlume(map: L.Map, config: BlastConfig): L.Polygon {
  const epi   = turf.point([config.epicenterLng, config.epicenterLat]);
  const tip   = turf.destination(epi, 18, config.windBearing, { units: 'kilometers' });
  const left  = turf.destination(epi, 4,  config.windBearing + 90, { units: 'kilometers' });
  const right = turf.destination(epi, 4,  config.windBearing - 90, { units: 'kilometers' });

  const coords = [left, tip, right].map(p => [
    p.geometry.coordinates[1],
    p.geometry.coordinates[0],
  ] as [number, number]);

  return L.polygon(coords, {
    color: '#8E44AD',
    fillColor: '#8E44AD',
    fillOpacity: 0.18,
    weight: 1.5,
    dashArray: '6,4',
  }).addTo(map);
}

export function drawEscapeRoute(map: L.Map, userPos: UserPosition, config: BlastConfig): L.Polyline {
  // Route perpendicular to wind bearing (crosswind escape)
  const crossBearing = (config.windBearing + 90) % 360;
  const epi = turf.point([config.epicenterLng, config.epicenterLat]);
  const safeZone = turf.destination(epi, 30, crossBearing + 180, { units: 'kilometers' });

  return L.polyline([
    [userPos.lat, userPos.lng],
    [safeZone.geometry.coordinates[1], safeZone.geometry.coordinates[0]],
  ], {
    color: '#00e5ff',
    weight: 3,
    opacity: 0.85,
  }).addTo(map);
}

export function getUserZone(userPos: UserPosition, config: BlastConfig): string {
  const epi = turf.point([config.epicenterLng, config.epicenterLat]);
  const user = turf.point([userPos.lng, userPos.lat]);
  const distKm = turf.distance(epi, user, { units: 'kilometers' });
  const radii = BLAST_RADII[config.yieldPreset];

  if (distKm <= radii.fireball)    return 'Fireball Zone — FATAL';
  if (distKm <= radii.heavyBlast)  return 'Heavy Blast Zone — Severe Risk';
  if (distKm <= radii.lightBlast)  return 'Light Blast Zone — Shelter Now';
  return 'Outside Blast Zone — Monitor Fallout';
}

export function getWindDirectionLabel(bearing: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(bearing / 45) % 8];
}

export function renderThreatTab(
  container: HTMLElement,
  config: BlastConfig,
  userPos: UserPosition
): void {
  const radii = BLAST_RADII[config.yieldPreset];
  const userZone = getUserZone(userPos, config);
  const windDir = getWindDirectionLabel(config.windBearing);

  const isEvacZone = userZone.includes('Outside');
  const alertColor = isEvacZone ? '#2ecc71' : '#e74c3c';

  container.innerHTML = `
    <div class="user-zone-card">
      <div class="user-zone-title">Your Status</div>
      <div class="user-zone-status" style="color:${alertColor}">${userZone}</div>
    </div>

    <div class="threat-zone-card fireball">
      <div class="zone-name">Fireball Zone</div>
      <div class="zone-radius">${radii.fireball < 1 ? (radii.fireball * 1000).toFixed(0) + 'm' : radii.fireball + 'km'} radius</div>
      <div class="zone-desc">Complete destruction. No survival possible within this zone.</div>
    </div>

    <div class="threat-zone-card heavy">
      <div class="zone-name">Heavy Blast Zone</div>
      <div class="zone-radius">${radii.heavyBlast}km radius</div>
      <div class="zone-desc">Severe structural damage, fires, 50%+ casualties. Shelter immediately underground.</div>
    </div>

    <div class="threat-zone-card light">
      <div class="zone-name">Light Blast Zone</div>
      <div class="zone-radius">${radii.lightBlast}km radius</div>
      <div class="zone-desc">Broken windows, debris injuries, radiation risk. Seek deep shelter now.</div>
    </div>

    <div class="threat-wind-card">
      <div class="threat-wind-title">Fallout Drift</div>
      <div class="threat-wind-val">Wind bearing: ${config.windBearing}° (${windDir}) — Plume extends ~18km downwind</div>
    </div>
  `;
}
