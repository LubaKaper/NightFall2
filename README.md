# ☢️ Nuclear Force: The Golden Hour Router

> *"Most people won't die from the blast. They'll die because they don't know which way the wind is blowing."*

**Nuclear Force** is a hyper-local survival router built for the first 60 minutes after a nuclear event. Open it, and in under 3 seconds you have the nearest safe basement, your walking time, and a blue line to follow.

No accounts. No searching. No server. Just a plan.

---

## What it does

Drop a blast epicenter on the map. Enter your address. Hit **Analyze**.

In seconds you get:

- **Nearest shelter** — subway stations, hospital basements, reinforced parking garages. Ranked by shielding factor, not just distance.
- **Walking directions** — 7 steps. Clear. No jargon.
- **Blast radius visualization** — fireball / heavy blast / light blast zones rendered live in your browser with zero server calls.
- **Fallout plume** — directional cone driven by prevailing wind bearing. Purple because radiation is spooky.
- **Crosswind evacuation route** — if you're outside the blast zone, the app tells you exactly which direction to run so you don't drive into fallout.

---

## The 3-second pitch

Open app live. Hero card auto-appears. Switch to Threat tab — blast circles deliver the visual shock. Hand phone to a judge. Done.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | TypeScript + Vite |
| Map | Leaflet.js + OpenStreetMap |
| Geometry | Turf.js (fully client-side) |
| Geocoding | Nominatim (free, no key) |
| Shelter Data | Static GeoJSON — 12 NYC locations |
| Deployment | Vercel / Replit |

**Bundle size:** 169kb JS gzipped to 50kb. Loads fast even on stressed networks.

---

## Run it locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. No env vars, no API keys, no setup.

---

## Deploy to Vercel

```bash
npx vercel --yes
git push origin main  # auto-deploys on every push
```

Zero config. OSM tiles and Nominatim are both free with no registration required.

---

## Yield presets

| Preset | Fireball | Heavy Blast | Light Blast |
|---|---|---|---|
| Dirty Bomb | 50m | 200m | 500m |
| 10 Kiloton | 0.5km | 1.5km | 4km |
| 100 Kiloton | 1.5km | 4km | 10km |
| 1 Megaton | 5km | 12km | 25km |

---

## NYC Shelter Dataset

12 hardcoded shelters covering Manhattan, Brooklyn, Queens, and Staten Island:

- **Subway stations** — deepest, highest shielding (Grand Central: 4 levels underground, ~10,000 capacity)
- **Hospitals** — reinforced structures, medical support
- **Parking garages** — dense concrete, multiple underground levels
- **Reinforced buildings** — fallback option

---

## How the fallout plume works

Wind bearing defaults to 225° (SW). The plume polygon is computed client-side using Turf.js:

```
epicenter → destination(18km, windBearing)        = plume tip
epicenter → destination(4km, windBearing + 90°)   = left edge
epicenter → destination(4km, windBearing - 90°)   = right edge
```

No API call. Renders in milliseconds. Accurate enough to save your life.

---

## What's next (post-hackathon backlog)

- [ ] Real-time wind from Open-Meteo API (free, no key)
- [ ] OSRM turn-by-turn walking directions
- [ ] Dynamic shelter data via OSM Overpass API
- [ ] PWA + offline tile caching
- [ ] USGS/FEMA alert feed integration for auto-epicenter

---

Built in 2 hours. It might save your life.
