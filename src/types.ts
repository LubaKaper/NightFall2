export type ShelterType = 'subway' | 'hospital' | 'parking' | 'building';

export interface ShelterProperties {
  id: string;
  name: string;
  address: string;
  type: ShelterType;
  depthLevels: number;
  capacityApprox: number;
  shieldingFactor: number;
}

export interface UserPosition {
  lat: number;
  lng: number;
  accuracy?: number;
  label?: string;
}

export type YieldPreset = 'dirty-bomb' | '10kt' | '100kt' | '1mt';

export interface BlastConfig {
  epicenterLat: number;
  epicenterLng: number;
  yieldPreset: YieldPreset;
  windBearing: number;
}

export const BLAST_RADII: Record<YieldPreset, { fireball: number; heavyBlast: number; lightBlast: number }> = {
  'dirty-bomb': { fireball: 0.05, heavyBlast: 0.2,  lightBlast: 0.5  },
  '10kt':        { fireball: 0.5,  heavyBlast: 1.5,  lightBlast: 4.0  },
  '100kt':       { fireball: 1.5,  heavyBlast: 4.0,  lightBlast: 10.0 },
  '1mt':         { fireball: 5.0,  heavyBlast: 12.0, lightBlast: 25.0 },
};

export const YIELD_LABELS: Record<YieldPreset, string> = {
  'dirty-bomb': 'Dirty Bomb',
  '10kt': '10 Kiloton',
  '100kt': '100 Kiloton',
  '1mt': '1 Megaton',
};

export type ShelterFeature = GeoJSON.Feature<GeoJSON.Point, ShelterProperties>;
