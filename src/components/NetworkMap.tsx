import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in leaflet
// @ts-ignore
import markerIcon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
// @ts-ignore
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIconRetina,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Mock Customer Locations
const MOCK_CUSTOMERS = [
  { id: '1', name: 'John Doe', latitude: -6.2088, longitude: 106.8456, plan: '100Mbps' },
  { id: '2', name: 'Jane Smith', latitude: -6.2150, longitude: 106.8500, plan: '50Mbps' },
  { id: '3', name: 'ISP Hub #1', latitude: -6.2100, longitude: 106.8400, type: 'POP' },
];

interface NetworkMapProps {
  odpNodes?: any[];
  olts?: any[];
  routers?: any[];
  customers?: any[];
}

export default function NetworkMap({ odpNodes = [], olts = [], routers = [], customers = [] }: NetworkMapProps) {
  // Center map on the first node if available
  const center: [number, number] = odpNodes.length > 0 
    ? [odpNodes[0].lat || -6.2088, odpNodes[0].lng || 106.8456]
    : [-6.2088, 106.8456];

  return (
    <div className="h-[600px] w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm relative group">
      <div className="absolute top-4 left-4 z-[1001] flex gap-2">
         <button className="px-3 py-1.5 bg-white border border-slate-300 rounded shadow-sm text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition-colors">Layer: Network Infrastructure</button>
      </div>

      <MapContainer 
        center={center}
        zoom={14} 
        scrollWheelZoom={false}
        className="h-full w-full z-0 grayscale"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Render ODP Nodes */}
        {odpNodes.map((odp) => (
          <Marker 
            key={odp.id} 
            position={[odp.lat || -6.2, odp.lng || 106.8]}
            icon={L.divIcon({
              className: 'custom-div-icon',
              html: `<div style="background-color: #fbbf24; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(251, 191, 36, 0.5);"></div>`,
              iconSize: [12, 12],
              iconAnchor: [6, 6]
            })}
          >
            <Popup>
              <div className="p-2 min-w-40">
                <h4 className="font-bold text-slate-900 text-sm mb-1">{odp.name}</h4>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded border border-amber-100 w-fit">Splitter Node</span>
                  <p className="text-[10px] text-slate-500 font-medium">OLT: {odp.oltId || 'Unassigned'}</p>
                  <p className="text-[10px] text-slate-500 font-medium">Capacity: {odp.ports || 8} Ports</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1 pt-1 border-t border-slate-100">{odp.lat}, {odp.lng}</p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Render Customers/ONU placeholders */}
        {MOCK_CUSTOMERS.filter(c => c.type !== 'POP').map((cust) => (
          <Marker key={cust.id} position={[cust.latitude, cust.longitude]}>
            <Popup>
              <div className="p-1">
                <h4 className="font-bold text-slate-900">{cust.name}</h4>
                <p className="text-xs text-slate-500">{cust.plan}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Legend Override */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur p-3 rounded-lg shadow-xl z-[1001] border border-slate-200 min-w-32">
        <h4 className="text-[10px] font-bold uppercase tracking-tight text-slate-500 mb-2 border-b border-slate-100 pb-1">Legend</h4>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
            <span className="text-[10px] font-bold text-slate-600">ODP / Splitter</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-[10px] font-bold text-slate-600">Active ONU</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-10 border-t border-slate-200 bg-slate-50/80 backdrop-blur px-4 flex items-center text-[10px] font-mono text-slate-500 justify-between z-[1001]">
         <div>Live Infrastructure Map</div>
         <div>Nodes: {odpNodes.length + MOCK_CUSTOMERS.length}</div>
      </div>
    </div>
  );
}
