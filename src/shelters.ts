import * as turf from '@turf/turf';
import * as L from 'leaflet';
import shelterData from './data/shelters.geojson';
import { UserPosition, ShelterProperties, ShelterType, ShelterFeature } from './types';

const TYPE_COLORS: Record<ShelterType, string> = {
  subway:   '#4a90e2',
  hospital: '#e74c3c',
  parking:  '#f39c12',
  building: '#2ecc71',
};

const TYPE_ICONS: Record<ShelterType, string> = {
  subway:   '🚇',
  hospital: '🏥',
  parking:  '🅿️',
  building: '🏢',
};

export function getNearestShelter(userPos: UserPosition): ShelterFeature {
  const userPt = turf.point([userPos.lng, userPos.lat]);
  const fc = shelterData as GeoJSON.FeatureCollection<GeoJSON.Point, ShelterProperties>;
  const nearest = turf.nearestPoint(userPt, fc);
  return nearest as unknown as ShelterFeature;
}

export function getDistanceMeters(userPos: UserPosition, shelter: ShelterFeature): number {
  const from = turf.point([userPos.lng, userPos.lat]);
  const to   = turf.point(shelter.geometry.coordinates);
  return Math.round(turf.distance(from, to, { units: 'meters' }));
}

export function getWalkingTimeMin(distanceM: number): number {
  return Math.ceil((distanceM / 1000 / 5) * 60);
}

export function renderShelterMarkers(map: L.Map): L.LayerGroup {
  const group = L.layerGroup();
  const fc = shelterData as GeoJSON.FeatureCollection<GeoJSON.Point, ShelterProperties>;

  fc.features.forEach((f) => {
    const [lng, lat] = f.geometry.coordinates;
    const props = f.properties;
    const color = TYPE_COLORS[props.type];
    const icon = TYPE_ICONS[props.type];

    const marker = L.circleMarker([lat, lng], {
      radius: 7,
      fillColor: color,
      color: '#fff',
      weight: 1.5,
      fillOpacity: 0.9,
    });

    marker.bindPopup(`
      <div style="font-family:sans-serif;min-width:160px">
        <div style="font-weight:700;font-size:13px">${icon} ${props.name}</div>
        <div style="font-size:11px;color:#888;margin-top:2px">${props.address}</div>
        <div style="margin-top:6px;font-size:11px">
          <span style="background:#eee;padding:2px 6px;border-radius:3px;margin-right:4px">${props.depthLevels} lvls UG</span>
          <span style="background:#eee;padding:2px 6px;border-radius:3px">~${props.capacityApprox.toLocaleString()} cap</span>
        </div>
      </div>
    `);

    marker.addTo(group);
  });

  return group.addTo(map);
}
