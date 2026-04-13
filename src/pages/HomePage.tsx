import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, X, Star, Users, Clock, CheckCircle, ArrowRight, Car } from 'lucide-react';
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
  driver_phone: string;
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




import { 
  type LatLngPair, 
  DHAKA_CENTER, 
  UBER_PICKUP_ICON as PICKUP_ICON, 
  UBER_DROPOFF_ICON as DROPOFF_ICON, 
  reverseGeocode, 
  fetchRoute,
  getDistanceKm
} from '../utils/mapUtils';

const CAR_ICON = (ride: RideWithDriver) =>
  L.divIcon({
    html: `<div style="
      width:40px;height:40px;display:flex;align-items:center;justify-content:center;
      position:relative;
    ">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="black" transform="rotate(${Math.random() * 360})">
        <path d="M18.8 12l.4 4h-14.4l.4-4h13.6zm1.2-1l-1-7h-14l-1 7h16zm-17 9c0 .6.4 1 1 1h2c.6 0 1-.4 1-1v-1h-4v1zm14 0c0 .6.4 1 1 1h2c.6 0 1-.4 1-1v-1h-4v1z"/>
      </svg>
      <div style="
        position:absolute;top:-10px;background:white;border:1px solid #000;
        border-radius:2px;padding:1px 4px;font-size:10px;font-weight:700;
        white-space:nowrap;box-shadow:0 2px 4px rgba(0,0,0,0.1);
      ">${ride.price_per_seat}৳</div>
    </div>`,
    className: '',
    iconAnchor: [20, 20],
  });

// Component to handle map center changes for pin refinement
const PinRefinementController = ({ onCenterChange }: { onCenterChange: (latlng: L.LatLng) => void }) => {
  const map = useMapEvents({
    moveend() {
      onCenterChange(map.getCenter());
    },
  });
  return null;
};

type MapMode = 'idle' | 'searching' | 'pickup_refinement' | 'results';

import LocationSearchModal from '../components/LocationSearchModal';

// Fly to user location
const LocateMeController = ({ trigger }: { trigger: number }) => {
  const map = useMap();
  useEffect(() => {
    if (trigger > 0) {
      map.locate({ setView: true, maxZoom: 17 });
    }
  }, [trigger, map]);
  return null;
};
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
    if (!user || user.id === ride.driver_id) {
      setError('You cannot book your own ride.');
      setPhase('form');
      return;
    }

    const priceVal = parseFloat(offerPrice);
    if (isNaN(priceVal) || priceVal <= 0) {
      setError('Please enter a valid offer price.');
      setPhase('form');
      return;
    }

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






const MapBoundsController = ({ pickup, dropoff }: { pickup: any, dropoff: any }) => {
  const map = useMap();
  useEffect(() => {
    if (pickup && dropoff) {
      const bounds = L.latLngBounds([pickup.lat, pickup.lng], [dropoff.lat, dropoff.lng]);
      map.fitBounds(bounds, { padding: [50, 120], animate: true });
    }
  }, [pickup, dropoff, map]);
  return null;
};

