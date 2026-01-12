
import React, { useState } from 'react';

interface HistoryProps {
  reports: any[];
}

const History: React.FC<HistoryProps> = ({ reports }) => {
  const [filter, setFilter] = useState<'All' | 'My Reports'>('All');

  // Filter logic (currently all reports are user submissions in this app)
  const filteredReports = filter === 'All' ? reports : reports;

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-5 pt-8 pb-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-3xl font-bold tracking-tight text-[#002147]">Safety History</h2>
        
        </div>
        
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-6 space-y-4">
        {filteredReports.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-20 px-10 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
              <span className="material-symbols-outlined text-gray-300 text-4xl">inventory_2</span>
            </div>
            <h3 className="text-lg font-bold text-[#002147] mb-1">No Reports Yet</h3>
            <p className="text-sm text-gray-500 font-medium">Your submitted safety reports and campus alerts will appear here.</p>
          </div>
        ) : (
          <>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1 pt-2">Recent Activity</div>
            {filteredReports.map((item) => (
              <article key={item.id} className="group relative overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100 transition-transform active:scale-[0.99] cursor-pointer">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.color}`}></div>
                <div className="p-4 pl-5 flex items-start gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${item.statusBg} flex items-center justify-center ${item.statusText}`}>
                    <span className={`material-symbols-outlined material-symbols-fill`}>{item.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-base font-bold text-[#002147] truncate">{item.title}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${item.statusBg} ${item.statusText} border ${item.border}`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2 font-medium line-clamp-2">{item.subtitle}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-400">{item.date}</span>
                      <span className="material-symbols-outlined text-gray-300 text-[18px]">chevron_right</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </>
        )}
        <div className="h-20 shrink-0"></div>
      </div>
    </div>
  );
};

export default History;
