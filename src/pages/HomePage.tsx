import { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, Navigation, X, Star, Users, Clock, CheckCircle, ArrowRight, SlidersHorizontal, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';

// Local type for display
interface RideWithDriver {
  id: string;
  from_address: string;
  to_address: string;
  from_lat: number;
  from_lng: number;
  to_lat: number;
  to_lng: number;
  departure_time: string;
  price_per_seat: number;
  total_seats: number;
  seats_left: number;
  driver_id: string;
  driver_name: string;
  driver_rating: number;
  driver_rides: number;
  is_verified: boolean;
  car: string;
}


// Fix Leaflet default icon
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({ iconUrl, shadowUrl: iconShadow, iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = defaultIcon;




const PICKUP_ICON = L.divIcon({
  html: `<div style="
    width:42px;height:42px;background:#0D9488;border:3px solid white;
    border-radius:50%;display:flex;align-items:center;justify-content:center;
    box-shadow:0 4px 16px rgba(13,148,136,0.5);
  "><svg width="18" height="18" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="5"/></svg></div>`,
  className: '',
  iconAnchor: [21, 21],
});

const DROPOFF_ICON = L.divIcon({
  html: `<div style="
    width:42px;height:42px;background:#EF4444;border:3px solid white;
    border-radius:50%;display:flex;align-items:center;justify-content:center;
    box-shadow:0 4px 16px rgba(239,68,68,0.5);
  "><svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3" fill="none"/></svg></div>`,
  className: '',
  iconAnchor: [21, 42],
});

const CAR_ICON = (ride: RideWithDriver) =>
  L.divIcon({
    html: `<div style="
      background:white;border:2px solid #0D9488;border-radius:12px;
      padding:4px 8px;display:flex;align-items:center;gap:4px;
      box-shadow:0 3px 10px rgba(0,0,0,0.15);white-space:nowrap;cursor:pointer;
    ">
      <span style="font-size:14px;">🚗</span>
      <span style="font-size:11px;font-weight:600;color:#0F172A;">${ride.price_per_seat}৳</span>
    </div>`,
    className: '',
    iconAnchor: [30, 16],
  });

// Component to handle map clicks
type MapMode = 'idle' | 'pickup' | 'dropoff' | 'results';

interface MapClickHandlerProps {
  mode: MapMode;
  onPickup: (latlng: L.LatLng) => void;
  onDropoff: (latlng: L.LatLng) => void;
}

const MapClickHandler = ({ mode, onPickup, onDropoff }: MapClickHandlerProps) => {
  useMapEvents({
    click(e) {
      if (mode === 'pickup') onPickup(e.latlng);
      if (mode === 'dropoff') onDropoff(e.latlng);
    },
  });
  return null;
};

// Fly to user location
const LocateMeController = ({ trigger }: { trigger: number }) => {
  const map = useMap();
  useEffect(() => {
    if (trigger > 0) {
      map.locate({ setView: true, maxZoom: 15 });
    }
  }, [trigger, map]);
  return null;
};

type LatLngPair = { lat: number; lng: number; address: string };

const DHAKA_CENTER: [number, number] = [23.8103, 90.4125];

// Reverse geocode using Nominatim
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    // Simplify the address to area-level
    const addr = data.address;
    return (
      addr.neighbourhood ||
      addr.suburb ||
      addr.city_district ||
      addr.road ||
      addr.county ||
      data.display_name?.split(',')[0] ||
      `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    );
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

// Fetch route from OSRM
async function fetchRoute(from: LatLngPair, to: LatLngPair): Promise<[number, number][]> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.code === 'Ok') {
      return data.routes[0].geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]);
    }
  } catch { /* fallback to straight line */ }
  return [[from.lat, from.lng], [to.lat, to.lng]];
}

interface NegotiationModalProps {
  ride: RideWithDriver;
  onClose: () => void;
  onConfirmTrip: (ride: RideWithDriver, agreedPrice: number) => void;
}

const NegotiationModal = ({ ride, onClose, onConfirmTrip }: NegotiationModalProps) => {
  const { user, refreshAppData } = useApp();
  const [offerPrice, setOfferPrice] = useState(ride.price_per_seat.toString());
  const [message, setMessage] = useState('');
  const [phase, setPhase] = useState<'form' | 'sending' | 'waiting' | 'accepted'>('form');
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!user) return;
    setPhase('sending');
    setError('');

    const { error: insertError } = await supabase
      .from('ride_requests')
      .insert({
        ride_id: ride.id,
        rider_id: user.id,
        offered_price: parseFloat(offerPrice),
        message,
        status: 'pending'
      });

    if (insertError) {
      setError('Could not send offer. Please try again.');
      setPhase('form');
      return;
    }

    await refreshAppData();
    setPhase('waiting');
    
    setTimeout(() => {
       if (parseFloat(offerPrice) >= ride.price_per_seat) {
         setPhase('accepted');
       }
    }, 3000);
  };

  const handleStartTrip = () => {
    onConfirmTrip(ride, parseInt(offerPrice));
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={phase === 'form' ? onClose : undefined}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div className="driver-avatar" style={{ width: 52, height: 52, fontSize: 20 }}>
              {ride.driver_name.charAt(0)}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{ride.driver_name}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                {ride.is_verified && <span className="trust-badge verified">✅ Verified Driver</span>}
              </div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--warning)', justifyContent: 'flex-end' }}>
                <Star size={14} fill="currentColor" />
                <span style={{ fontWeight: 700 }}>{ride.driver_rating}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ride.driver_rides} rides</div>
            </div>
          </div>

          {(phase === 'form' || phase === 'sending') && (
            <>
              <div className="offer-route-display" style={{ marginBottom: 16 }}>
                <div className="offer-route-point"><div className="offer-route-dot start" /><span>{ride.from_address}</span></div>
                <div style={{ width: 2, height: 12, background: 'var(--border)', marginLeft: 5 }} />
                <div className="offer-route-point"><div className="offer-route-dot end" /><span>{ride.to_address}</span></div>
              </div>
              <div className="form-group">
                <label className="form-label">Your Offer Price (BDT)</label>
                <input type="number" className="form-input" value={offerPrice} onChange={e => setOfferPrice(e.target.value)} />
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Driver's base: ৳{ride.price_per_seat} · Suggest a fair amount</div>
              </div>
              <div className="form-group">
                <label className="form-label">Message (Optional)</label>
                <textarea className="form-input" value={message} onChange={e => setMessage(e.target.value)} rows={2} placeholder="e.g. I'll meet you at the main gate..." />
              </div>
              {error && <div style={{ color: '#EF4444', fontSize: 12, marginBottom: 12 }}>{error}</div>}
              <button className="btn btn-primary btn-block" onClick={handleSend} disabled={phase === 'sending'}>
                {phase === 'sending' ? 'Sending...' : `Send Offer · ${offerPrice} BDT`} <ArrowRight size={16} />
              </button>
            </>
          )}

          {phase === 'waiting' && (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div className="loading-dots" style={{ marginBottom: 16 }}>
                <div className="loading-dot" /><div className="loading-dot" /><div className="loading-dot" />
              </div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>Waiting for {ride.driver_name}...</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>Your offer of {offerPrice} BDT was sent</div>
            </div>
          )}

          {phase === 'accepted' && (
            <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
              <CheckCircle size={48} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Ride Confirmed! 🎉</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
                {ride.driver_name} accepted your offer of <strong>৳{offerPrice}</strong>.
              </div>
              <button className="btn btn-primary btn-block" onClick={handleStartTrip}>
                🗺️ Track Live Ride
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


// Haversine distance in km
function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

interface FilterState {
  verifiedOnly: boolean;
  minRating: number;
  minSeats: number;
  timeSlot: 'any' | 'morning' | 'afternoon' | 'evening';
}

const DEFAULT_FILTERS: FilterState = { verifiedOnly: false, minRating: 0, minSeats: 1, timeSlot: 'any' };

const FilterDrawer = ({ filters, onChange, onClose }: { filters: FilterState; onChange: (f: FilterState) => void; onClose: () => void }) => {
  const [local, setLocal] = useState<FilterState>(filters);
  const set = (patch: Partial<FilterState>) => setLocal(f => ({ ...f, ...patch }));
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontWeight: 800, fontSize: 18 }}>Filter Rides</h3>
            <button onClick={() => { onChange(DEFAULT_FILTERS); onClose(); }} style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>Reset</button>
          </div>

          {/* Verified Only */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
            <div>
              <div style={{ fontWeight: 600 }}>Verified Drivers Only</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>NID or Corporate Email verified</div>
            </div>
            <button onClick={() => set({ verifiedOnly: !local.verifiedOnly })} style={{ width: 44, height: 24, borderRadius: 12, background: local.verifiedOnly ? 'var(--primary)' : 'var(--border)', position: 'relative', transition: 'all 0.25s' }}>
              <div style={{ position: 'absolute', top: 2, left: local.verifiedOnly ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.25s' }} />
            </button>
          </div>

          {/* Min Rating */}
          <div style={{ padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
            <div style={{ fontWeight: 600, marginBottom: 10 }}>Minimum Rating</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[0, 4.0, 4.5, 5.0].map(r => (
                <button key={r} onClick={() => set({ minRating: r })} style={{ padding: '7px 12px', borderRadius: 'var(--radius-full)', fontSize: 13, border: `1.5px solid ${local.minRating === r ? 'var(--primary)' : 'var(--border)'}`, background: local.minRating === r ? 'var(--primary-light)' : 'var(--surface)', color: local.minRating === r ? 'var(--primary-dark)' : 'var(--text-sub)', cursor: 'pointer', transition: 'var(--transition)', fontWeight: 500 }}>
                  {r === 0 ? 'Any' : `${r}+ ⭐`}
                </button>
              ))}
            </div>
          </div>

          {/* Available Seats */}
          <div style={{ padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
            <div style={{ fontWeight: 600, marginBottom: 10 }}>Available Seats (min)</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3].map(n => (
                <button key={n} onClick={() => set({ minSeats: n })} style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', border: `2px solid ${local.minSeats === n ? 'var(--primary)' : 'var(--border)'}`, background: local.minSeats === n ? 'var(--primary-light)' : 'var(--surface)', color: local.minSeats === n ? 'var(--primary-dark)' : 'var(--text-sub)', fontWeight: 600, fontSize: 16, cursor: 'pointer', transition: 'var(--spring)' }}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Time Slot */}
          <div style={{ padding: '12px 0', marginBottom: 20 }}>
            <div style={{ fontWeight: 600, marginBottom: 10 }}>Departure Time</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[{id:'any',label:'Any'},{id:'morning',label:'🌅 Morning (6–9 AM)'},{id:'afternoon',label:'🌞 Afternoon'},{id:'evening',label:'🌆 Evening (5–8 PM)'}].map(t => (
                <button key={t.id} onClick={() => set({ timeSlot: t.id as FilterState['timeSlot'] })} style={{ padding: '8px 14px', borderRadius: 'var(--radius-full)', fontSize: 12, border: `1.5px solid ${local.timeSlot === t.id ? 'var(--primary)' : 'var(--border)'}`, background: local.timeSlot === t.id ? 'var(--primary-light)' : 'var(--surface)', color: local.timeSlot === t.id ? 'var(--primary-dark)' : 'var(--text-sub)', cursor: 'pointer', fontWeight: 500, transition: 'var(--transition)' }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <button className="btn btn-primary btn-block" onClick={() => { onChange(local); onClose(); }}>Apply Filters</button>
        </div>
      </div>
    </div>
  );
};

const HomePage = () => {
  const { user, setActiveTrip, setScreen } = useApp();
  const [mapMode, setMapMode] = useState<MapMode>('idle');
  const [pickup, setPickup] = useState<LatLngPair | null>(null);
  const [dropoff, setDropoff] = useState<LatLngPair | null>(null);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [routeDistKm, setRouteDistKm] = useState(0);
  const [rides, setRides] = useState<RideWithDriver[]>([]);
  const [selectedRide, setSelectedRide] = useState<RideWithDriver | null>(null);
  const [locateTrigger, setLocateTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const fetchRides = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('rides')
      .select(`
        *,
        driver:profiles!rides_driver_id_fkey (
          name,
          rating,
          total_rides,
          is_nid_verified,
          is_email_verified
        ),
        vehicles:profiles!rides_driver_id_fkey (
          vehicles (
            make,
            model,
            color
          )
        )
      `)
      .eq('status', 'active');

    if (error) {
      showToast('Could not fetch rides');
      setIsLoading(false);
      return;
    }

    const formattedRides: RideWithDriver[] = (data || []).map((r: any) => ({
      id: r.id,
      from_address: r.from_address,
      to_address: r.to_address,
      from_lat: r.from_lat,
      from_lng: r.from_lng,
      to_lat: r.to_lat,
      to_lng: r.to_lng,
      departure_time: r.departure_time,
      price_per_seat: Number(r.price_per_seat),
      total_seats: r.total_seats,
      seats_left: r.seats_left,
      driver_id: r.driver_id,
      driver_name: r.driver?.name || 'User',
      driver_rating: r.driver?.rating || 5.0,
      driver_rides: r.driver?.total_rides || 0,
      is_verified: r.driver?.is_nid_verified || r.driver?.is_email_verified || false,
      car: r.vehicles?.vehicles?.[0] 
        ? `${r.vehicles.vehicles[0].color} ${r.vehicles.vehicles[0].make} ${r.vehicles.vehicles[0].model}`
        : 'Car'
    }));

    setRides(formattedRides);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRides();
  }, []);

  const handleConfirmTrip = (ride: RideWithDriver, agreedPrice: number) => {
    setActiveTrip({
      driverId: ride.driver_id,
      driverName: ride.driver_name,
      driverRating: ride.driver_rating,
      car: ride.car,
      from: ride.from_address,
      to: ride.to_address,
      agreedPrice,
      startedAt: new Date(),
      driverLat: ride.from_lat,
      driverLng: ride.from_lng,
    });
    setScreen('live_trip');
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleStartSearch = () => {
    setMapMode('pickup');
    showToast('📍 Tap map to set your pickup point');
  };

  const handlePickup = useCallback(async (latlng: L.LatLng) => {
    setIsLoading(true);
    const address = await reverseGeocode(latlng.lat, latlng.lng);
    setPickup({ lat: latlng.lat, lng: latlng.lng, address });
    setMapMode('dropoff');
    setIsLoading(false);
    showToast('🏁 Now tap to set your dropoff point');
  }, []);

  const handleDropoff = useCallback(async (latlng: L.LatLng) => {
    if (!pickup) return;
    setIsLoading(true);
    const address = await reverseGeocode(latlng.lat, latlng.lng);
    const drop = { lat: latlng.lat, lng: latlng.lng, address };
    setDropoff(drop);
    setMapMode('results');
    const route = await fetchRoute(pickup, drop);
    setRouteCoords(route);
    const dist = getDistanceKm(pickup.lat, pickup.lng, drop.lat, drop.lng);
    setRouteDistKm(dist);
    setIsLoading(false);
  }, [pickup]);

  const handleReset = () => {
    setPickup(null);
    setDropoff(null);
    setRouteCoords([]);
    setRouteDistKm(0);
    setMapMode('idle');
  };

  // Apply filters to rides list
  const filteredRides = rides.filter(r => {
    if (user && r.driver_id === user.id) return false; // Don't show own rides
    if (filters.verifiedOnly && !r.is_verified) return false;
    if (r.driver_rating < filters.minRating) return false;
    if (r.seats_left < filters.minSeats) return false;
    return true;
  });

  const suggestedMinCost = Math.round(routeDistKm * 12);
  const suggestedMaxCost = Math.round(routeDistKm * 18);
  const estMinutes = Math.round(routeDistKm * 3.2);

  const searchBarText = () => {
    if (mapMode === 'idle') return 'Where are you going?';
    if (mapMode === 'pickup') return 'Tap map for pickup...';
    if (pickup && mapMode === 'dropoff') return `📍 ${pickup.address} → Tap for dropoff`;
    if (pickup && dropoff) return `${pickup.address} → ${dropoff.address}`;
    return 'Where are you going?';
  };

  const mapCursor = mapMode === 'pickup' || mapMode === 'dropoff' ? 'crosshair' : '';

  return (
    <div className="map-page" style={{ cursor: mapCursor }}>
      {/* Map */}
      <MapContainer
        center={DHAKA_CENTER}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
        />

        <MapClickHandler
          mode={mapMode}
          onPickup={handlePickup}
          onDropoff={handleDropoff}
        />
        <LocateMeController trigger={locateTrigger} />

        {/* Real Driver Markers */}
        {(mapMode === 'idle' || mapMode === 'results') && rides.map(ride => (
          <Marker
            key={ride.id}
            position={[ride.from_lat, ride.from_lng]}
            icon={CAR_ICON(ride)}
          >
            <Popup>
              <div style={{ fontFamily: 'Inter, sans-serif', padding: '4px', minWidth: 160 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{ride.driver_name}</div>
                <div style={{ fontSize: 12, color: '#475569', marginBottom: 6 }}>
                  ⭐ {ride.driver_rating} · {ride.car}
                </div>
                <div style={{ fontSize: 12, color: '#0D9488', fontWeight: 600, marginBottom: 8 }}>
                  {ride.from_address} → {ride.to_address}
                </div>
                <div style={{ fontSize: 12, color: '#475569' }}>
                  💰 ৳{ride.price_per_seat} · 🕐 {new Date(ride.departure_time).toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Pickup Marker */}
        {pickup && <Marker position={[pickup.lat, pickup.lng]} icon={PICKUP_ICON} />}

        {/* Dropoff Marker */}
        {dropoff && <Marker position={[dropoff.lat, dropoff.lng]} icon={DROPOFF_ICON} />}

        {/* Route Polyline */}
        {routeCoords.length > 0 && (
          <Polyline
            positions={routeCoords}
            pathOptions={{ color: '#0D9488', weight: 5, opacity: 0.85, dashArray: undefined }}
          />
        )}
      </MapContainer>

      {/* Search Bar */}
      <div
        className="map-search-bar"
        onClick={mapMode === 'idle' ? handleStartSearch : undefined}
        style={{ cursor: mapMode === 'idle' ? 'pointer' : 'default' }}
      >
        <Search size={18} color="var(--primary)" />
        <span>{searchBarText()}</span>
        {isLoading && (
          <div className="loading-dots">
            <div className="loading-dot" /><div className="loading-dot" /><div className="loading-dot" />
          </div>
        )}
        {(pickup || dropoff) && (
          <button onClick={e => { e.stopPropagation(); handleReset(); }} style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* Route Info Card — shows after route is drawn */}
      {mapMode === 'results' && routeDistKm > 0 && (
        <div style={{
          position: 'absolute', top: 76, left: 16, right: 16, zIndex: 400,
          background: 'var(--surface-glass)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)',
          padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-sub)' }}>
            <MapPin size={14} color="var(--primary)" />
            <strong style={{ color: 'var(--text-main)' }}>{routeDistKm.toFixed(1)} km</strong>
          </div>
          <div style={{ width: 1, height: 18, background: 'var(--border)' }} />
          <div style={{ fontSize: 13, color: 'var(--text-sub)' }}>
            ⏱ ~<strong style={{ color: 'var(--text-main)' }}>{estMinutes} min</strong>
          </div>
          <div style={{ width: 1, height: 18, background: 'var(--border)' }} />
          <div style={{ fontSize: 13, color: 'var(--text-sub)' }}>
            💰 <strong style={{ color: 'var(--primary)' }}>৳{suggestedMinCost}–{suggestedMaxCost}</strong>
          </div>
        </div>
      )}

      {/* GPS Locate Me */}
      <button
        className="locate-btn"
        onClick={() => setLocateTrigger(t => t + 1)}
        aria-label="Locate Me"
        style={{ bottom: mapMode === 'results' ? '340px' : '120px' }}
      >
        <Navigation size={20} color="var(--primary)" />
      </button>

      {/* Results Bottom Sheet */}
      {mapMode === 'results' && pickup && dropoff && (
        <div className="bottom-sheet" style={{ maxHeight: '55vh' }}>
          <div className="sheet-handle" />
          <div className="sheet-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>Available Rides</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{pickup.address} → {dropoff.address}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button onClick={() => setShowFilter(true)} style={{ width: 36, height: 36, borderRadius: 'var(--radius-full)', border: '1.5px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <SlidersHorizontal size={16} color="var(--text-sub)" />
                </button>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--surface-2)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
                  {filteredRides.length} found
                </span>
              </div>
            </div>

            {filteredRides.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon"><span style={{ fontSize: 28 }}>🔍</span></div>
                <h3>No Matches</h3>
                <p>Try adjusting your filters to find more rides.</p>
              </div>
            )}
            {filteredRides.map(ride => (
              <div key={ride.id} className="ride-card" onClick={() => setSelectedRide(ride)}>
                <div className="ride-card-header">
                  <div className="driver-avatar">{ride.driver_name.charAt(0)}</div>
                  <div className="driver-info">
                    <div className="driver-name">
                      {ride.driver_name}
                      {ride.is_verified && <span style={{ color: 'var(--primary)', marginLeft: 5, fontSize: 12 }}>✅</span>}
                    </div>
                    <div className="driver-rating">
                      <Star size={11} fill="var(--warning)" color="var(--warning)" />
                      {ride.driver_rating} · {ride.driver_rides} rides · {ride.car}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 12 }}>
                    <Clock size={12} /> {new Date(ride.departure_time).toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="ride-route">
                  <div className="route-point"><div className="route-dot pickup" /><span>{ride.from_address}</span></div>
                  <div style={{ borderLeft: '2px dashed var(--border)', height: 8, marginLeft: 4 }} />
                  <div className="route-point"><div className="route-dot dropoff" /><span>{ride.to_address}</span></div>
                </div>

                <div className="ride-card-footer">
                  <span className="price-badge">💰 ৳{ride.price_per_seat}</span>
                  <div className="seats-badge"><Users size={12} /> {ride.seats_left} seats left</div>
                  <button className="request-btn" onClick={e => { e.stopPropagation(); setSelectedRide(ride); }}>Negotiate</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}

      {/* Filter Drawer */}
      {showFilter && (
        <FilterDrawer filters={filters} onChange={setFilters} onClose={() => setShowFilter(false)} />
      )}

      {/* Negotiation Modal */}
      {selectedRide && (
        <NegotiationModal ride={selectedRide} onClose={() => setSelectedRide(null)} onConfirmTrip={handleConfirmTrip} />
      )}
    </div>
  );
};

export default HomePage;
