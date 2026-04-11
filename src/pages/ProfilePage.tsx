import { useState } from 'react';
import { Shield, Star, Car, ChevronRight, HelpCircle, LogOut, Bell, DollarSign, Mail } from 'lucide-react';
import { useApp } from '../context/AppContext';

// Sub-views
import AddVehicleView from './profile/AddVehicleView';
import NIDVerifyView from './profile/NIDVerifyView';
import WorkEmailView from './profile/WorkEmailView';
import EmergencyContactView from './profile/EmergencyContactView';
import EarningsView from './profile/EarningsView';
import NotificationsView from './profile/NotificationsView';

type ProfileView = 'main' | 'add_vehicle' | 'nid_verify' | 'email_verify' | 'emergency' | 'earnings' | 'notifications';

const ProfilePage = () => {
  const { user, signOut, refreshProfile } = useApp();
  const [view, setView] = useState<ProfileView>('main');

  // Sub-view routing
  if (view === 'add_vehicle') return <AddVehicleView onBack={() => { setView('main'); refreshProfile(); }} />;
  if (view === 'nid_verify') return <NIDVerifyView onBack={() => { setView('main'); refreshProfile(); }} />;
  if (view === 'email_verify') return <WorkEmailView onBack={() => { setView('main'); refreshProfile(); }} />;
  if (view === 'emergency') return <EmergencyContactView onBack={() => { setView('main'); refreshProfile(); }} />;
  if (view === 'earnings') return <EarningsView onBack={() => setView('main')} />;
  if (view === 'notifications') return <NotificationsView onBack={() => setView('main')} />;

  const isDriver = user?.role === 'driver' || user?.role === 'both';

  return (
    <div className="page-scroll">
      {/* Profile Header */}
      <div style={{ background: 'linear-gradient(160deg, var(--primary) 0%, #065F46 100%)', padding: '40px 20px 64px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: 'white', flexShrink: 0 }}>
            {user?.avatarInitial || '?'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 20, color: 'white' }}>{user?.name || 'User'}</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{user?.phone || '+880 —'}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>
                {user?.role === 'both' ? '🔄 Rider & Driver' : user?.role === 'driver' ? '🚗 Driver' : '🙋 Rider'}
              </span>
              {user && user.totalRides > 0 && (
                <span style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)', padding: '3px 10px', borderRadius: 99, fontSize: 11 }}>
                  {user.totalRides} rides
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges Card — overlaps header */}
      <div style={{ margin: '-30px 16px 0', position: 'relative', zIndex: 10 }}>
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '16px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 }}>Trust & Verification</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {user?.isNidVerified
              ? <span className="trust-badge verified">✅ NID Verified</span>
              : <button onClick={() => setView('nid_verify')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 'var(--radius-md)', border: '1.5px dashed var(--border)', background: 'var(--surface-2)', cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)' }}>
                  <Shield size={14} /> Verify NID
                </button>
            }
            {user?.isEmailVerified
              ? <span className="trust-badge email">🏢 {user.workEmail?.split('@')[1] || 'Corp Verified'}</span>
              : <button onClick={() => setView('email_verify')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 'var(--radius-md)', border: '1.5px dashed var(--border)', background: 'var(--surface-2)', cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)' }}>
                  <Mail size={14} /> Work Email
                </button>
            }
          </div>
          {!user?.isNidVerified && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>Verified users get 3× more ride requests.</p>}
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, padding: '16px 16px 0' }}>
        {[
          { label: 'Rating', value: user?.rating ? user.rating.toFixed(1) : '—', icon: <Star size={18} color="var(--warning)" /> },
          { label: 'Total Rides', value: String(user?.totalRides ?? 0), icon: <Car size={18} color="var(--primary)" /> },
          { label: 'Trust Score', value: user?.isNidVerified ? 'High' : 'New', icon: <Shield size={18} color="var(--accent)" /> },
        ].map(stat => (
          <div key={stat.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 10px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>{stat.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Vehicles Section */}
      <div className="section">
        <div className="section-title">My Vehicles</div>
        {user?.vehicles && user.vehicles.length > 0
          ? user.vehicles.map(v => (
              <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Car size={18} color="var(--primary)" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{v.color} {v.make} {v.model}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>🚘 {v.plate}</div>
                </div>
              </div>
            ))
          : null
        }
        <button onClick={() => setView('add_vehicle')} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '14px 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}>
          <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--surface-2)', border: '1.5px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Car size={18} color="var(--text-muted)" />
          </div>
          <span style={{ color: 'var(--text-sub)', fontWeight: 500, fontSize: 15 }}>Add Vehicle</span>
          <ChevronRight size={16} color="var(--text-muted)" style={{ marginLeft: 'auto' }} />
        </button>
      </div>

      {/* Earnings Section (Driver only) */}
      {isDriver && (
        <div className="section">
          <div className="section-title">Driver Dashboard</div>
          <div className="menu-row" onClick={() => setView('earnings')}>
            <div className="menu-icon" style={{ background: '#D1FAE5' }}><DollarSign size={18} color="#059669" /></div>
            <div className="menu-row-content">
              <div className="menu-row-title">My Earnings</div>
              <div className="menu-row-sub">Cost-sharing summary and trip history</div>
            </div>
            <ChevronRight size={18} color="var(--text-muted)" />
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="section">
        <div className="section-title">Settings</div>
        {[
          { icon: <Bell size={18} color="var(--accent)" />, bg: 'var(--accent-light)', title: 'Notifications', sub: 'Manage alerts for rides & messages', action: () => setView('notifications') },
          { icon: <Shield size={18} color="var(--danger)" />, bg: '#FEE2E2', title: 'Safety & Emergency', sub: user?.emergencyContact ? `Contact: ${user.emergencyName}` : 'Set emergency contact for SOS', action: () => setView('emergency') },
          { icon: <HelpCircle size={18} color="#8B5CF6" />, bg: '#EDE9FE', title: 'Help & Support', sub: 'FAQ, report an issue', action: () => {} },
        ].map(item => (
          <div key={item.title} className="menu-row" onClick={item.action}>
            <div className="menu-icon" style={{ background: item.bg }}>{item.icon}</div>
            <div className="menu-row-content">
              <div className="menu-row-title">{item.title}</div>
              <div className="menu-row-sub">{item.sub}</div>
            </div>
            <ChevronRight size={18} color="var(--text-muted)" />
          </div>
        ))}
      </div>

      {/* Sign Out */}
      <div className="section">
        <button
          onClick={signOut}
          style={{ width: '100%', padding: '13px', borderRadius: 'var(--radius-full)', border: '1.5px solid var(--border)', color: 'var(--danger)', fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}
          id="sign-out-btn"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
