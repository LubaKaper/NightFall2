import * as L from 'leaflet';
import { YieldPreset, BLAST_RADII } from './types';

export function enablePlaceBlastMode(
  map: L.Map,
  onSet: (latlng: L.LatLng) => void
): void {
  map.getContainer().style.cursor = 'crosshair';
  map.once('click', (e: L.LeafletMouseEvent) => {
    map.getContainer().style.cursor = '';
    onSet(e.latlng);
  });
}

export function getRadiiForYield(preset: YieldPreset) {
  return BLAST_RADII[preset];
}
