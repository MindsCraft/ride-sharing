import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Phone, MessageCircle, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const defaultIcon = L.icon({ iconUrl, shadowUrl: iconShadow, iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = defaultIcon;

const DROPOFF_ICON = L.divIcon({
  html: `<div style="width:40px;height:40px;background:#EF4444;border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(239,68,68,0.4);font-size:18px;">🏢</div>`,
  className: '', iconAnchor: [20, 40],
});

const DRIVER_ICON = L.divIcon({
  html: `<div style="background:white;border:2.5px solid #0D9488;border-radius:12px;padding:6px 10px;display:flex;align-items:center;gap:5px;box-shadow:0 3px 12px rgba(0,0,0,0.15);white-space:nowrap;">
    <span style="font-size:18px;">🚗</span>
    <span style="font-size:12px;font-weight:700;color:#0D9488;">On the way</span>
  </div>`,
  className: '', iconAnchor: [50, 20],
});

// Animate map to driver position
const MapAnimator = ({ pos }: { pos: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.panTo(pos, { animate: true, duration: 1 });
  }, [pos, map]);
  return null;
};

const LiveTripPage = () => {
  const { activeTrip, setActiveTrip, setCompletedTrip, setScreen } = useApp();
  const [showSOS, setShowSOS] = useState(false);
  const [etaSeconds, setEtaSeconds] = useState(420); // ~7 min
  const [tripPhase, setTripPhase] = useState<'arriving' | 'in_progress' | 'completed'>('arriving');

  // Mock driver position — animates toward pickup, then dropoff
  const [driverPos, setDriverPos] = useState<[number, number]>([
    (activeTrip?.driverLat ?? 23.8759) + 0.015,
    (activeTrip?.driverLng ?? 90.3795) + 0.008,
  ]);

  const dropoffPos: [number, number] = [23.7800, 90.4200]; // mock dropoff

  const interval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let step = 0;
    interval.current = setInterval(() => {
      step++;
      setEtaSeconds(s => Math.max(0, s - 10));

      // Animate driver gradually toward dropoff
      setDriverPos(([lat, lng]) => [
        lat - 0.0006,
        lng + 0.0004,
      ]);

      if (step === 40) {
        setTripPhase('in_progress');
        setEtaSeconds(360);
      }
      if (step === 85) {
        setTripPhase('completed');
        if (interval.current) clearInterval(interval.current);
        setTimeout(() => {
          if (activeTrip) setCompletedTrip(activeTrip);
          setActiveTrip(null);
          setScreen('rate_trip');
        }, 1500);
      }
    }, 300);
    return () => { if (interval.current) clearInterval(interval.current); };
  }, []);

  const etaMin = Math.ceil(etaSeconds / 60);
  const etaDisplay = etaMin <= 1 ? 'Arriving now' : `${etaMin} min away`;

  if (!activeTrip) return null;

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Map fills top 55% */}
      <div style={{ flex: '0 0 55%', position: 'relative' }}>
        <MapContainer
          center={driverPos}
          zoom={14}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
          <MapAnimator pos={driverPos} />
          <Marker position={driverPos} icon={DRIVER_ICON} />
          <Marker position={dropoffPos} icon={DROPOFF_ICON} />
          <Polyline positions={[driverPos, dropoffPos]} pathOptions={{ color: '#0D9488', weight: 4, dashArray: '8 8', opacity: 0.7 }} />
        </MapContainer>

        {/* Phase banner */}
        <div style={{
          position: 'absolute', top: 16, left: 16, right: 16,
          background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(10px)',
          color: 'white', borderRadius: 'var(--radius-full)', padding: '10px 18px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 400,
        }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>
            {tripPhase === 'arriving' && `🚗 Driver ${etaDisplay}`}
            {tripPhase === 'in_progress' && '🛣️ Trip in progress'}
            {tripPhase === 'completed' && '✅ Arriving at destination...'}
          </span>
          <div style={{ background: 'var(--primary)', borderRadius: 'var(--radius-full)', padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>
            {tripPhase === 'arriving' ? etaDisplay : tripPhase === 'in_progress' ? `${etaMin}m left` : 'Done!'}
          </div>
        </div>
      </div>

      {/* Trip info panel */}
      <div style={{
        flex: 1, background: 'var(--surface)', padding: '20px 20px 28px',
        display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.08)',
      }}>
        {/* Driver info row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'var(--surface-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 700, color: 'var(--primary)', border: '3px solid var(--primary-light)',
          }}>
            {activeTrip.driverName.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{activeTrip.driverName}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>⭐ {activeTrip.driverRating} · {activeTrip.car}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, fontSize: 20, color: 'var(--primary)' }}>৳{activeTrip.agreedPrice}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>agreed price</div>
          </div>
        </div>

        {/* Route */}
        <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-lg)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 14, color: 'var(--text-sub)' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />
            {activeTrip.from}
          </div>
          <div style={{ width: 2, height: 10, background: 'var(--border)', marginLeft: 4 }} />
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 14, color: 'var(--text-sub)' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--danger)', flexShrink: 0 }} />
            {activeTrip.to}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '12px 0', borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', border: 'none', cursor: 'pointer' }}>
            <Phone size={20} color="var(--primary)" />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>Call</span>
          </button>
          <button style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '12px 0', borderRadius: 'var(--radius-md)', background: 'var(--accent-light)', border: 'none', cursor: 'pointer' }}>
            <MessageCircle size={20} color="var(--accent)" />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>Message</span>
          </button>
          <button
            onClick={() => setShowSOS(true)}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '12px 0', borderRadius: 'var(--radius-md)', background: '#FEE2E2', border: 'none', cursor: 'pointer' }}>
            <AlertTriangle size={20} color="#EF4444" />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#EF4444' }}>SOS</span>
          </button>
        </div>

        {/* Share trip */}
        <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 0', borderRadius: 'var(--radius-full)', border: '1.5px solid var(--border)', background: 'var(--surface)', fontSize: 14, fontWeight: 600, color: 'var(--text-sub)', cursor: 'pointer' }}>
          📤 Share Live Trip with Family
        </button>
      </div>

      {/* SOS Modal */}
      {showSOS && (
        <div className="modal-overlay">
          <div className="modal-sheet" style={{ textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <AlertTriangle size={30} color="#EF4444" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Emergency Alert</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
              This will share your live location with your emergency contact and alert our safety team.
            </p>
            <button className="btn btn-block" style={{ background: '#EF4444', color: 'white', marginBottom: 12, fontSize: 16, fontWeight: 700 }}>
              🆘 Send SOS Alert Now
            </button>
            <button className="btn btn-secondary btn-block" onClick={() => setShowSOS(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveTripPage;
