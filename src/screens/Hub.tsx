
import React from 'react';

interface HubProps {
  onReportClick: () => void;
}

const Hub: React.FC<HubProps> = ({ onReportClick }) => {
  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar bg-white">
      {/* Header - Increased z-index to stay on top of scrolling elements */}
      <header className="px-6 pt-6 pb-4 bg-white sticky top-0 z-30 shadow-sm border-b border-gray-50/50">
        <div className="flex flex-col">
          <h1 className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-1 leading-none">Safety Hub</h1>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#be0909] text-[22px] material-symbols-fill">shield</span>
            <span className="text-xl font-bold tracking-tight text-[#0f172a]">Brown University</span>
          </div>
        </div>
      </header>

      <main className="px-6 pb-32">
        {/* Welcome */}
        <div className="mt-4 mb-8">
          <h2 className="text-3xl font-extrabold text-[#0f172a] mb-3 leading-tight">Welcome,<br />Jenny</h2>
          <div className="flex items-center gap-2 text-sm text-[#0f172a] bg-gray-50 w-fit px-3 py-1.5 rounded-full border border-gray-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="font-semibold text-gray-700">Faunce House (GPS Active)</span>
          </div>
        </div>

        {/* Emergency Button */}
        <div className="mb-10 relative group">
          <div className="absolute -inset-0.5 bg-[#be0909]/20 rounded-2xl blur-sm opacity-50"></div>
          <button
            onClick={onReportClick}
            className="relative w-full bg-[#be0909] active:scale-[0.98] transition-transform duration-100 flex flex-col items-center justify-center py-8 px-6 rounded-2xl shadow-[0_0_20px_-5px_rgba(190,9,9,0.4)] overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border-4 border-white/25 flex items-center justify-center mb-4 bg-white/10 backdrop-blur-md shadow-inner">
                <span className="material-symbols-outlined text-white text-[32px]">warning</span>
              </div>
              <h3 className="text-2xl font-black text-white tracking-wider uppercase mb-1">Report Emergency</h3>
              <p className="text-white text-sm font-medium text-center max-w-[260px] opacity-95">Tap to connect with Brown DPS immediately.<br />Location shared automatically.</p>
            </div>
          </button>
        </div>

        {/* Official Alerts */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500">Official Alerts</h4>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">Live Feed</span>
          </div>
          <div className="bg-white border border-gray-100 border-l-4 border-l-yellow-500 rounded-lg shadow-sm p-5 relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-yellow-500 material-symbols-fill">notifications_active</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1.5">
                  <h5 className="font-bold text-[#0f172a] text-base">Safewalk Advisory</h5>
                  <span className="text-[10px] font-bold bg-yellow-50 text-yellow-700 px-2 py-1 rounded uppercase tracking-wide border border-yellow-100">Verified</span>
                </div>
                <p className="text-sm text-[#0f172a]/80 leading-relaxed mb-3 font-medium">Heavy snow accumulation on Thayer St. sidewalks. Maintenance crews are deployed.</p>
                <p className="text-xs text-gray-400 font-medium">Updated: 12 mins ago</p>
              </div>
            </div>
          </div>
        </div>
        {/* Services */}
        <div className="mb-6">
          <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">
            Services
          </h4>

          <div className="grid grid-cols-2 gap-4">
            {/* Campus Police */}
            <a
              href="https://publicsafety.brown.edu/about/staff-directory"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-5 rounded-xl border border-gray-100 flex flex-col items-start hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3 text-blue-600">
                <span className="material-symbols-outlined">local_police</span>
              </div>
              <span className="font-bold text-[#0f172a] text-left leading-tight text-base">
                Campus Police
              </span>
              <span className="text-xs text-gray-500 mt-1 text-left font-medium">
                Non-emergency
              </span>
            </a>

            {/* Health Services */}
            <a
              href="https://healthservices.brown.edu/appointments"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-5 rounded-xl border border-gray-100 flex flex-col items-start hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center mb-3 text-red-600">
                <span className="material-symbols-outlined">medical_services</span>
              </div>
              <span className="font-bold text-[#0f172a] text-left leading-tight text-base">
                Health Services
              </span>
              <span className="text-xs text-gray-500 mt-1 text-left font-medium">
                Book appt
              </span>
            </a>

            {/* Safe Walk */}
            <a
              href="https://publicsafety.brown.edu/programsservices/safewalk"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-5 rounded-xl border border-gray-100 flex flex-col items-start hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center mb-3 text-purple-600">
                <span className="material-symbols-outlined">directions_walk</span>
              </div>
              <span className="font-bold text-[#0f172a] text-left leading-tight text-base">
                Safe Walk
              </span>
              <span className="text-xs text-gray-500 mt-1 text-left font-medium">
                Request escort
              </span>
            </a>

            {/* Mental Health */}
            <a
              href="https://caps.brown.edu/about-us/contact-us"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-5 rounded-xl border border-gray-100 flex flex-col items-start hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center mb-3 text-teal-600">
                <span className="material-symbols-outlined">psychology</span>
              </div>
              <span className="font-bold text-[#0f172a] text-left leading-tight text-base">
                Mental Health
              </span>
              <span className="text-xs text-gray-500 mt-1 text-left font-medium">
                24/7 Support
              </span>
            </a>
          </div>
        </div>


      </main>
    </div>
  );
};

export default Hub;
