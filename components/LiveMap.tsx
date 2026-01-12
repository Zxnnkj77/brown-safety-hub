
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

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

// Component to handle zoom programmatically
const MapController = ({ zoomLevel }: { zoomLevel: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setZoom(zoomLevel);
  }, [zoomLevel, map]);
  return null;
};

const LiveMap: React.FC = () => {
  const [zoom, setZoom] = useState(16);
  const center: [number, number] = [41.8268, -71.4025]; // Brown University center

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
          
          {/* Mock Incident Markers */}
          <Marker position={[41.8265, -71.4030]} icon={createPulseIcon(16)} />
          <Marker position={[41.8280, -71.4010]} icon={createPulseIcon(12)} />
          <Marker position={[41.8250, -71.4050]} icon={createPulseIcon(14)} />
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
                <p className="text-[var(--ios-muted)] text-[10px] font-bold uppercase tracking-wider">Active Alerts</p>
                <span className="material-symbols-outlined text-gray-400 text-lg">warning</span>
              </div>
              <h3 className="text-3xl font-bold text-[var(--navy-blue)]">3</h3>
              <div className="mt-2 flex items-center text-[10px] font-semibold text-[var(--alert-red)]">
                <span className="material-symbols-outlined text-xs mr-1">trending_up</span>
                <span>+2 increased</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-[var(--ios-card-border)] shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <p className="text-[var(--ios-muted)] text-[10px] font-bold uppercase tracking-wider">Patrols Active</p>
                <span className="material-symbols-outlined text-gray-400 text-lg">security</span>
              </div>
              <h3 className="text-3xl font-bold text-[var(--navy-blue)]">12</h3>
              <div className="mt-2 flex items-center text-[10px] font-semibold text-green-600">
                <span className="material-symbols-outlined text-xs mr-1">check_circle</span>
                <span>Optimal Coverage</span>
              </div>
            </div>
          </div>

          {/* Incident List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--navy-blue)]">Emerging Incidents</h2>
              <button className="text-xs font-semibold text-[var(--navy-blue)] bg-blue-50 px-2 py-1 rounded-md">View All</button>
            </div>
            
            <div className="bg-white rounded-2xl p-1 space-y-3">
              <div className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 text-[var(--alert-red)]">
                      <span className="material-symbols-outlined text-lg">campaign</span>
                    </div>
                    <div>
                      <span className="text-sm font-bold text-[var(--navy-blue)] block leading-tight mb-0.5">Loud Sounds Reported</span>
                      <span className="text-xs text-[var(--ios-muted)] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[10px]">location_on</span>
                        Science Library • 4 Reports
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold text-[var(--alert-red)] bg-red-50 px-2 py-1 rounded-full uppercase tracking-tight">High Risk</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-medium text-gray-500">
                    <span>Confidence Level</span>
                    <span>85%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-[var(--alert-red)] h-1.5 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMap;
