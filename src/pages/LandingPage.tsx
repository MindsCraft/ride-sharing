import { CarFront, Search, HandCoins, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="layout-wrapper" style={{ padding: '4rem 1.5rem' }}>
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center mt-8 mb-12 animate-fade-in">
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', letterSpacing: '-1px' }}>
          Share the Journey, <br/>
          <span className="text-gradient">Beat the Shortage.</span>
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)', maxWidth: '600px', marginBottom: '2.5rem' }}>
          Connect with trusted commuters in Bangladesh. Offer an empty seat or find a ride that fits your schedule. Negotiate directly, and commute together.
        </p>
        <div className="flex gap-4" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/find-ride" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
            <Search size={20} /> Find a Ride
          </Link>
          <Link to="/offer-ride" className="btn btn-outline" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
            <CarFront size={20} /> Offer a Ride
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-3 gap-6 mt-12 mb-8">
        <div className="card text-center flex flex-col items-center">
          <div style={{ backgroundColor: 'var(--accent-light)', padding: '1rem', borderRadius: 'var(--radius-full)', color: 'var(--accent)', marginBottom: '1rem' }}>
            <HandCoins size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>P2P Negotiation</h3>
          <p style={{ color: 'var(--text-muted)' }}>Discuss and negotiate ride costs directly. No platform fees, just fair sharing.</p>
        </div>
        
        <div className="card text-center flex flex-col items-center">
          <div style={{ backgroundColor: '#D1FAE5', padding: '1rem', borderRadius: 'var(--radius-full)', color: 'var(--primary)', marginBottom: '1rem' }}>
            <ShieldCheck size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Verified Community</h3>
          <p style={{ color: 'var(--text-muted)' }}>Travel with peace of mind. We verify our users to ensure a safe commuting environment.</p>
        </div>

        <div className="card text-center flex flex-col items-center">
          <div style={{ backgroundColor: '#FEE2E2', padding: '1rem', borderRadius: 'var(--radius-full)', color: '#EF4444', marginBottom: '1rem' }}>
            <CarFront size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Eco-Friendly</h3>
          <p style={{ color: 'var(--text-muted)' }}>Help reduce the country's oil crisis and traffic congestion by filling empty seats.</p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
