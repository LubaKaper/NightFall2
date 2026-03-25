import * as turf from '@turf/turf';
import * as L from 'leaflet';
import { BlastConfig, UserPosition } from './types';
import { getWindDirectionLabel } from './threat';

export function drawEvacRoute(map: L.Map, userPos: UserPosition, config: BlastConfig): L.Polyline {
  // Evacuate perpendicular to wind (crosswind) + away from blast
  const crossBearing = (config.windBearing + 90) % 360;
  const userPt = turf.point([userPos.lng, userPos.lat]);
  const dest = turf.destination(userPt, 40, crossBearing, { units: 'kilometers' });

  return L.polyline([
    [userPos.lat, userPos.lng],
    [dest.geometry.coordinates[1], dest.geometry.coordinates[0]],
  ], {
    color: '#2ecc71',
    weight: 4,
    opacity: 0.9,
  }).addTo(map);
}

export function renderEvacTab(container: HTMLElement, config: BlastConfig): void {
  const crossBearing = (config.windBearing + 90) % 360;
  const windDir = getWindDirectionLabel(config.windBearing);
  const evacDir = getWindDirectionLabel(crossBearing);

  container.innerHTML = `
    <div class="evac-card">
      <div class="evac-card-title">Evacuation Direction</div>
      <div class="evac-direction">${evacDir} — ${crossBearing}°</div>
      <div class="evac-sub">Drive or run <strong>crosswind</strong> to avoid the fallout plume. Route shown on map (green line).</div>
    </div>

    <div class="evac-card" style="background:#0a0a1a;border-color:#1a1a4a">
      <div class="evac-card-title" style="color:#8E44AD">Wind & Fallout</div>
      <div style="font-size:13px;color:#ccc">Current wind: <strong>${windDir}</strong> (${config.windBearing}°)</div>
      <div style="font-size:12px;color:#888;margin-top:4px">Fallout plume extends ~18km downwind. Do not drive into the plume.</div>
    </div>

    <div class="evac-warning">
      <strong>Do NOT drive downwind (${windDir}).</strong> Fallout travels with the wind and concentrates in low-lying areas.
      Cross the wind corridor first, then move away from the blast center.
    </div>
  `;
}
