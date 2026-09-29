import React, { useState } from 'react';
import { FileText, Download, CheckCircle2, Shield, Calendar, ExternalLink } from 'lucide-react';

interface ReportDoc {
  id: string;
  title: string;
  category: 'Financial' | 'Security' | 'Operations' | 'Compliance';
  period: string;
  generatedDate: string;
  size: string;
  status: 'Ready' | 'Archived';
}

const INITIAL_REPORTS: ReportDoc[] = [
  {
    id: 'REP-2026-09',
    title: 'Monthly Consolidated Operational Revenue & P&L Statement',
    category: 'Financial',
    period: 'September 2026',
    generatedDate: '2026-09-28',
    size: '1.8 MB',
    status: 'Ready'
  },
  {
    id: 'REP-2026-Q3-SEC',
    title: 'Q3 Edge Compute Security & SOC2 Vulnerability Assessment',
    category: 'Security',
    period: 'Q3 2026',
    generatedDate: '2026-09-24',
    size: '4.2 MB',
    status: 'Ready'
  },
  {
    id: 'REP-2026-08',
    title: 'August 2026 SLA Infrastructure Uptime & Latency Audit',
    category: 'Operations',
    period: 'August 2026',
    generatedDate: '2026-09-01',
    size: '890 KB',
    status: 'Ready'
  },
  {
    id: 'REP-2026-Q2-FIN',
    title: 'Q2 Comprehensive Enterprise Client Ledger & Billings Audit',
    category: 'Financial',
    period: 'Q2 2026',
    generatedDate: '2026-07-02',
    size: '3.1 MB',
    status: 'Archived'
  },
  {
    id: 'REP-2026-ISO',
    title: 'ISO-27001 Data Privacy & Encryption at Rest Certification',
    category: 'Compliance',
    period: 'Annual 2026',
    generatedDate: '2026-06-15',
    size: '5.6 MB',
    status: 'Ready'
  }
];

export const ReportsView: React.FC = () => {
  const [reports] = useState<ReportDoc[]>(INITIAL_REPORTS);
  const [filter, setFilter] = useState<string>('All');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const filteredReports = reports.filter(
    (r) => filter === 'All' || r.category === filter
  );

  const handleDownload = (report: ReportDoc) => {
    // Generate text report download
    const content = `PULSEBOARD ENTERPRISE AUDIT REPORT\nID: ${report.id}\nTitle: ${report.title}\nCategory: ${report.category}\nPeriod: ${report.period}\nGenerated: ${report.generatedDate}\nStatus: Verified\n\n--- INVARIANTS AND EXECUTIVE SUMMARY ---\nAll systems operated within standard defined error budgets.\nNet SLA compliance: 99.98%\nZero unmitigated critical security anomalies.\nReport certified by internal compliance auditor.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.id.toLowerCase()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(report.id);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            System Reports & Audit Ledgers
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Download certified compliance statements, financial ledgers, and SLA certificates
          </p>
        </div>

        {downloadSuccess && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg animate-fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Downloaded report {downloadSuccess}</span>
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs w-fit">
        {['All', 'Financial', 'Security', 'Operations', 'Compliance'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              filter === cat
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Reports Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-medium">
                <th className="py-3 px-4">Document Title & ID</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Reporting Window</th>
                <th className="py-3 px-4 font-mono tabular-nums text-right">File Size</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{doc.title}</div>
                    <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                      {doc.id} · Generated {doc.generatedDate}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {doc.category}
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-mono">
                    {doc.period}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600 font-mono tabular-nums">
                    {doc.size}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center text-[11px] text-slate-700 font-mono">
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${doc.status === 'Ready' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {doc.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDownload(doc)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>Download</span>
                    </button>
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
