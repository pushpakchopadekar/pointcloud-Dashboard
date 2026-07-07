import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import type { ViewerSettings } from '../types';

interface Props {
  geometry: THREE.BufferGeometry;
  settings: ViewerSettings;
}

/**
 * Renders the loaded geometry as a THREE.Points cloud. Recomputes a
 * per-vertex elevation color ramp when colorMode === 'elevation', and
 * otherwise defers to the file's own vertex colors or a flat solid color.
 */
export default function PointCloudMesh({ geometry, settings }: Props) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);

  const elevationGeometry = useMemo(() => {
    if (settings.colorMode !== 'elevation') return null;
    const g = geometry.clone();
    const pos = g.getAttribute('position');

    // Compute min/max directly from the geometry's own (already-centered)
    // Y values rather than external stats, so this always matches whatever
    // coordinate frame the geometry is actually in.
    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    const range = Math.max(maxY - minY, 1e-6);

    const colors = new Float32Array(pos.count * 3);
    // low -> teal, mid -> amber, high -> warm white (survey-style ramp)
    const low = new THREE.Color('#1f6f68');
    const mid = new THREE.Color('#f5a623');
    const high = new THREE.Color('#fbe8c8');

    for (let i = 0; i < pos.count; i++) {
      const t = (pos.getY(i) - minY) / range;
      const c = new THREE.Color();
      if (t < 0.5) {
        c.lerpColors(low, mid, t / 0.5);
      } else {
        c.lerpColors(mid, high, (t - 0.5) / 0.5);
      }
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  }, [geometry, settings.colorMode]);

  useEffect(() => {
    return () => {
      elevationGeometry?.dispose();
    };
  }, [elevationGeometry]);

  const activeGeometry = elevationGeometry ?? geometry;
  const useVertexColors = settings.colorMode !== 'solid';

  return (
    <points ref={pointsRef} geometry={activeGeometry} frustumCulled={false}>
      <pointsMaterial
        ref={materialRef}
        size={settings.pointSize}
        opacity={settings.opacity}
        transparent
        vertexColors={useVertexColors}
        color={useVertexColors ? '#ffffff' : settings.solidColor}
        sizeAttenuation
        depthWrite={settings.opacity > 0.85}
      />
    </points>
  );
}
