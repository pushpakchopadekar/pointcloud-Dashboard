import { useCallback, useState } from 'react';
import Header from './components/Header';
import InfoPanel from './components/InfoPanel';
import Sidebar from './components/Sidebar';
import Viewer from './components/Viewer';
import { usePointCloud } from './hooks/usePointCloud';
import { DEFAULT_SETTINGS, type CameraReadout, type ViewerSettings } from './types';

// Source dataset. If this host blocks cross-origin fetches, usePointCloud
// automatically falls back to a synthetic road-corridor scan so the
// dashboard stays fully demonstrable. To load the real file with no CORS
// risk, download it into /public and point this at the local path instead,
// e.g. '/Road_Design_Charholi.ply'.
const DATA_URL =
  import.meta.env.VITE_PLY_PATH || 'https://edu.3dbharat.com/storage/road/Road_Design_Charholi.ply';

export default function App() {
  const [settings, setSettings] = useState<ViewerSettings>(DEFAULT_SETTINGS);
  const [cameraReadout, setCameraReadout] = useState<CameraReadout>({
    x: 0,
    y: 0,
    z: 0,
    distance: 0,
  });
  const { geometry, status, progress, stats, error } = usePointCloud(DATA_URL);

  const handleSettingsChange = useCallback((patch: Partial<ViewerSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleReset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-graphite-950 text-ink-100">
      <Header status={status} stats={stats} fileName={DATA_URL.split('/').pop() ?? 'dataset.ply'} />
      <div className="flex flex-1 min-h-0">
        <Sidebar settings={settings} onChange={handleSettingsChange} onReset={handleReset} />
        <Viewer
          geometry={geometry}
          status={status}
          progress={progress}
          stats={stats}
          settings={settings}
          onCameraUpdate={setCameraReadout}
          cameraReadout={cameraReadout}
        />
      </div>
      <InfoPanel status={status} stats={stats} error={error} />
    </div>
  );
}
