
import React, { useState, useEffect } from 'react';
import { fetchMyHistory, Report } from '../api';

interface HistoryProps {
  refreshKey: number;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  submitted: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', label: 'Submitted' },
  under_review: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', label: 'Under Review' },
  verified: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100', label: 'Verified' },
  dismissed: { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200', label: 'Dismissed' },
  resolved: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', label: 'Resolved' },
};

const TYPE_COLORS: Record<string, { color: string; statusBg: string; statusText: string; icon: string }> = {
  'Medical Emergency': { color: 'bg-red-500', statusBg: 'bg-red-50', statusText: 'text-red-600', icon: 'emergency' },
  'Fire': { color: 'bg-orange-500', statusBg: 'bg-orange-50', statusText: 'text-orange-600', icon: 'local_fire_department' },
  'Accident': { color: 'bg-amber-500', statusBg: 'bg-amber-50', statusText: 'text-amber-600', icon: 'car_crash' },
  'Violence / Assault': { color: 'bg-red-700', statusBg: 'bg-red-50', statusText: 'text-red-700', icon: 'report' },
  'Suspicious Activity': { color: 'bg-purple-500', statusBg: 'bg-purple-50', statusText: 'text-purple-600', icon: 'visibility' },
  'Other': { color: 'bg-sky-500', statusBg: 'bg-sky-50', statusText: 'text-sky-600', icon: 'report' },
};

const DEFAULT_TYPE_COLOR = { color: 'bg-gray-500', statusBg: 'bg-gray-50', statusText: 'text-gray-600', icon: 'report' };

const History: React.FC<HistoryProps> = ({ refreshKey }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchMyHistory()
      .then(setReports)
      .catch(err => console.error('Failed to load history:', err))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-5 pt-8 pb-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-3xl font-bold tracking-tight text-[#002147]">Safety History</h2>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-6 space-y-4">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-[#be0909] rounded-full animate-spin"></div>
            <p className="text-sm text-gray-400 font-medium mt-4">Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-20 px-10 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
              <span className="material-symbols-outlined text-gray-300 text-4xl">inventory_2</span>
            </div>
            <h3 className="text-lg font-bold text-[#002147] mb-1">No Reports Yet</h3>
            <p className="text-sm text-gray-500 font-medium">Your submitted safety reports will appear here.</p>
          </div>
        ) : (
          <>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1 pt-2">Recent Activity</div>
            {reports.map((report) => {
              const typeStyle = TYPE_COLORS[report.incident_type] || DEFAULT_TYPE_COLOR;
              const statusStyle = STATUS_STYLES[report.status] || STATUS_STYLES.submitted;

              return (
                <article key={report.id} className="group relative overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100 transition-transform active:scale-[0.99] cursor-pointer">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${typeStyle.color}`}></div>
                  <div className="p-4 pl-5 flex items-start gap-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${typeStyle.statusBg} flex items-center justify-center ${typeStyle.statusText}`}>
                      <span className="material-symbols-outlined material-symbols-fill">{typeStyle.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="text-base font-bold text-[#002147] truncate">{report.incident_type}</h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}>
                          {statusStyle.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2 font-medium line-clamp-2">{report.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-400">{formatDate(report.created_at)}</span>
                        <span className="material-symbols-outlined text-gray-300 text-[18px]">chevron_right</span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </>
        )}
        <div className="h-20 shrink-0"></div>
      </div>
    </div>
  );
};

export default History;
