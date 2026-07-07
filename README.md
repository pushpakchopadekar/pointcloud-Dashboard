# Point Cloud Survey Dashboard

A React + TypeScript dashboard for visualizing large 3D point cloud (`.ply`) survey
data — built for the **3D Bharat** road-design dataset
(`Road_Design_Charholi.ply`), with Header / Sidebar / 3D Viewer layout,
zoom-pan-rotate navigation, live styling controls, and an instrument-panel HUD
showing point count, load status, and camera position.

![status](https://img.shields.io/badge/status-ready-4FD1C5)

## Tech Stack

| Layer        | Choice                                   |
|--------------|-------------------------------------------|
| UI framework | React 18 + TypeScript                    |
| Build tool   | Vite                                      |
| Styling      | Tailwind CSS                              |
| 3D rendering | Three.js via `@react-three/fiber` + `@react-three/drei` |
| Data format  | `.ply` (parsed with Three's `PLYLoader`)  |

## Features

- **Header** — dataset name, total point count, live load status
- **Sidebar** — point size, opacity, color mode (elevation ramp / scan RGB / solid),
  background color presets + picker, reset view
- **3D Viewer** — orbit camera (drag to rotate, scroll to zoom, right-drag to pan),
  reference grid, corner-reticle HUD, live camera coordinate readout
- **Footer** — dataset bounding box (X/Y/Z) and whether the file carries vertex color
- **Performance** — single `THREE.Points` draw call with `BufferGeometry`
  (no per-point React overhead), so hundreds of thousands of points render smoothly
- **Resilient loading** — if the dataset URL can't be fetched directly (see CORS
  note below), the app automatically falls back to a synthetic road-corridor
  point cloud so the UI is always demonstrable end-to-end

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

Open the printed local URL (default `http://localhost:5173`).

### Production build

```bash
npm run build      # type-checks + builds to /dist
npm run preview    # serve the production build locally
```

## Loading the Real Dataset

The app points at:
`https://edu.3dbharat.com/storage/road/Road_Design_Charholi.ply`

Browsers block cross-origin file fetches unless the remote server sends CORS
headers permitting it. If you see the amber warning banner in the footer, the
host isn't allowing that — this is a server-side setting, not a bug in this
app. Two ways to get real data on screen:

1. **Ask the data owner to enable CORS** for your dev origin, or
2. **Download the file locally** and load it from `/public`:

   ```bash
   curl -o public/Road_Design_Charholi.ply \
     https://edu.3dbharat.com/storage/road/Road_Design_Charholi.ply
   ```

   Then create a `.env.local` (see `.env.example`):

   ```
   VITE_PLY_PATH=/Road_Design_Charholi.ply
   ```

   Restart `npm run dev`. The loader will now read the local copy, and the
   HUD will show the file's real point count, bounds, and vertex colors
   (if the file includes them).

## Project Structure

```
src/
  components/
    Header.tsx           top bar: dataset name, point count, status
    Sidebar.tsx           point size / opacity / color / background controls
    Viewer.tsx            <Canvas>, OrbitControls, HUD overlay, loading state
    PointCloudMesh.tsx    THREE.Points renderer + elevation color ramp
    CameraTracker.tsx     reads live camera position each frame
    InfoPanel.tsx         footer: bounding box, vertex-color flag, warnings
  hooks/
    usePointCloud.ts      fetch + parse .ply, progress, stats, fallback data
  types.ts                shared TS types + default settings
  App.tsx                 composes the dashboard, owns top-level state
  index.css               Tailwind + HUD/reticle/scanline styling
```

## Design Notes

The visual language borrows from surveying/scanning instrument panels rather
than a generic admin template: a dark graphite background, monospace
coordinate readouts, a cyan "laser" accent for live/active data, and amber for
warnings/markers — plus a corner-reticle overlay on the viewer, like a
scanner's viewfinder. The elevation color ramp (teal → amber → warm white)
mirrors how real survey software colors terrain by height, which is more
informative for a road-design dataset than an arbitrary gradient.

## How Rendering Stays Smooth at Scale

- All points live in **one `BufferGeometry`** and are drawn with a single
  `THREE.Points` draw call — React never touches individual points after the
  geometry is built.
- `frustumCulled={false}` avoids per-frame bounding checks on a cloud that
  usually fills the whole view anyway.
- The elevation color ramp is computed once via `useMemo`, not per frame.
- Camera-position readout in the HUD is throttled to ~10 updates/sec instead
  of every render frame, since a HUD doesn't need 60fps text updates.
- For point counts beyond what a single geometry comfortably handles, the
  natural next step (noted as a future improvement) is to split the cloud
  into spatial tiles/chunks and only upload/render the tiles inside the
  current view frustum — the same idea mapping tools use for map tiles.

## Possible Next Steps

- True spatial tiling/LOD for multi-million-point datasets
- Measurement tools (distance/area between points)
- Cross-section / clipping-plane view for road profile inspection
- Save/share camera bookmarks

## License

Provided as-is for the assessment task.
