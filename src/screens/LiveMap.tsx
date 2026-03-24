
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { fetchPublicIncidents, fetchSafeLocations, PublicIncident, SafeLocation } from '../api';

// Fix for default marker icons in Leaflet with React
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom pulse icon for incidents
const createPulseIcon = (size: number) => L.divIcon({
  className: 'hotspot-icon',
  iconSize: [size, size],
  iconAnchor: [size / 2, size / 2]
});

// Green icon for safe locations
const safeLocationIcon = L.divIcon({
  className: '',
  html: '<div style="background:#10b981;border:2px solid white;border-radius:50%;width:14px;height:14px;box-shadow:0 0 0 3px rgba(16,185,129,0.3);"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

// Component to handle zoom programmatically
const MapController = ({ zoomLevel }: { zoomLevel: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setZoom(zoomLevel);
  }, [zoomLevel, map]);
  return null;
};

const SEVERITY_SIZE: Record<string, number> = {
  critical: 20,
  high: 16,
  medium: 12,
  low: 10,
};

const SEVERITY_LABEL: Record<string, { text: string; className: string }> = {
  critical: { text: 'Critical', className: 'text-[var(--alert-red)] bg-red-50' },
  high: { text: 'High Risk', className: 'text-[var(--alert-red)] bg-red-50' },
  medium: { text: 'Medium', className: 'text-[var(--alert-yellow)] bg-yellow-50' },
  low: { text: 'Low', className: 'text-green-600 bg-green-50' },
};

const LiveMap: React.FC = () => {
  const [zoom, setZoom] = useState(16);
  const center: [number, number] = [41.8268, -71.4025]; // Brown University center
  const [incidents, setIncidents] = useState<PublicIncident[]>([]);
  const [safeLocations, setSafeLocations] = useState<SafeLocation[]>([]);

  useEffect(() => {
    fetchPublicIncidents()
      .then(setIncidents)
      .catch(err => console.error('Failed to load incidents:', err));
    fetchSafeLocations()
      .then(setSafeLocations)
      .catch(err => console.error('Failed to load safe locations:', err));
  }, []);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 1, 19));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 1, 12));

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      {/* Top Header Overlay */}
      <div className="absolute top-12 left-0 right-0 px-6 z-[1000] flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto">
          <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-gray-100/50">
            <h1 className="text-lg font-bold tracking-tight text-[var(--navy-blue)]">Live Map</h1>
            <p className="text-[10px] text-[var(--ios-muted)] font-semibold uppercase tracking-wider">Campus Situational Feed</p>
          </div>
        </div>
        <button className="pointer-events-auto w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-sm border border-gray-100 flex items-center justify-center text-[var(--navy-blue)]">
          <span className="material-symbols-outlined">layers</span>
        </button>
      </div>

      {/* Actual Interactive Map Area */}
      <div className="relative h-[55%] w-full overflow-hidden">
        <MapContainer 
          center={center} 
          zoom={zoom} 
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController zoomLevel={zoom} />
          
          {/* Public incident markers */}
          {incidents.map(incident => (
            <Marker
              key={incident.id}
              position={[incident.latitude, incident.longitude]}
              icon={createPulseIcon(SEVERITY_SIZE[incident.severity] || 14)}
            />
          ))}

          {/* Safe location markers */}
          {safeLocations.map(loc => (
            <Marker
              key={loc.id}
              position={[loc.latitude, loc.longitude]}
              icon={safeLocationIcon}
            />
          ))}
        </MapContainer>

        {/* Map Control Buttons */}
        <div className="absolute top-1/2 -translate-y-1/2 right-4 flex flex-col space-y-3 z-[1000]">
          <button 
            onClick={handleZoomIn}
            className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-[var(--navy-blue)] shadow-md border border-gray-100 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-xl">add</span>
          </button>
          <button 
            onClick={handleZoomOut}
            className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-[var(--navy-blue)] shadow-md border border-gray-100 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-xl">remove</span>
          </button>
          <button 
            onClick={() => setZoom(16)}
            className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-[var(--navy-blue)] shadow-md border border-gray-100 active:scale-95 transition-transform mt-4"
          >
            <span className="material-symbols-outlined text-xl">my_location</span>
          </button>
        </div>
      </div>

      {/* Dashboard Bottom Sheet */}
      <div className="flex-1 bg-white relative -mt-6 rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] z-[1001] flex flex-col overflow-hidden">
        <div className="w-full flex justify-center pt-3 pb-1 flex-shrink-0 bg-white z-30 sticky top-0">
          <div className="w-10 h-1 bg-gray-200 rounded-full"></div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 pb-28 pt-2 no-scrollbar">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white p-4 rounded-2xl border border-[var(--ios-card-border)] shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <p className="text-[var(--ios-muted)] text-[10px] font-bold uppercase tracking-wider">Active Incidents</p>
                <span className="material-symbols-outlined text-gray-400 text-lg">warning</span>
              </div>
              <h3 className="text-3xl font-bold text-[var(--navy-blue)]">{incidents.length}</h3>
              <div className="mt-2 flex items-center text-[10px] font-semibold text-gray-500">
                <span className="material-symbols-outlined text-xs mr-1">info</span>
                <span>Verified incidents</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-[var(--ios-card-border)] shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <p className="text-[var(--ios-muted)] text-[10px] font-bold uppercase tracking-wider">Safe Locations</p>
                <span className="material-symbols-outlined text-gray-400 text-lg">shield</span>
              </div>
              <h3 className="text-3xl font-bold text-[var(--navy-blue)]">{safeLocations.length}</h3>
              <div className="mt-2 flex items-center text-[10px] font-semibold text-green-600">
                <span className="material-symbols-outlined text-xs mr-1">check_circle</span>
                <span>Curated locations</span>
              </div>
            </div>
          </div>

          {/* Incident List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--navy-blue)]">Active Incidents</h2>
            </div>
            
            <div className="bg-white rounded-2xl p-1 space-y-3">
              {incidents.length === 0 ? (
                <div className="p-6 text-center">
                  <span className="material-symbols-outlined text-gray-300 text-3xl">check_circle</span>
                  <p className="text-sm text-gray-400 font-medium mt-2">No active incidents</p>
                </div>
              ) : (
                incidents.map(incident => {
                  const sev = SEVERITY_LABEL[incident.severity] || SEVERITY_LABEL.medium;
                  return (
                    <div key={incident.id} className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 text-[var(--alert-red)]">
                            <span className="material-symbols-outlined text-lg">campaign</span>
                          </div>
                          <div>
                            <span className="text-sm font-bold text-[var(--navy-blue)] block leading-tight mb-0.5">{incident.title}</span>
                            <span className="text-xs text-[var(--ios-muted)] flex items-center gap-1">
                              <span className="material-symbols-outlined text-[10px]">location_on</span>
                              {incident.public_message.slice(0, 50)}{incident.public_message.length > 50 ? '...' : ''} • {incident.report_count} Report{incident.report_count !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-extrabold px-2 py-1 rounded-full uppercase tracking-tight ${sev.className}`}>{sev.text}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-medium text-gray-500">
                          <span>Confidence Level</span>
                          <span>{incident.confidence_percent}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-[var(--alert-red)] h-1.5 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" style={{ width: `${incident.confidence_percent}%` }}></div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMap;
