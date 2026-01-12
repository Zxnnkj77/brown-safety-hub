import React, { useState } from 'react';

interface ReportFormProps {
  onBack: () => void;
  onSuccess: (data: any) => void;
}

const ReportForm: React.FC<ReportFormProps> = ({ onBack, onSuccess }) => {
  const [incidentType, setIncidentType] = useState('Select incident type');
  const [location, setLocation] = useState('130 Waterman St, Providence, RI');
  const [description, setDescription] = useState('');
  const [confidence, setConfidence] = useState(8);
  const [isUrgent, setIsUrgent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || incidentType === 'Select incident type') return;

    onSuccess({
      type: incidentType,
      location,
      description,
      confidence,
      isUrgent,
    });
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden z-50">
      {/* Form Header */}
      <div className="flex items-center px-4 py-4 bg-white border-b border-gray-100 shrink-0">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <span className="material-symbols-outlined text-2xl text-[#0f172a]">
            chevron_left
          </span>
        </button>
        <h1 className="text-xl font-bold ml-2 text-[#0f172a]">Make a report</h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-6 pb-40">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Incident Type */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-500 uppercase tracking-wide">
              Incident Type
            </label>
            <div className="relative">
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                className="block w-full pl-4 pr-10 py-3 text-base border-none rounded-xl bg-gray-100 text-[#0f172a] focus:ring-2 focus:ring-[#be0909] shadow-sm appearance-none transition-shadow"
              >
                <option>Select incident type</option>
                <option>Medical Emergency</option>
                <option>Fire</option>
                <option>Accident</option>
                <option>Violence / Assault</option>
                <option>Suspicious Activity</option>
                <option>Other</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                <span className="material-symbols-outlined">expand_more</span>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-500 uppercase tracking-wide">
              Location
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-[#be0909] text-xl material-symbols-fill">
                  location_on
                </span>
              </div>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="block w-full pl-12 pr-4 py-3 border-none rounded-xl bg-gray-100 text-[#0f172a] placeholder-gray-400 focus:ring-2 focus:ring-[#be0909] transition-shadow"
                placeholder="Enter location"
                type="text"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  className="p-1 rounded-full text-gray-400 hover:bg-gray-200"
                  title="Use my location"
                >
                  <span className="material-symbols-outlined text-lg">my_location</span>
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-500 uppercase tracking-wide">
              Description of Incident
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full px-4 py-3 border-none rounded-xl bg-gray-100 text-[#0f172a] placeholder-gray-400 focus:ring-2 focus:ring-[#be0909] shadow-sm resize-none transition-shadow"
              placeholder="Please describe what happened in detail..."
              rows={4}
            />
          </div>

          {/* Confidence Slider */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="block text-sm font-bold text-gray-500 uppercase tracking-wide">
                Confidence Level
              </label>
              <span className="text-xs font-bold text-gray-400">{confidence}/10</span>
            </div>
            <div className="bg-gray-100 p-4 rounded-xl">
              <input
                type="range"
                min="1"
                max="10"
                value={confidence}
                onChange={(e) => setConfidence(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#be0909]"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2 font-bold uppercase tracking-widest">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
          </div>

          {/* Evidence */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-500 uppercase tracking-wide">
              Evidence
            </label>
            <button
              className="flex items-center justify-center w-full px-6 py-6 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-50 transition-colors group"
              type="button"
            >
              <div className="text-center">
                <span className="material-symbols-outlined text-3xl text-gray-400 group-hover:text-[#be0909] transition-colors">
                  add_photo_alternate
                </span>
                <p className="mt-1 text-sm text-gray-500 font-bold uppercase tracking-tight">
                  Attach Photos or Video
                </p>
              </div>
            </button>
          </div>

          {/* Urgent Toggle */}
          <div className="flex items-center justify-between bg-gray-100 p-4 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="material-symbols-outlined text-[#be0909] text-xl material-symbols-fill">
                  priority_high
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#0f172a]">Urgent Priority</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                  Immediate attention required
                </span>
              </div>
            </div>
            <label className="flex items-center cursor-pointer relative" htmlFor="urgent-toggle">
              <input
                id="urgent-toggle"
                type="checkbox"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#be0909]"></div>
            </label>
          </div>

          {/* Spacer so submit button doesn't cover last fields (since it's floating) */}
          <div className="h-24" />
        </form>
      </div>

      {/* Floating Action Button */}
      <div className="absolute bottom-[100px] left-0 right-0 px-6 z-20">
        <button
          type="submit"
          form="" // not needed; kept empty intentionally
          onClick={() => {
            // no-op: submit is handled by the form button below via type="submit"
          }}
          className="hidden"
        />
        <button
          type="submit"
          onClick={(e) => {
            // This ensures submit works even if button is outside the <form> visually
            // (Because it's absolutely positioned). We manually call handleSubmit.
            handleSubmit(e as unknown as React.FormEvent);
          }}
          disabled={!description || incidentType === 'Select incident type'}
          className="w-full bg-[#be0909] text-white font-black uppercase tracking-wider py-4 rounded-xl shadow-lg shadow-[#be0909]/30 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:active:scale-100"
        >
          <span>Submit Report</span>
          <span className="material-symbols-outlined text-sm material-symbols-fill">send</span>
        </button>
      </div>

      {/* Voice Assistant Circle (UI only) */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-full px-6 flex justify-center items-center">
        <div className="bg-white rounded-full shadow-2xl border border-gray-100 p-2 flex justify-center items-center h-20 w-20">
          <button
            type="button"
            className="flex items-center justify-center bg-[#be0909] rounded-full h-14 w-14 shadow-lg shadow-[#be0909]/40 active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined text-white text-2xl material-symbols-fill">
              mic
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportForm;
