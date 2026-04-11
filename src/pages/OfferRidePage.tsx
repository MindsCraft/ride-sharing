import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Clock, Users, RotateCcw, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';

import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const defaultIcon = L.icon({ iconUrl, shadowUrl: iconShadow, iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = defaultIcon;

const START_ICON = L.divIcon({
  html: `<div style="width:42px;height:42px;background:#0D9488;border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(13,148,136,0.5);font-size:18px;">🏠</div>`,
  className: '', iconAnchor: [21, 21],
});

const END_ICON = L.divIcon({
  html: `<div style="width:42px;height:42px;background:#EF4444;border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(239,68,68,0.5);font-size:18px;">🏢</div>`,
  className: '', iconAnchor: [21, 42],
});

const DHAKA_CENTER: [number, number] = [23.8103, 90.4125];

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, { headers: { 'Accept-Language': 'en' } });
    const data = await res.json();
    const addr = data.address;
    return addr.neighbourhood || addr.suburb || addr.city_district || addr.road || data.display_name?.split(',')[0] || `${lat.toFixed(4)},${lng.toFixed(4)}`;
  } catch { return `${lat.toFixed(4)},${lng.toFixed(4)}`; }
}

type PinMode = 'start' | 'end' | 'done';

const MapClickHandler = ({ mode, onStart, onEnd }: { mode: PinMode; onStart: (l: L.LatLng) => void; onEnd: (l: L.LatLng) => void }) => {
  useMapEvents({
    click(e) {
      if (mode === 'start') onStart(e.latlng);
      else if (mode === 'end') onEnd(e.latlng);
    },
  });
  return null;
};

interface Point { lat: number; lng: number; address: string; }

const OfferRidePage = () => {
  const { user, refreshAppData } = useApp();
  const [pinMode, setPinMode] = useState<PinMode>('start');
  const [start, setStart] = useState<Point | null>(null);
  const [end, setEnd] = useState<Point | null>(null);
  const [seats, setSeats] = useState(2);
  const [time, setTime] = useState('');
  const [price, setPrice] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStart = async (latlng: L.LatLng) => {
    const address = await reverseGeocode(latlng.lat, latlng.lng);
    setStart({ lat: latlng.lat, lng: latlng.lng, address });
    setPinMode('end');
  };

  const handleEnd = async (latlng: L.LatLng) => {
    const address = await reverseGeocode(latlng.lat, latlng.lng);
    setEnd({ lat: latlng.lat, lng: latlng.lng, address });
    setPinMode('done');
  };

  const handleReset = () => {
    setStart(null); setEnd(null); setPinMode('start'); setSubmitted(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!start || !end || !user) return;
    setLoading(true);
    setError('');

    const priceNum = parseFloat(price.replace(/[^0-9.]/g, '')) || 0;
    const departureTime = new Date(time).toISOString();

    const { data, error: insertError } = await supabase
      .from('rides')
      .insert({
        driver_id: user.id,
        from_address: start.address,
        to_address: end.address,
        from_lat: start.lat,
        from_lng: start.lng,
        to_lat: end.lat,
        to_lng: end.lng,
        departure_time: departureTime,
        total_seats: seats,
        seats_left: seats,
        price_per_seat: priceNum,
        is_recurring: isRecurring,
        status: 'active',
      })
      .select()
      .single();

    setLoading(false);

    if (insertError || !data) {
      setError('Could not post ride. Please try again.');
      return;
    }

    // Refresh from DB for consistency
    await refreshAppData();
    setSubmitted(true);
  };

  const instructionText = () => {
    if (pinMode === 'start') return '📍 Tap map to set your START location';
    if (pinMode === 'end') return '🏁 Now tap map to set your END location';
    return null;
  };

  if (submitted) {
    return (
      <div className="page-scroll">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: 12, padding: 32 }}>
          <div style={{ width: 72, height: 72, background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={36} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>Ride Posted! 🎉</h2>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: 280 }}>
            Your route is now visible to commuters. You'll get notified when someone sends a ride request.
          </p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={handleReset}>
            Post Another Ride
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Map top half */}
      <div className="offer-map-container" style={{ height: '42vh', cursor: pinMode !== 'done' ? 'crosshair' : 'default' }}>
        <MapContainer center={DHAKA_CENTER} zoom={12} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
          <MapClickHandler mode={pinMode} onStart={handleStart} onEnd={handleEnd} />
          {start && <Marker position={[start.lat, start.lng]} icon={START_ICON} />}
          {end && <Marker position={[end.lat, end.lng]} icon={END_ICON} />}
        </MapContainer>

        {/* Instruction chip on map */}
        {instructionText() && (
          <div style={{
            position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)',
            color: 'white', padding: '8px 16px', borderRadius: 99, fontSize: 13,
            fontWeight: 500, zIndex: 400, whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            {instructionText()}
          </div>
        )}
      </div>

      {/* Form bottom half */}
      <div className="page-scroll offer-form-panel">
        <div style={{ marginBottom: 6 }}>
          <h2 style={{ fontWeight: 800, fontSize: 18 }}>Offer Your Ride</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Fill in details for commuters to find you</p>
        </div>

        {/* Route Display */}
        <div className="offer-route-display" style={{ marginTop: 12 }}>
          <div className="offer-route-point">
            <div className="offer-route-dot start" />
            <span style={{ fontSize: 14, flex: 1 }}>
              {start ? start.address : <span style={{ color: 'var(--text-muted)' }}>Tap map for start location</span>}
            </span>
          </div>
          <div style={{ width: 2, height: 10, background: 'var(--border)', marginLeft: 5 }} />
          <div className="offer-route-point">
            <div className="offer-route-dot end" />
            <span style={{ fontSize: 14, flex: 1 }}>
              {end ? end.address : <span style={{ color: 'var(--text-muted)' }}>{start ? 'Tap map for end location' : '—'}</span>}
            </span>
          </div>

          {(start || end) && (
            <button onClick={handleReset} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              <RotateCcw size={12} /> Reset points
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Departure Time */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={14} /> Departure Time
            </label>
            <input type="datetime-local" className="form-input" required value={time} onChange={e => setTime(e.target.value)} />
          </div>

          {/* Recurring */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: 15 }}>Recurring Daily Commute</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Repeat this ride Monday to Friday</div>
            </div>
            <button
              type="button"
              onClick={() => setIsRecurring(r => !r)}
              style={{
                width: 44, height: 24, borderRadius: 12,
                background: isRecurring ? 'var(--primary)' : 'var(--border)',
                position: 'relative', transition: 'all 0.25s',
              }}
            >
              <div style={{
                position: 'absolute', top: 2, left: isRecurring ? 22 : 2,
                width: 20, height: 20, borderRadius: '50%', background: 'white',
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.25s',
              }} />
            </button>
          </div>

          {/* Seats */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={14} /> Available Seats
            </label>
            <div className="seats-selector">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <button key={n} type="button" className={`seat-btn ${seats === n ? 'selected' : ''}`} onClick={() => setSeats(n)}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Cost */}
          <div className="form-group">
            <label className="form-label">Expected Cost Sharing (BDT)</label>
            <input type="text" className="form-input" placeholder="e.g. 150 or Negotiable" required value={price} onChange={e => setPrice(e.target.value)} />
          </div>

          {error && <div style={{ color: '#991B1B', background: '#FEE2E2', borderRadius: 'var(--radius-md)', padding: '10px', fontSize: 13, marginBottom: 12 }}>{error}</div>}

          <button type="submit" className="btn btn-primary btn-block" disabled={!start || !end || loading}>
            {loading ? 'Posting...' : 'Publish Ride 🚀'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OfferRidePage;
