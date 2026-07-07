import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import type { CloudStats, LoadStatus } from '../types';

interface UsePointCloudResult {
  geometry: THREE.BufferGeometry | null;
  status: LoadStatus;
  progress: number; // 0-100
  stats: CloudStats | null;
  error: string | null;
}

/**
 * Generates a synthetic "road corridor" scan as a graceful fallback.
 * Mirrors the shape of a real LIDAR road survey (a curved carriageway with
 * cross-slope + roadside terrain scatter) so the viewer is never empty,
 * even if the source dataset can't be fetched (e.g. CORS in local dev).
 */
function buildFallbackGeometry(pointCount = 220_000): THREE.BufferGeometry {
  const positions = new Float32Array(pointCount * 3);
  const colors = new Float32Array(pointCount * 3);

  for (let i = 0; i < pointCount; i++) {
    const t = Math.random(); // position along the road (0-1)
    const roadLength = 40;
    const roadWidth = 7;

    // gentle S-curve centerline
    const centerX = Math.sin(t * Math.PI * 1.5) * 4;
    const z = t * roadLength - roadLength / 2;

    const isRoadway = Math.random() < 0.72;
    let x: number;
    let y: number;
    let r: number, g: number, b: number;

    if (isRoadway) {
      const acrossRoad = (Math.random() - 0.5) * roadWidth;
      x = centerX + acrossRoad;
      // slight camber/cross-slope + micro noise like real scan noise
      y = -Math.abs(acrossRoad) * 0.02 + (Math.random() - 0.5) * 0.03;
      const shade = 0.25 + Math.random() * 0.08;
      r = shade;
      g = shade;
      b = shade + 0.02;
    } else {
      // roadside terrain / verge, rises away from the road, vegetation tint
      const side = Math.random() < 0.5 ? -1 : 1;
      const distFromEdge = Math.random() * 6;
      x = centerX + side * (roadWidth / 2 + distFromEdge);
      y = distFromEdge * 0.18 + Math.sin(t * 20 + distFromEdge) * 0.15;
      const green = 0.3 + Math.random() * 0.25;
      r = 0.16 + Math.random() * 0.08;
      g = green;
      b = 0.14 + Math.random() * 0.06;
    }

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    colors[i * 3] = r;
    colors[i * 3 + 1] = g;
    colors[i * 3 + 2] = b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

/**
 * Loads a .ply point cloud from a URL, reporting progress and basic stats.
 * Falls back to a synthetic road-corridor scan if the fetch fails, so the
 * dashboard is always demonstrable (e.g. when the source host blocks
 * cross-origin requests from a local dev server).
 */
export function usePointCloud(url: string): UsePointCloudResult {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [status, setStatus] = useState<LoadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<CloudStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loaderRef = useRef(new PLYLoader());

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setProgress(0);
    setError(null);

    const applyGeometry = (geo: THREE.BufferGeometry, isFallback: boolean) => {
      if (cancelled) return;
      geo.computeBoundingBox();
      const bbox = geo.boundingBox!;
      const posAttr = geo.getAttribute('position');

      // Capture original bounds BEFORE recentering — useful for display and
      // for mapping back to real-world (e.g. UTM) coordinates.
      const originalMin: [number, number, number] = [bbox.min.x, bbox.min.y, bbox.min.z];
      const originalMax: [number, number, number] = [bbox.max.x, bbox.max.y, bbox.max.z];
      const center = bbox.getCenter(new THREE.Vector3());

      // Survey/GIS point clouds are frequently stored in real-world
      // coordinates (e.g. UTM easting/northing in the hundreds of
      // thousands) that sit far from the origin. Left as-is, the camera
      // and OrbitControls (which orbit around the origin) would be
      // pointed at empty space while the actual cloud renders far outside
      // the camera's far-plane, i.e. invisible. Recentering the geometry
      // to the origin fixes this regardless of the source coordinate
      // system, while `center` preserves the original position.
      geo.center();
      geo.computeBoundingBox();
      geo.computeBoundingSphere();

      if (!geo.getAttribute('normal')) {
        geo.computeVertexNormals();
      }

      setGeometry(geo);
      setStats({
        totalPoints: posAttr.count,
        boundsMin: originalMin,
        boundsMax: originalMax,
        hasColor: !!geo.getAttribute('color'),
        center: [center.x, center.y, center.z],
      });
      setStatus('ready');
      setProgress(100);
      if (isFallback) {
        setError(
          'Could not fetch the source .ply (likely blocked by CORS from this host). Showing a synthetic road-corridor scan instead — place the file in /public and set VITE_PLY_PATH to load real data.'
        );
      }
    };

    loaderRef.current.load(
      url,
      (geo) => applyGeometry(geo, false),
      (xhr) => {
        if (xhr.lengthComputable && !cancelled) {
          setProgress(Math.min(99, Math.round((xhr.loaded / xhr.total) * 100)));
        }
      },
      () => {
        if (cancelled) return;
        // Fetch/parse failed — use the synthetic fallback so the dashboard
        // still fully demonstrates zoom/pan/rotate/controls.
        const fallback = buildFallbackGeometry();
        applyGeometry(fallback, true);
      }
    );

    return () => {
      cancelled = true;
    };
  }, [url]);

  return { geometry, status, progress, stats, error };
}
