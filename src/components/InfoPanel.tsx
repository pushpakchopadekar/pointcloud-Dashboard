import type { CloudStats, LoadStatus } from '../types';

interface Props {
  status: LoadStatus;
  stats: CloudStats | null;
  error: string | null;
}

function fmt(n: number) {
  return n.toFixed(2);
}

export default function InfoPanel({ status, stats, error }: Props) {
  return (
    <footer className="h-9 shrink-0 border-t border-graphite-700 bg-graphite-900 flex items-center justify-between px-5 font-mono text-[10px] text-ink-500 tracking-wide">
      <div className="flex items-center gap-5">
        <span>
          BOUNDS X [{stats ? `${fmt(stats.boundsMin[0])}, ${fmt(stats.boundsMax[0])}` : '—'}]
        </span>
        <span>
          Y [{stats ? `${fmt(stats.boundsMin[1])}, ${fmt(stats.boundsMax[1])}` : '—'}]
        </span>
        <span>
          Z [{stats ? `${fmt(stats.boundsMin[2])}, ${fmt(stats.boundsMax[2])}` : '—'}]
        </span>
        <span>VERTEX COLOR {stats ? (stats.hasColor ? 'YES' : 'NO') : '—'}</span>
        {stats && (
          <span title="Geometry is rendered centered at the origin; this is the real-world offset that was subtracted.">
            RECENTERED FROM [{fmt(stats.center[0])}, {fmt(stats.center[1])}, {fmt(stats.center[2])}]
          </span>
        )}
      </div>
      {error && status === 'ready' && (
        <div className="text-scan-amber truncate max-w-[50%]" title={error}>
          ⚠ {error}
        </div>
      )}
    </footer>
  );
}
