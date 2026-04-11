import { useState } from 'react';
import { Search, MapPin, Clock, HandCoins, User, Car } from 'lucide-react';

const mockRides = [
  { id: 1, driver: 'Rahim U.', from: 'Uttara Sector 11', to: 'Gulshan 1 Circle', time: '08:30 AM', seats: 2, price: '150 BDT / Negotiable', car: 'Toyota Axio' },
  { id: 2, driver: 'Karim M.', from: 'Mirpur 10', to: 'Banani', time: '09:00 AM', seats: 1, price: '100 BDT', car: 'Honda Civic' },
  { id: 3, driver: 'Selim H.', from: 'Dhanmondi 27', to: 'Mohakhali DOHS', time: '08:00 AM', seats: 3, price: 'Free / Share snacks', car: 'Nissan Sunny' },
];

const FindRidePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRide, setSelectedRide] = useState<any>(null);

  const filteredRides = mockRides.filter(ride => 
    ride.to.toLowerCase().includes(searchQuery.toLowerCase()) || 
    ride.from.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="layout-wrapper" style={{ padding: '3rem 1.5rem' }}>
      <div className="flex flex-col gap-6">
        {/* Search Header */}
        <div className="card glass animate-fade-in" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Search size={24} color="var(--primary)" />
          <input 
            type="text" 
            placeholder="Where do you want to go? (e.g. Gulshan, Banani)" 
            className="form-input" 
            style={{ flex: 1, border: 'none', boxShadow: 'none', background: 'transparent', fontSize: '1.125rem' }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button className="btn btn-primary">Search</button>
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 gap-6 mt-4">
          {filteredRides.map(ride => (
            <div key={ride.id} className="card animate-fade-in flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <div style={{ backgroundColor: 'var(--accent-light)', padding: '0.5rem', borderRadius: '50%' }}>
                      <User size={20} color="var(--accent)" />
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{ride.driver}</span>
                  </div>
                  <span style={{ backgroundColor: '#D1FAE5', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 600 }}>
                    {ride.seats} seats available
                  </span>
                </div>

                <div className="flex flex-col gap-3 mb-4">
                  <div className="flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                    <MapPin size={18} color="var(--primary)" /> <span style={{ fontWeight: 500 }}>From:</span> {ride.from}
                  </div>
                  <div className="flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                    <MapPin size={18} color="var(--accent)" /> <span style={{ fontWeight: 500 }}>To:</span> {ride.to}
                  </div>
                  <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                    <Clock size={18} /> Time: {ride.time}
                  </div>
                  <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                    <Car size={18} /> Car: {ride.car}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2" style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                  <HandCoins size={20} color="#F59E0B" /> {ride.price}
                </div>
                <button className="btn btn-primary" onClick={() => setSelectedRide(ride)}>
                  Request Ride
                </button>
              </div>
            </div>
          ))}
          {filteredRides.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No rides found matching your search.
            </div>
          )}
        </div>
      </div>

      {/* Negotiation Modal Simulation */}
      {selectedRide && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Request Ride from {selectedRide.driver}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Propose a cost sharing amount or send a message to the driver.
            </p>
            <div className="form-group flex-col">
              <label className="form-label">Your Message / Offer</label>
              <textarea className="form-input" rows={3} placeholder={`Hi, is ${selectedRide.price} okay? I can meet you at...`}></textarea>
            </div>
            <div className="flex justify-between items-center mt-4">
              <button className="btn btn-secondary" onClick={() => setSelectedRide(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                alert('Request sent to driver! You will be notified once they accept.');
                setSelectedRide(null);
              }}>Send Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindRidePage;
