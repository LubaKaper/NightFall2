import * as L from 'leaflet';
import { UserPosition, ShelterFeature } from './types';

export function drawWalkRoute(map: L.Map, userPos: UserPosition, shelter: ShelterFeature): L.Polyline {
  const [lng, lat] = shelter.geometry.coordinates;
  return L.polyline([
    [userPos.lat, userPos.lng],
    [lat, lng],
  ], {
    color: '#4a90e2',
    weight: 3,
    opacity: 0.8,
    dashArray: '8,5',
  }).addTo(map);
}

export function updateShelterCard(
  shelter: ShelterFeature,
  distanceM: number,
  walkMin: number
): void {
  const props = shelter.properties;

  const TYPE_LABELS: Record<string, string> = {
    subway:   'Subway Station',
    hospital: 'Hospital',
    parking:  'Parking Garage',
    building: 'Reinforced Building',
  };

  document.getElementById('shelter-card')!.classList.remove('hidden');
  document.getElementById('shelter-placeholder')!.classList.add('hidden');
  document.getElementById('shelter-type-badge')!.textContent = TYPE_LABELS[props.type] ?? props.type;
  document.getElementById('shelter-name')!.textContent = props.name;
  document.getElementById('shelter-address')!.textContent = props.address;
  document.getElementById('stat-distance')!.textContent = distanceM > 999
    ? (distanceM / 1000).toFixed(1) + 'k'
    : String(distanceM);
  document.getElementById('stat-walk')!.textContent = String(walkMin);
  document.getElementById('stat-depth')!.textContent = String(props.depthLevels);
  document.getElementById('shelter-capacity')!.textContent = `~${props.capacityApprox.toLocaleString()} person capacity`;
}
