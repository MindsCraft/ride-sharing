import { useState } from 'react';
import { ChevronLeft, Phone, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';

interface Props { onBack: () => void; }

const EmergencyContactView = ({ onBack }: Props) => {
  const { user } = useApp();
  const [name, setName] = useState(user?.emergencyName || '');
  const [phone, setPhone] = useState(user?.emergencyContact || '');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const isValid = name.trim().length >= 2 && phone.replace(/\D/g, '').length >= 10;

  const handleSave = async () => {
    if (!user || !isValid) return;
    setLoading(true);
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ emergency_name: name.trim(), emergency_contact: phone.trim() })
      .eq('id', user.id);
    setLoading(false);
    if (updateError) { setError('Could not save. Please try again.'); return; }
    setSaved(true);
    setTimeout(onBack, 1800);
  };

  if (saved) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 }}>
        <CheckCircle size={56} color="var(--primary)" />
        <h2 style={{ fontSize: 20, fontWeight: 800 }}>Contact Saved!</h2>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>{name} will be notified during SOS alerts.</p>
      </div>
    );
  }

  return (
    <div className="page-scroll">
      <div className="page-header">
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', marginBottom: 8 }}><ChevronLeft size={20} /> Back</button>
        <h1 className="page-title">Emergency Contact</h1>
        <p className="page-subtitle">Notified when you trigger SOS</p>
      </div>
      <div className="section">
        <div style={{ background: '#FEE2E2', borderRadius: 'var(--radius-md)', padding: '12px 14px', marginBottom: 24, fontSize: 13, color: '#991B1B' }}>
          🆘 During a trip, if you press <strong>SOS</strong>, your live location and trip details are shared instantly with this contact.
        </div>
        {user?.emergencyContact && (
          <div style={{ background: 'var(--primary-light)', borderRadius: 'var(--radius-md)', padding: '12px 14px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
            <Phone size={18} color="var(--primary)" />
            <div><div style={{ fontWeight: 600, color: 'var(--primary-dark)' }}>{user.emergencyName}</div><div style={{ fontSize: 13, color: 'var(--primary)' }}>{user.emergencyContact}</div></div>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--primary)', fontWeight: 600 }}>Active</span>
          </div>
        )}

        {error && <div style={{ color: '#991B1B', background: '#FEE2E2', borderRadius: 'var(--radius-md)', padding: '10px', fontSize: 13, marginBottom: 12 }}>{error}</div>}

        <div className="form-group">
          <label className="form-label">Contact Name</label>
          <input type="text" className="form-input" placeholder="e.g. Roksana Begum (Mother)" value={name} onChange={e => setName(e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🇧🇩</span><span style={{ fontWeight: 600, color: 'var(--text-sub)', fontSize: 15 }}>+880</span>
              <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
            </div>
            <input type="tel" className="form-input" placeholder="01X XXXX XXXX" value={phone} onChange={e => setPhone(e.target.value)} style={{ paddingLeft: 90 }} />
          </div>
        </div>

        <button className="btn btn-primary btn-block" onClick={handleSave} disabled={!isValid || loading} style={{ opacity: (!isValid || loading) ? 0.5 : 1 }}>
          {loading ? 'Saving...' : 'Save Emergency Contact'}
        </button>
      </div>
    </div>
  );
};

export default EmergencyContactView;
