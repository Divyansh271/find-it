import React, { useState } from 'react';
import { ChartDataPoint } from '../types/dashboard';
import {
  CHART_DATA_7D,
  CHART_DATA_30D,
  CHART_DATA_90D,
  CHART_DATA_1Y
} from '../data/mockData';

type TimeRange = '7D' | '30D' | '90D' | '1Y';
type MetricKey = 'revenue' | 'operations' | 'signups';

export const AnalyticsChart: React.FC = () => {
  const [range, setRange] = useState<TimeRange>('7D');
  const [activeMetric, setActiveMetric] = useState<MetricKey>('revenue');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const dataMap: Record<TimeRange, ChartDataPoint[]> = {
    '7D': CHART_DATA_7D,
    '30D': CHART_DATA_30D,
    '90D': CHART_DATA_90D,
    '1Y': CHART_DATA_1Y
  };

  const currentData = dataMap[range];

  const metricMeta: Record<MetricKey, { label: string; prefix: string; suffix: string; color: string }> = {
    revenue: { label: 'Net Revenue', prefix: '$', suffix: '', color: '#0f172a' },
    operations: { label: 'Operational Volume', prefix: '', suffix: ' ops', color: '#2563eb' },
    signups: { label: 'New Signups', prefix: '', suffix: ' users', color: '#059669' }
  };

  const values = currentData.map(d => d[activeMetric]);
  const maxValue = Math.max(...values) * 1.15;
  const minValue = Math.min(...values) * 0.85;

  const chartWidth = 640;
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 24;

  const points = currentData.map((d, i) => {
    const x = paddingX + (i / (currentData.length - 1)) * (chartWidth - paddingX * 2);
    const normalizedY = (d[activeMetric] - minValue) / (maxValue - minValue || 1);
    const y = chartHeight - paddingY - normalizedY * (chartHeight - paddingY * 2);
    return { x, y, data: d };
  });

  const polylineStr = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPathStr = `M ${points[0].x},${chartHeight - paddingY} ` +
    points.map(p => `L ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') +
    ` L ${points[points.length - 1].x},${chartHeight - paddingY} Z`;

  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : points[points.length - 1];

  const formatDisplayValue = (val: number) => {
    const meta = metricMeta[activeMetric];
    if (activeMetric === 'revenue') {
      return `${meta.prefix}${val.toLocaleString('en-US')}`;
    }
    return `${val.toLocaleString('en-US')}${meta.suffix}`;
  };

  const categoryDistribution = [
    { name: 'Engineering & Cloud', pct: 45, value: '$66,730' },
    { name: 'Operations & SRE', pct: 28, value: '$41,520' },
    { name: 'Product & Design', pct: 17, value: '$25,200' },
    { name: 'Marketing & Sales', pct: 10, value: '$14,840' }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
      {/* Chart Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-sm font-semibold text-slate-900">
              Operational Performance Trend
            </h2>
            <span className="text-xs text-slate-500 font-normal">
              · Continuous sync
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {formatDisplayValue(hoveredPoint.data[activeMetric])}
            </span>
            <span className="text-xs text-slate-500">
              on {hoveredPoint.data.date}
            </span>
          </div>
        </div>

        {/* Metric Switcher & Timeframe Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Selector Buttons */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg">
            {(['revenue', 'operations', 'signups'] as MetricKey[]).map((mKey) => (
              <button
                key={mKey}
                onClick={() => setActiveMetric(mKey)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeMetric === mKey
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {metricMeta[mKey].label.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Timeframe Selector Buttons */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg">
            {(['7D', '30D', '90D', '1Y'] as TimeRange[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setRange(t);
                  setHoveredIndex(null);
                }}
                className={`px-2 py-1 text-xs font-mono font-medium rounded-md transition-colors ${
                  range === t
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Chart + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
        {/* Chart Viewport */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          <div className="relative w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-56 select-none"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0f172a" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal reference lines */}
              {[0.25, 0.5, 0.75].map((fraction) => {
                const y = chartHeight - paddingY - fraction * (chartHeight - paddingY * 2);
                return (
                  <line
                    key={fraction}
                    x1={paddingX}
                    y1={y}
                    x2={chartWidth - paddingX}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Baseline */}
              <line
                x1={paddingX}
                y1={chartHeight - paddingY}
                x2={chartWidth - paddingX}
                y2={chartHeight - paddingY}
                stroke="#cbd5e1"
                strokeWidth="1"
              />

              {/* Gradient Area Fill */}
              <path d={areaPathStr} fill="url(#chartGradient)" />

              {/* Smooth Line */}
              <polyline
                fill="none"
                stroke="#0f172a"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polylineStr}
              />

              {/* Interactive Data Points */}
              {points.map((p, idx) => {
                const isHovered = hoveredIndex === idx;
                return (
                  <g key={idx} className="cursor-pointer">
                    {/* Hover vertical guide line */}
                    {isHovered && (
                      <line
                        x1={p.x}
                        y1={paddingY}
                        x2={p.x}
                        y2={chartHeight - paddingY}
                        stroke="#94a3b8"
                        strokeDasharray="2 2"
                        strokeWidth="1"
                      />
                    )}

                    {/* Point hit target and visible circle */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHovered ? 5 : 3.5}
                      fill={isHovered ? '#0f172a' : '#ffffff'}
                      stroke="#0f172a"
                      strokeWidth="2"
                    />

                    {/* Invisible hit box for easier hovering */}
                    <rect
                      x={p.x - 20}
                      y={0}
                      width={40}
                      height={chartHeight}
                      fill="transparent"
                      onMouseEnter={() => setHoveredIndex(idx)}
                    />
                  </g>
                );
              })}
            </svg>

            {/* X-Axis Date Labels */}
            <div className="flex justify-between px-10 text-[11px] font-mono text-slate-500 pt-1">
              {currentData.map((d, idx) => (
                <button
                  key={idx}
                  onClick={() => setHoveredIndex(idx)}
                  className={`hover:text-slate-900 transition-colors ${
                    hoveredIndex === idx ? 'text-slate-900 font-semibold' : ''
                  }`}
                >
                  {d.date}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Rail: Category Distribution */}
        <div className="lg:col-span-4 lg:border-l lg:border-slate-100 lg:pl-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold text-slate-900 mb-1">
              Capital & Resource Allocation
            </h3>
            <p className="text-[11px] text-slate-500 mb-4">
              Breakdown across active cross-functional initiatives
            </p>

            <div className="space-y-3.5">
              {categoryDistribution.map((item) => (
                <div key={item.name}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-700 font-medium">{item.name}</span>
                    <div className="flex items-center gap-1.5 font-mono tabular-nums text-slate-500">
                      <span>{item.value}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-900 font-semibold">{item.pct}%</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-800 rounded-full"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>SLA Compliance Index</span>
            <span className="font-mono tabular-nums text-emerald-600 font-semibold">
              99.98% OK
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
