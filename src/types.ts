export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface ViewerSettings {
  pointSize: number; // in world units
  opacity: number; // 0-1
  backgroundColor: string; // hex
  colorMode: 'rgb' | 'elevation' | 'solid';
  solidColor: string;
}

export interface CameraReadout {
  x: number;
  y: number;
  z: number;
  distance: number;
}

export interface CloudStats {
  totalPoints: number;
  boundsMin: [number, number, number];
  boundsMax: [number, number, number];
  hasColor: boolean;
  /** Original bounding-box center before the geometry was recentered to the
   * origin. Survey/GIS point clouds often use real-world (e.g. UTM)
   * coordinates far from (0,0,0); we recenter for rendering but keep this
   * so callers can map back to real-world position if needed. */
  center: [number, number, number];
}

export const DEFAULT_SETTINGS: ViewerSettings = {
  pointSize: 0.015,
  opacity: 1,
  backgroundColor: '#0b0e14',
  colorMode: 'rgb',
  solidColor: 'rgb',
};
