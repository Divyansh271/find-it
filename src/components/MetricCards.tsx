import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { MetricSummary } from '../types/dashboard';

interface MetricCardsProps {
  metrics: MetricSummary[];
  selectedMetricId: string | null;
  onSelectMetric: (id: string) => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  metrics,
  selectedMetricId,
  onSelectMetric
}) => {
  // Render a clean SVG sparkline
  const renderSparkline = (data: number[], isPositive: boolean) => {
    if (!data || data.length < 2) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 80;
    const height = 28;

    const points = data
      .map((val, idx) => {
        const x = (idx / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 6) - 3;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

    const strokeColor = isPositive ? '#059669' : '#dc2626';

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {metrics.map((metric) => {
        const isSelected = selectedMetricId === metric.id;
        const isPositive = metric.changeType === 'increase';
        const isNegative = metric.changeType === 'decrease';

        return (
          <div
            key={metric.id}
            onClick={() => onSelectMetric(metric.id)}
            className={`bg-white border rounded-xl p-4 transition-all duration-150 cursor-pointer ${
              isSelected
                ? 'border-slate-900 ring-1 ring-slate-900 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-medium text-slate-600">{metric.label}</span>
              <div className="shrink-0">{renderSparkline(metric.sparkline, isPositive)}</div>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
                {metric.value}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span
                className={`inline-flex items-center font-mono tabular-nums font-semibold ${
                  isPositive
                    ? 'text-emerald-600'
                    : isNegative
                    ? 'text-rose-600'
                    : 'text-slate-600'
                }`}
              >
                {isPositive ? (
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                ) : isNegative ? (
                  <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                ) : (
                  <Minus className="w-3.5 h-3.5 mr-0.5" />
                )}
                {metric.changePercent > 0 ? `+${metric.changePercent}%` : `${metric.changePercent}%`}
              </span>
              <span className="text-slate-300" aria-hidden="true">·</span>
              <span className="truncate">{metric.timeframe}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
