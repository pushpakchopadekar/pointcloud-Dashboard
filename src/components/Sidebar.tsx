import type { ReactNode } from 'react';
import type { ViewerSettings } from '../types';

interface Props {
  settings: ViewerSettings;
  onChange: (patch: Partial<ViewerSettings>) => void;
  onReset: () => void;
}

function ControlGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-6">
      <div className="font-mono text-[10px] uppercase tracking-widest text-ink-500 mb-2.5 flex items-center gap-2">
        <span className="w-1 h-1 bg-scan-cyan/60 rounded-full" />
        {label}
      </div>
      {children}
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-3.5">
      <div className="flex justify-between font-mono text-[11px] text-ink-300 mb-1.5">
        <span>{label}</span>
        <span className="text-scan-cyan">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
}

const COLOR_MODES: { id: ViewerSettings['colorMode']; label: string }[] = [
  
  { id: 'rgb', label: 'Scan RGB' },
  { id: 'solid', label: 'Solid' },
];

const PRESET_BACKGROUNDS = ['#0b0e14', '#000000', '#ffffff', '#1a2233'];

export default function Sidebar({ settings, onChange, onReset }: Props) {
  return (
    <aside className="w-64 shrink-0 border-r border-graphite-700 bg-graphite-900 overflow-y-auto px-5 py-6">
      <ControlGroup label="Point Size">
        <SliderRow
          label="Size"
          value={settings.pointSize}
          min={0.002}
          max={0.15}
          step={0.001}
          display={settings.pointSize.toFixed(3)}
          onChange={(v) => onChange({ pointSize: v })}
        />
      </ControlGroup>

      <ControlGroup label="Opacity">
        <SliderRow
          label="Alpha"
          value={settings.opacity}
          min={0.05}
          max={1}
          step={0.01}
          display={`${Math.round(settings.opacity * 100)}%`}
          onChange={(v) => onChange({ opacity: v })}
        />
      </ControlGroup>

      <ControlGroup label="Color Mode">
        <div className="flex flex-col gap-1.5">
          {COLOR_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => onChange({ colorMode: mode.id })}
              className={`text-left font-mono text-[11px] px-2.5 py-1.5 rounded-sm border transition-colors ${
                settings.colorMode === mode.id
                  ? 'border-scan-cyan/60 text-scan-cyan bg-scan-cyan/5'
                  : 'border-graphite-700 text-ink-300 hover:border-graphite-600'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
        {settings.colorMode === 'solid' && (
          <div className="mt-2.5 flex items-center gap-2">
            <input
              type="color"
              value={settings.solidColor}
              onChange={(e) => onChange({ solidColor: e.target.value })}
              className="w-8 h-8 rounded-sm border border-graphite-700 bg-transparent cursor-pointer"
            />
            <span className="font-mono text-[11px] text-ink-500">{settings.solidColor}</span>
          </div>
        )}
      </ControlGroup>

      <ControlGroup label="Background">
        <div className="flex items-center gap-2 mb-2.5">
          {PRESET_BACKGROUNDS.map((bg) => (
            <button
              key={bg}
              onClick={() => onChange({ backgroundColor: bg })}
              className={`w-6 h-6 rounded-sm border-2 transition-transform hover:scale-110 ${
                settings.backgroundColor === bg ? 'border-scan-cyan' : 'border-graphite-700'
              }`}
              style={{ backgroundColor: bg }}
            />
          ))}
          <input
            type="color"
            value={settings.backgroundColor}
            onChange={(e) => onChange({ backgroundColor: e.target.value })}
            className="w-6 h-6 rounded-sm border border-graphite-700 bg-transparent cursor-pointer"
          />
        </div>
      </ControlGroup>

      <ControlGroup label="Navigation">
        <ul className="font-mono text-[11px] text-ink-500 space-y-1 leading-relaxed">
          <li>
            <span className="text-ink-300">Drag</span> — rotate
          </li>
          <li>
            <span className="text-ink-300">Scroll</span> — zoom
          </li>
          <li>
            <span className="text-ink-300">Right-drag</span> — pan
          </li>
        </ul>
      </ControlGroup>

      <button
        onClick={onReset}
        className="w-full font-mono text-[11px] uppercase tracking-widest px-3 py-2 rounded-sm border border-graphite-700 text-ink-300 hover:border-scan-amber/60 hover:text-scan-amber transition-colors"
      >
        Reset View
      </button>
    </aside>
  );
}
