import React from 'react';
import {
  TrendingUp,
  Activity,
  Zap,
  Globe,
  Server,
  ShieldCheck,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { AnalyticsChart } from '../AnalyticsChart';

export const AnalyticsView: React.FC = () => {
  const regionalLatency = [
    { region: 'US-East (N. Virginia)', ping: '18ms', status: 'Optimal', load: '64%' },
    { region: 'US-West (Oregon)', ping: '24ms', status: 'Optimal', load: '58%' },
    { region: 'EU-Central (Frankfurt)', ping: '82ms', status: 'Optimal', load: '72%' },
    { region: 'AP-East (Tokyo)', ping: '115ms', status: 'Moderate', load: '49%' },
    { region: 'SA-East (São Paulo)', ping: '138ms', status: 'Optimal', load: '38%' }
  ];

  const throughputBreakdown = [
    { metric: 'Ingress Requests / sec', current: '14,280 req/s', change: '+12.4%', peak: '21,400 req/s' },
    { metric: 'Mean Edge Response Time', current: '32.4 ms', change: '-4.8%', peak: '48.1 ms' },
    { metric: 'Database Connection Pool', current: '42 / 100', change: 'Stable', peak: '78 / 100' },
    { metric: 'Error Rate (5xx Ingress)', current: '0.008%', change: '-0.002%', peak: '0.021%' }
  ];

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Telemetry & Performance Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time distributed infrastructure metrics and operational SLAs
        </p>
      </div>

      {/* Main Performance Chart */}
      <AnalyticsChart />

      {/* Infrastructure Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {throughputBreakdown.map((item) => (
          <div key={item.metric} className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <div className="text-xs text-slate-500 font-medium mb-1 truncate">
              {item.metric}
            </div>
            <div className="text-lg font-bold text-slate-900 font-mono tabular-nums mb-2">
              {item.current}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2 font-mono">
              <span className={item.change.startsWith('+') ? 'text-emerald-600 font-semibold' : 'text-slate-600'}>
                {item.change}
              </span>
              <span>Peak: {item.peak}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Regional Edge Node Health Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-slate-700" />
            <h3 className="text-xs font-semibold text-slate-900">
              Distributed Edge Ingress Nodes
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-600 font-semibold">
            5 / 5 Clusters Nominal
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-medium">
                <th className="py-2.5 px-4">Node Cluster Location</th>
                <th className="py-2.5 px-4 text-right">Round-Trip Latency</th>
                <th className="py-2.5 px-4 text-right">Active Load Factor</th>
                <th className="py-2.5 px-4 text-right">Status Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              {regionalLatency.map((row) => (
                <tr key={row.region} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-4 font-sans font-medium text-slate-800">
                    {row.region}
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-700">
                    {row.ping}
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-700">
                    {row.load}
                  </td>
                  <td className="py-2.5 px-4 text-right font-sans">
                    <span className="inline-flex items-center text-[11px] text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
