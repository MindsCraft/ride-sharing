import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Clock, Users, CheckCircle, Navigation, Search, X, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';

import { 
  type LatLngPair, 
  DHAKA_CENTER, 
  UBER_PICKUP_ICON as START_ICON, 
  UBER_DROPOFF_ICON as END_ICON, 
  reverseGeocode, 
  fetchRoute 
} from '../utils/mapUtils';
import LocationSearchModal from '../components/LocationSearchModal';

// Shared Map Controllers
const PinRefinementController = ({ onCenterChange }: { onCenterChange: (latlng: L.LatLng) => void }) => {
  const map = useMapEvents({
    moveend() {
      onCenterChange(map.getCenter());
    },
  });
  return null;
};

const LocateMeController = ({ trigger }: { trigger: number }) => {
  const map = useMap();
  useEffect(() => {
    if (trigger > 0) {
      map.locate({ setView: true, maxZoom: 15 });
    }
  }, [trigger, map]);
  return null;
};

type MapMode = 'idle' | 'searching' | 'refining' | 'details' | 'posted';

const OfferRidePage = () => {
  const { user, refreshAppData } = useApp();
  const [mapMode, setMapMode] = useState<MapMode>('idle');
  const [searchingType, setSearchingType] = useState<'origin' | 'destination' | null>(null);
  const [start, setStart] = useState<LatLngPair | null>(null);
  const [end, setEnd] = useState<LatLngPair | null>(null);
  
  // Form State
  const [seats, setSeats] = useState(3);
  const [time, setTime] = useState('');
  const [price, setPrice] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [locateTrigger, setLocateTrigger] = useState(0);



  const handleSelectSearch = async (loc: LatLngPair) => {
    if (searchingType === 'origin') {
      setStart(loc);
      setMapMode('refining');
    } else {
      setEnd(loc);
      if (start) {
        const route = await fetchRoute(start, loc);
        setRouteCoords(route);
        setMapMode('details');
      } else {
        setMapMode('idle');
      }
    }
    setSearchingType(null);
  };

  const confirmOrigin = async (latlng: L.LatLng) => {
    const address = await reverseGeocode(latlng.lat, latlng.lng);
    setStart({ lat: latlng.lat, lng: latlng.lng, address });
    
    if (end) {
      const route = await fetchRoute({ lat: latlng.lat, lng: latlng.lng, address }, end);
      setRouteCoords(route);
      setMapMode('details');
    } else {
      setMapMode('idle');
    }
  };

  const handleReset = () => {
    setStart(null);
    setEnd(null);
    setRouteCoords([]);
    setMapMode('idle');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!start || !end || !user) return;

    // Check for vehicle
    if (!user.vehicles || user.vehicles.length === 0) {
      setError('Add a vehicle in Profile first.');
      return;
    }

    setLoading(true);
    setError('');

    const priceNum = parseFloat(price.replace(/[^0-9.]/g, '')) || 0;
    const departureTime = new Date(time).toISOString();

    const { error: insertError } = await supabase
      .from('rides')
      .insert({
        driver_id: user.id,
        vehicle_id: user.vehicles[0].id, // Associate the first vehicle
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
      });

    setLoading(false);

    if (insertError) {
      console.error('Supabase Insert Error:', insertError);
      setError('Could not post ride. Please try again.');
      return;
    }

    await refreshAppData();
    setMapMode('posted');
  };

  if (mapMode === 'posted') {
    return (
      <div className="page-scroll">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: 12, padding: 32 }}>
          <div style={{ width: 72, height: 72, background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={36} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 900 }}>Ride Published! 🎉</h2>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: 280, fontSize: 14 }}>
            Your commute is now live. We'll notify you when someone wants to join.
          </p>
          <button className="btn btn-primary" style={{ marginTop: 24, minWidth: 200 }} onClick={handleReset}>
            Offer Another Ride
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="map-page" style={{ height: '100dvh', background: 'var(--bg)' }}>
      {/* Search Overlay - Top */}
      {mapMode !== 'refining' && mapMode !== 'details' && (
        <div className="uber-search-card-container">
          <div className="uber-search-card" onClick={() => setSearchingType(start ? 'destination' : 'origin')}>
            <div className="search-dot" style={{ background: start ? 'var(--text-main)' : 'var(--primary)' }} />
            <div className="search-placeholder">
              {!start ? "Starting from?" : (end ? end.address : "Going to?")}
            </div>
            <div className="search-time">
              <Search size={18} />
            </div>
          </div>
        </div>
      )}

      {/* Map */}
      <MapContainer 
        center={start ? [start.lat, start.lng] : DHAKA_CENTER} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }} 
        zoomControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
        <LocateMeController trigger={locateTrigger} />
        
        {mapMode === 'refining' && (
           <PinRefinementController onCenterChange={() => {}} />
        )}
        
        {start && mapMode !== 'refining' && <Marker position={[start.lat, start.lng]} icon={START_ICON} />}
        {end && <Marker position={[end.lat, end.lng]} icon={END_ICON} />}
        
        {routeCoords.length > 0 && (
           <Polyline
            positions={routeCoords}
            pathOptions={{ color: 'var(--primary)', weight: 6, opacity: 0.9 }}
          />  )}

        {/* Origin Refinement Button - Must be inside MapContainer for useMap */}
        {mapMode === 'refining' && (
          <ConfirmOriginButton onConfirm={confirmOrigin} />
        )}
      </MapContainer>

      {/* Origin Refinement UI (Visual Marker) - Can be outside */}
      {mapMode === 'refining' && (
        <div className="refinement-marker">
          <div className="uber-pickup-pin" />
        </div>
      )}

      {/* Details Bottom Sheet */}
      {mapMode === 'details' && start && end && (
        <div className="bottom-sheet uber-results">
          <div className="sheet-handle" />
          <div className="sheet-content page-scroll">
            <div className="uber-route-summary">
              <div className="summary-main">
                <span className="time">Publish Ride</span>
                <span className="distance">{start.address.split(',')[0]} → {end.address.split(',')[0]}</span>
              </div>
              <button className="reset-btn" onClick={handleReset}><X size={16} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={16} color="var(--primary)" /> When are you leaving?
                </label>
                <input type="datetime-local" className="form-input" required value={time} onChange={e => setTime(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Users size={16} color="var(--primary)" /> Available Seats
                </label>
                <div className="seats-selector" style={{ justifyContent: 'flex-start', gap: 12 }}>
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <button key={n} type="button" className={`seat-btn ${seats === n ? 'selected' : ''}`} onClick={() => setSeats(n)}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <DollarSign size={16} color="var(--primary)" /> Cost sharing per seat (BDT)
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. 150" 
                  required 
                  value={price} 
                  onChange={e => setPrice(e.target.value)} 
                />
              </div>

              <div className="uber-toggle-container">
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Daily Occurrence</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Repeat this ride every weekday</div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRecurring(r => !r)}
                  className={`uber-switch ${isRecurring ? 'active' : ''}`}
                >
                  <div className="switch-knob" />
                </button>
              </div>

              {error && (
                <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: 13, marginBottom: 8, fontWeight: 500 }}>
                   ⚠️ {error}
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-block uber-confirm-btn" style={{ marginTop: 8 }} disabled={loading}>
                {loading ? 'Publishing...' : 'Confirm and Publish'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Locate Button */}
      {mapMode === 'idle' && (
        <button className="map-locate-btn" style={{ bottom: user?.role === 'both' ? 100 : 80 }} onClick={() => setLocateTrigger(t => t + 1)}>
          <Navigation size={22} fill="currentColor" />
        </button>
      )}

      {searchingType && (
        <LocationSearchModal 
          onClose={() => setSearchingType(null)}
          onSelect={handleSelectSearch}
          placeholder={searchingType === 'origin' ? "Starting from?" : "Going to?"}
        />
      )}
    </div>
  );
};

// Internal Helper for Pin Confirmation
const ConfirmOriginButton = ({ onConfirm }: { onConfirm: (latlng: L.LatLng) => void }) => {
  const map = useMap();
  return (
    <div className="bottom-sheet uber-refinement-panel" style={{ zIndex: 1000 }}>
      <div className="refinement-info">
        <div className="refinement-label">Set Start Location</div>
        <div className="refinement-sub">Nudge map to fix exact pick-up curb</div>
      </div>
      <button className="btn btn-primary btn-block" style={{ marginTop: 12 }} id="confirm-origin-btn" onClick={() => onConfirm(map.getCenter())}>
         Confirm Start Point
      </button>
    </div>
  );
};

export default OfferRidePage;

