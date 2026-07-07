import { Suspense, useCallback, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';
import PointCloudMesh from './PointCloudMesh';
import CameraTracker from './CameraTracker';
import type { CameraReadout, CloudStats, LoadStatus, ViewerSettings } from '../types';

interface Props {
  geometry: THREE.BufferGeometry | null;
  status: LoadStatus;
  progress: number;
  stats: CloudStats | null;
  settings: ViewerSettings;
  onCameraUpdate: (readout: CameraReadout) => void;
  cameraReadout: CameraReadout;
}

export default function Viewer({
  geometry,
  status,
  progress,
  stats,
  settings,
  onCameraUpdate,
  cameraReadout,
}: Props) {
  const [showGrid, setShowGrid] = useState(true);

  const initialCameraDistance = stats
    ? Math.max(
        stats.boundsMax[0] - stats.boundsMin[0],
        stats.boundsMax[2] - stats.boundsMin[2],
        10
      ) * 1.3
    : 20;

  // Stats hold the ORIGINAL (pre-recenter) coordinates, but the rendered
  // geometry has been shifted so its bounding-box center sits at the
  // origin. Ground the reference grid at the recentered floor level:
  // (original min Y) - (original center Y).
  const centeredFloorY = stats ? stats.boundsMin[1] - stats.center[1] : 0;

  return (
    <div className="relative flex-1 h-full overflow-hidden" style={{ backgroundColor: settings.backgroundColor }}>
      <Canvas
        camera={{ position: [initialCameraDistance * 0.6, initialCameraDistance * 0.5, initialCameraDistance * 0.6], fov: 50, near: 0.01, far: 5000 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.75]}
      >
        <color attach="background" args={[settings.backgroundColor]} />
        <ambientLight intensity={0.6} />
        <CameraTracker onUpdate={onCameraUpdate} />
        <Suspense fallback={null}>
          {geometry && <PointCloudMesh geometry={geometry} settings={settings} />}
        </Suspense>
        {showGrid && (
          <Grid
            args={[100, 100]}
            cellColor="#1c2330"
            sectionColor="#2b3548"
            fadeDistance={60}
            fadeStrength={1.5}
            infiniteGrid
            position={[0, centeredFloorY, 0]}
          />
        )}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.6}
          zoomSpeed={0.9}
          panSpeed={0.7}
          minDistance={0.05}
          maxDistance={500}
        />
      </Canvas>

      {/* Signature HUD: viewfinder reticle + coordinate readout, like a scanner instrument */}
      <div className="scanline-sweep" />
      <div className="reticle-corner reticle-tl" />
      <div className="reticle-corner reticle-tr" />
      <div className="reticle-corner reticle-bl" />
      <div className="reticle-corner reticle-br" />

      <div className="absolute bottom-3 left-9 font-mono text-[11px] text-scan-cyan/80 tracking-wide leading-relaxed pointer-events-none">
        <div>
          CAM&nbsp; X {cameraReadout.x.toFixed(2)}&nbsp; Y {cameraReadout.y.toFixed(2)}&nbsp; Z{' '}
          {cameraReadout.z.toFixed(2)}
        </div>
        <div className="text-ink-500">RANGE {cameraReadout.distance.toFixed(2)} m</div>
      </div>

      <button
        onClick={() => setShowGrid((v) => !v)}
        className="absolute top-3 right-9 font-mono text-[10px] uppercase tracking-widest px-2 py-1 rounded-sm border border-graphite-700 text-ink-300 bg-graphite-900/70 hover:border-scan-cyan/50 hover:text-scan-cyan transition-colors pointer-events-auto"
      >
        Grid {showGrid ? 'On' : 'Off'}
      </button>

      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-graphite-950/80 backdrop-blur-sm">
          <div className="font-mono text-scan-cyan text-sm tracking-widest">SCANNING DATASET</div>
          <div className="w-64 h-1 bg-graphite-700 rounded overflow-hidden">
            <div
              className="h-full bg-scan-cyan transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="font-mono text-ink-500 text-xs">{progress}%</div>
        </div>
      )}
    </div>
  );
}
