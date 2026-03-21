interface TierBar {
  label: string;
  value: number;
  active?: boolean;
  sublabel?: string;
}

interface TierChartProps {
  bars: TierBar[];
  title?: string;
  valueFormatter?: (v: number) => string;
}

export function TierChart({ bars, title, valueFormatter = (v) => v.toFixed(2) }: TierChartProps) {
  const maxValue = Math.max(...bars.map((b) => b.value), 1);

  return (
    <div className="w-full">
      {title && <p className="text-sm font-medium text-gray-700 mb-3">{title}</p>}
      <div className="flex items-end gap-2 h-48">
        {bars.map((bar, i) => {
          const height = Math.max((bar.value / maxValue) * 100, 4);
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-medium text-gray-600">{valueFormatter(bar.value)}</span>
              <div
                className={`w-full rounded-t-md transition-all duration-300 ${
                  bar.active
                    ? 'bg-primary-500 shadow-md shadow-primary-200'
                    : 'bg-gray-200'
                }`}
                style={{ height: `${height}%` }}
              />
              <span className="text-xs text-gray-500 text-center leading-tight">{bar.label}</span>
              {bar.sublabel && (
                <span className="text-[10px] text-gray-400 text-center">{bar.sublabel}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
