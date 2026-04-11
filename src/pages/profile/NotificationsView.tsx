import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

interface Props { onBack: () => void; }

interface ToggleRowProps {
  title: string;
  sub: string;
  value: boolean;
  onChange: (v: boolean) => void;
}
const ToggleRow = ({ title, sub, value, onChange }: ToggleRowProps) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border-light)' }}>
    <div>
      <div style={{ fontWeight: 500, fontSize: 15 }}>{title}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>
    </div>
    <button
      onClick={() => onChange(!value)}
      style={{ width: 44, height: 24, borderRadius: 12, background: value ? 'var(--primary)' : 'var(--border)', position: 'relative', transition: 'all 0.25s', flexShrink: 0. }}>
      <div style={{ position: 'absolute', top: 2, left: value ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.25s' }} />
    </button>
  </div>
);

const NotificationsView = ({ onBack }: Props) => {
  const [settings, setSettings] = useState({
    rideRequests: true,
    messages: true,
    rideConfirmed: true,
    driverAccepted: true,
    promos: false,
    reminders: true,
    appUpdates: false,
  });
  const toggle = (key: keyof typeof settings) => setSettings(s => ({ ...s, [key]: !s[key] }));

  return (
    <div className="page-scroll">
      <div className="page-header">
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', marginBottom: 8 }}>
          <ChevronLeft size={20} /> Back
        </button>
        <h1 className="page-title">Notifications</h1>
        <p className="page-subtitle">Manage your alert preferences</p>
      </div>

      <div className="section">
        <div className="section-title">Ride Alerts</div>
        <ToggleRow title="Ride Requests" sub="When someone requests your posted ride" value={settings.rideRequests} onChange={() => toggle('rideRequests')} />
        <ToggleRow title="Messages" sub="Negotiation messages from riders/drivers" value={settings.messages} onChange={() => toggle('messages')} />
        <ToggleRow title="Ride Confirmed" sub="When a driver accepts your request" value={settings.rideConfirmed} onChange={() => toggle('rideConfirmed')} />
        <ToggleRow title="Offer Accepted" sub="When a rider accepts your offer" value={settings.driverAccepted} onChange={() => toggle('driverAccepted')} />
      </div>

      <div className="section">
        <div className="section-title">Other</div>
        <ToggleRow title="Reminders" sub="Upcoming ride reminders 30 min before" value={settings.reminders} onChange={() => toggle('reminders')} />
        <ToggleRow title="App Updates" sub="New features and improvements" value={settings.appUpdates} onChange={() => toggle('appUpdates')} />
        <ToggleRow title="Promotions" sub="Special offers and announcements" value={settings.promos} onChange={() => toggle('promos')} />
      </div>
    </div>
  );
};

export default NotificationsView;