const HomePage = () => {
  const { user, setActiveTrip, setScreen } = useApp();
  const [rides, setRides] = useState<RideWithDriver[]>([]);
  const [pickup, setPickup] = useState<LatLngPair | null>(null);
  const [dropoff, setDropoff] = useState<LatLngPair | null>(null);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [routeDistKm, setRouteDistKm] = useState(0);
  const [selectedRide, setSelectedRide] = useState<RideWithDriver | null>(null);
  const [mapMode, setMapMode] = useState<MapMode>('idle');
  const [toast, setToast] = useState('');
  const [locateTrigger, setLocateTrigger] = useState(0);

  const fetchRides = async () => {
    const { data, error } = await supabase
      .from('rides')
      .select(`
        *,
        driver:profiles!rides_driver_id_fkey (
          name,
          phone,
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
      driver_phone: r.driver?.phone || '',
      driver_rating: r.driver?.rating || 5.0,
      driver_rides: r.driver?.total_rides || 0,
      is_verified: r.driver?.is_nid_verified || r.driver?.is_email_verified || false,
      car: r.vehicles?.vehicles?.[0] 
        ? `${r.vehicles.vehicles[0].color} ${r.vehicles.vehicles[0].make} ${r.vehicles.vehicles[0].model}`
        : 'Car'
    }));

    setRides(formattedRides);
  };

  useEffect(() => {
    console.log("HomePage: Component mounted, fetching rides...");
    fetchRides();
    
    // Auto-locate on mount
    setTimeout(() => {
      setLocateTrigger(1);
    }, 1000);
  }, []);

  const handleConfirmTrip = (ride: RideWithDriver, agreedPrice: number) => {
    setActiveTrip({
      driverId: ride.driver_id,
      driverName: ride.driver_name,
      driverPhone: ride.driver_phone,
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
    setMapMode('searching');
  };

  const handleSelectLocation = async (type: 'pickup' | 'dropoff', loc: LatLngPair) => {
    if (type === 'dropoff') {
      setDropoff(loc);
      // Auto-set pickup to current map center or a default landmark if not set
      if (!pickup) {
        setPickup({ lat: DHAKA_CENTER[0], lng: DHAKA_CENTER[1], address: 'Your Location' });
      }
      setMapMode('pickup_refinement');
    }
  };

  const confirmPickup = async (latlng: L.LatLng) => {

    const address = await reverseGeocode(latlng.lat, latlng.lng);
    setPickup({ lat: latlng.lat, lng: latlng.lng, address });
    
    if (dropoff) {
      const route = await fetchRoute({ lat: latlng.lat, lng: latlng.lng, address }, dropoff);
      setRouteCoords(route);
      const dist = getDistanceKm(latlng.lat, latlng.lng, dropoff.lat, dropoff.lng);
      setRouteDistKm(dist);
      setMapMode('results');
    }

  };

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
    return true;
  });

  const estMinutes = Math.round(routeDistKm * 3.2);



  return (
    <div className="map-page">
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

        {mapMode === 'pickup_refinement' && (
          <PinRefinementController onCenterChange={() => {
            // We'll use map.getCenter() in confirmPickup
          }} />
        )}
        
        <LocateMeController trigger={locateTrigger} />
        <MapBoundsController pickup={pickup} dropoff={dropoff} />

        {/* Real Driver Markers - Only in idle/initial state */}
        {mapMode === 'idle' && rides.slice(0, 5).map(ride => (
          <Marker
            key={ride.id}
            position={[ride.from_lat, ride.from_lng]}
            icon={CAR_ICON(ride)}
          />
        ))}

        {/* Pickup Marker - either fixed in results or floating in refinement */}
        {mapMode === 'results' && pickup && (
          <Marker position={[pickup.lat, pickup.lng]} icon={PICKUP_ICON} />
        )}

        {/* Dropoff Marker */}
        {dropoff && <Marker position={[dropoff.lat, dropoff.lng]} icon={DROPOFF_ICON} />}

        {/* Route Polyline */}
        {routeCoords.length > 0 && (
          <Polyline
            positions={routeCoords}
            pathOptions={{ color: 'var(--primary)', weight: 5, opacity: 0.9 }}
          />
        )}

        {/* Map Center Button - REQUIRED to be inside MapContainer for useMap hook */}
        {mapMode === 'pickup_refinement' && (
          <MapCenterButton onConfirm={confirmPickup} onClose={handleReset} />
        )}
      </MapContainer>

      {/* Floating Search Bar (Uber Style) */}
      {mapMode === 'idle' && (
        <div className="uber-search-card-container" onClick={handleStartSearch}>
          <div className="uber-search-card">
            <div className="search-dot" />
            <span className="search-placeholder">Where to?</span>
            <div className="search-time">
              <Clock size={18} />
            </div>
          </div>
        </div>
      )}

      {/* Pickup Refinement UI - Marker Pin (Visual) */}
      {mapMode === 'pickup_refinement' && (
        <div className="refinement-marker">
          <div className="uber-pickup-pin" />
        </div>
      )}

      {/* Search Overlay */}
      {mapMode === 'searching' && (
        <LocationSearchModal 
          onClose={() => setMapMode('idle')}
          onSelect={(loc) => handleSelectLocation('dropoff', loc)}
        />
      )}

      {/* Results Bottom Sheet */}
      {mapMode === 'results' && pickup && dropoff && (
        <div className="bottom-sheet uber-results">
          <div className="sheet-handle" />
          <div className="sheet-content">
            <div className="uber-route-summary">
              <div className="summary-main">
                <span className="time">{estMinutes} min</span>
                <span className="distance">{routeDistKm.toFixed(1)} km</span>
              </div>
              <button className="reset-btn" onClick={handleReset}><X size={16} /></button>
            </div>

            <div className="ride-options page-scroll">
              {filteredRides.map(ride => (
                <div 
                  key={ride.id} 
                  className={`uber-product-card ${selectedRide?.id === ride.id ? 'selected' : ''}`} 
                  onClick={() => setSelectedRide(ride)}
                >
                  <div className="product-image">
                    <Car size={32} color="var(--primary)" />
                  </div>
                  <div className="product-info">
                    <div className="product-name">RideShare <Users size={12} /> {ride.seats_left}</div>
                    <div className="product-eta">{new Date(ride.departure_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} arrival</div>
                  </div>
                  <div className="product-price">৳{ride.price_per_seat}</div>
                </div>
              ))}
            </div>
            <button 
              className="btn btn-primary btn-block uber-confirm-btn" 
              onClick={() => {
                if (!selectedRide && filteredRides.length > 0) {
                   setSelectedRide(filteredRides[0]);
                }
                // The NegotiationModal will show up when selectedRide is set
              }}
              disabled={filteredRides.length === 0}
            >
              {selectedRide ? `Confirm ${selectedRide.car.split(' ')[0]}` : 'Choose a Ride'}
            </button>
          </div>
        </div>
      )}

      {/* GPS Locate Me */}
      <button
        className="locate-btn"
        onClick={() => setLocateTrigger(t => t + 1)}
        aria-label="Locate Me"
        style={{ bottom: mapMode === 'results' ? '280px' : '100px' }}
      >
        <Navigation size={20} color="var(--primary)" />
      </button>

      {/* Negotiation Modal */}
      {selectedRide && (
        <NegotiationModal ride={selectedRide} onClose={() => setSelectedRide(null)} onConfirmTrip={handleConfirmTrip} />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
};

// Helper for the refinement button to access map context
const MapCenterButton = ({ onConfirm, onClose }: { onConfirm: (l: L.LatLng) => void, onClose: () => void }) => {
  const map = useMap();
  return (
    <div className="refinement-ui">
      <button className="back-fab" onClick={onClose}><X size={20} /></button>
      <div className="refinement-footer">
        <button className="btn btn-primary btn-block" onClick={() => onConfirm(map.getCenter())}>
          Confirm Pickup
        </button>
      </div>
    </div>
  );
};

export default HomePage;
