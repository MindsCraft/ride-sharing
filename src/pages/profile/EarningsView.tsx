import { useState, useEffect } from 'react';
import { ChevronLeft, TrendingUp, DollarSign, Star, Car, Calendar, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';

interface Props { onBack: () => void; }

interface DbRide {
  id: string;
  from_address: string;
  to_address: string;
  departure_time: string;
  price_per_seat: number;
  total_seats: number;
  seats_left: number;
  status: string;
}

const EarningsView = ({ onBack }: Props) => {
  const { user } = useApp();
  const [rides, setRides] = useState<DbRide[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('rides')
        .select('*')
        .eq('driver_id', user.id)
        .order('departure_time', { ascending: false });

      if (!error && data) {
        setRides(data.map(r => ({
          ...r,
          price_per_seat: Number(r.price_per_seat)
        })));
      }
      setIsLoading(false);
    };
    fetchEarnings();
  }, [user]);

  const tripsCount = rides.length;
  // Calculate earnings: seats sold * price. 
  // For simplicity, let's assume seats_sold = (total - left)
  const totalEarnings = rides.reduce((s, r) => s + ((r.total_seats - r.seats_left) * r.price_per_seat), 0);
  const avgRating = user?.rating || 5.0;

  return (
    <div className="page-scroll">
      <div className="page-header">
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', marginBottom: 8 }}>
          <ChevronLeft size={20} /> Back
        </button>
        <h1 className="page-title">My Earnings</h1>
        <p className="page-subtitle">Your cost-sharing summary as a driver</p>
      </div>

      {/* Summary cards */}
      <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <div style={{ background: 'var(--primary)', borderRadius: 'var(--radius-lg)', padding: '18px 14px', color: 'white' }}>
          <DollarSign size={22} style={{ marginBottom: 6 }} />
          <div style={{ fontSize: 26, fontWeight: 900 }}>৳{totalEarnings}</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Total Earnings</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px', display: 'flex', gap: 8, alignItems: 'center' }}>
            <Car size={18} color="var(--primary)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{tripsCount}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Trips given</div>
            </div>
          </div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px', display: 'flex', gap: 8, alignItems: 'center' }}>
            <Star size={18} color="var(--warning)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{avgRating}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Avg rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Fuel savings banner */}
      <div style={{ margin: '0 16px 16px', background: 'var(--primary-light)', borderRadius: 'var(--radius-lg)', padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <TrendingUp size={20} color="var(--primary)" />
          <div>
            <div style={{ fontWeight: 700, color: 'var(--primary-dark)', fontSize: 15 }}>Fuel cost offset: ~৳{Math.round(totalEarnings * 0.6)}</div>
            <div style={{ fontSize: 12, color: 'var(--primary)' }}>Based on your total rides (estimated)</div>
          </div>
        </div>
      </div>

      {/* Trip breakdown */}
      <div className="section">
        <div className="section-title">Recent Trips</div>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}><Loader2 className="animate-spin" color="var(--primary)" /></div>
        ) : rides.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>No trips found. Start offering rides to see earnings!</div>
        ) : rides.map((trip) => (
          <div key={trip.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={16} color="var(--text-muted)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{trip.from_address.split(',')[0]} → {trip.to_address.split(',')[0]}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {new Date(trip.departure_time).toLocaleDateString('en-BD', { month: 'short', day: 'numeric' })} · 
                  {trip.total_seats - trip.seats_left} seats sold
                </div>
              </div>
            </div>
            <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 16 }}>
              +৳{(trip.total_seats - trip.seats_left) * trip.price_per_seat}
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '8px 20px 20px', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
        💡 These are cost-sharing amounts, not "income". RideShare BD does not take any commission.
      </div>
    </div>
  );
};

export default EarningsView;
