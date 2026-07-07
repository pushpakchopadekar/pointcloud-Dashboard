import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { CameraReadout } from '../types';

interface Props {
  onUpdate: (readout: CameraReadout) => void;
}

/**
 * Reads the live camera position each frame (throttled) and reports it
 * up to the dashboard's info panel. Runs inside the Canvas so it has
 * access to the R3F camera via useThree.
 */
export default function CameraTracker({ onUpdate }: Props) {
  const { camera } = useThree();
  const lastReport = useRef(0);

  useFrame((state) => {
    const now = state.clock.elapsedTime;
    if (now - lastReport.current < 0.1) return; // ~10fps readout, plenty for a HUD
    lastReport.current = now;
    onUpdate({
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
      distance: camera.position.length(),
    });
  });

  return null;
}
