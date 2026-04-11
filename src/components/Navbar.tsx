import { CarFront } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="glass" style={{
      position: 'sticky', top: 0, zIndex: 50, padding: '1rem 0'
    }}>
      <div className="layout-wrapper flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
          <div style={{ backgroundColor: 'var(--primary)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
            <CarFront color="white" size={24} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            Ride<span style={{ color: 'var(--primary)' }}>Share</span> BD
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/find-ride" style={{ fontWeight: 500, color: 'var(--text-muted)' }}>Find a Ride</Link>
          <Link to="/offer-ride" style={{ fontWeight: 500, color: 'var(--text-muted)' }}>Offer a Ride</Link>
          <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
            Sign In
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
