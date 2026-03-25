# Nuclear Force — CLAUDE.md

## Project

Hackathon app. Fully client-side nuclear survival router. No backend, no auth, no database.
Stack: TypeScript + Vite + Leaflet + Turf.js + OpenStreetMap + Nominatim geocoding.

## Architecture

All logic runs in the browser. Data flow on Analyze click:

1. User position (GPS or Nominatim geocode) + blast epicenter (map click) + yield preset
2. `threat.ts` — Turf.js computes blast radius circles and fallout plume polygon
3. `shelters.ts` — `turf.nearestPoint()` finds closest shelter from GeoJSON dataset
4. `routing.ts` + `directions.ts` — shelter card + walk polyline + 7-step directions
5. `evacuate.ts` — crosswind evac route (perpendicular to wind bearing)
6. `sidebar.ts` — opens right panel, populates all 3 tabs

## Module map

| File | Responsibility |
|---|---|
| `src/main.ts` | Event wiring, analysis orchestrator, layer lifecycle |
| `src/types.ts` | All interfaces + `BLAST_RADII` constants |
| `src/map.ts` | Leaflet init, user/blast circle markers |
| `src/gps.ts` | `navigator.geolocation` + Nominatim fetch |
| `src/blast.ts` | Yield preset selector + click-to-place epicenter mode |
| `src/shelters.ts` | GeoJSON loader, nearest shelter, distance, walk time, map markers |
| `src/threat.ts` | Blast circles, fallout polygon, user zone classification, threat tab HTML |
| `src/routing.ts` | Walk-to-shelter polyline + shelter card DOM update |
| `src/directions.ts` | 7-step walking directions renderer |
| `src/evacuate.ts` | Crosswind evac polyline + evacuate tab HTML |
| `src/sidebar.ts` | Tab switcher, open/close, alert banner text |
| `src/ui.ts` | (reserved for legend/how-to if refactored out of index.html) |
| `src/data/shelters.geojson` | 12 NYC shelters — subway, hospital, parking, building |
| `src/global.d.ts` | `.geojson` import type declaration |

## Key decisions

- **Leaflet import**: use `import * as L from 'leaflet'` — @types/leaflet has no default export
- **Turf import**: use `import * as turf from '@turf/turf'` with `"moduleResolution": "node"` in tsconfig — "bundler" resolution breaks turf type lookup
- **GeoJSON in Vite**: custom transform plugin in `vite.config.ts` wraps `.geojson` files as ES modules (`export default ...`)
- **No Mapbox token**: uses OSM standard tiles — free, no registration, works immediately on Vercel/Replit
- **Nominatim**: max 1 req/sec, must include `User-Agent: NuclearForce/1.0` header

## Shelter data

12 NYC locations in `src/data/shelters.geojson`. Schema:

```ts
{
  id, name, address,
  type: 'subway' | 'hospital' | 'parking' | 'building',
  depthLevels: number,      // floors underground
  capacityApprox: number,
  shieldingFactor: number,  // 0.0–1.0
}
```

## Blast radii (km)

| Preset | Fireball | Heavy Blast | Light Blast |
|---|---|---|---|
| dirty-bomb | 0.05 | 0.2 | 0.5 |
| 10kt | 0.5 | 1.5 | 4.0 |
| 100kt | 1.5 | 4.0 | 10.0 |
| 1mt | 5.0 | 12.0 | 25.0 |

## Layout

Desktop-first. Right sidebar (320px) slides in on Analyze. Mobile: sidebar becomes full-width bottom drawer (50vh, slides up). Breakpoint: 768px.

## Pending items (from TDD section 11)

- `src/evacuate.ts` — evac route rendering is done; tab HTML is done; green polyline draws on Analyze
- Mobile responsive bottom drawer — CSS breakpoint is written, needs device testing
- Threat tab user zone classification — implemented in `getUserZone()` in `threat.ts`

## Commands

```bash
npm run dev      # dev server on :3000
npm run build    # production build → dist/
npx vercel --yes # deploy
```
