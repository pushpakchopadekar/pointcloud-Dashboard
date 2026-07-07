import type { CloudStats, LoadStatus } from '../types';

interface Props {
  status: LoadStatus;
  stats: CloudStats | null;
  fileName: string;
}

const STATUS_LABEL: Record<LoadStatus, string> = {
  idle: 'IDLE',
  loading: 'SCANNING',
  ready: 'READY',
  error: 'ERROR',
};

const STATUS_COLOR: Record<LoadStatus, string> = {
  idle: 'text-ink-500',
  loading: 'text-scan-amber',
  ready: 'text-scan-cyan',
  error: 'text-red-400',
};

export default function Header({ status, stats, fileName }: Props) {
  return (
    <header className="h-14 shrink-0 border-b border-graphite-700 bg-graphite-900 flex items-center justify-between px-5">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-scan-cyan shadow-[0_0_8px_rgba(79,209,197,0.8)]" />
        <div>
          <div className="font-mono text-sm tracking-widest text-ink-100 font-medium">
            POINT&nbsp;CLOUD&nbsp;SURVEY
          </div>
          <div className="text-[11px] text-ink-500 -mt-0.5">{fileName}</div>
        </div>
      </div>

      <div className="flex items-center gap-6 font-mono text-xs">
        <div className="flex flex-col items-end">
          <span className="text-ink-500 text-[10px] tracking-wider">TOTAL POINTS</span>
          <span className="text-ink-100">{stats ? stats.totalPoints.toLocaleString() : '—'}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-ink-500 text-[10px] tracking-wider">STATUS</span>
          <span className={`${STATUS_COLOR[status]} font-medium tracking-wider`}>
            {STATUS_LABEL[status]}
          </span>
        </div>
      </div>
    </header>
  );
}
