import { useState } from 'react';
import { ChevronLeft, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';

interface Props { onBack: () => void; }

const WorkEmailView = ({ onBack }: Props) => {
  const { user } = useApp();
  const [email, setEmail] = useState(user?.workEmail || '');
  const [stage, setStage] = useState<'form' | 'sent' | 'verified'>(user?.isEmailVerified ? 'verified' : 'form');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleVerify = async () => {
    if (!user || code.length < 6) return;
    setLoading(true);
    // Mock: any 6-digit code verifies (in production, validate properly)
    const { error } = await supabase
      .from('profiles')
      .update({ work_email: email, is_email_verified: true })
      .eq('id', user.id);
    setLoading(false);
    if (!error) setStage('verified');
  };

  return (
    <div className="page-scroll">
      <div className="page-header">
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', marginBottom: 8 }}><ChevronLeft size={20} /> Back</button>
        <h1 className="page-title">Work Email</h1>
        <p className="page-subtitle">Verify your corporate identity</p>
      </div>
      <div className="section">
        {stage === 'verified' ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <CheckCircle size={56} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Email Verified! 🏢</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 12 }}>{user?.workEmail}</p>
            <span className="trust-badge email" style={{ fontSize: 13, padding: '6px 16px' }}>🏢 Corp Email Verified</span>
          </div>
        ) : stage === 'form' ? (
          <>
            <div style={{ background: 'var(--accent-light)', borderRadius: 'var(--radius-md)', padding: '12px 14px', marginBottom: 20, fontSize: 13, color: '#1D4ED8' }}>
              🏢 Corporate email verification adds a <strong>Company badge</strong> to your profile.
            </div>
            <div className="form-group">
              <label className="form-label">Work Email Address</label>
              <input type="email" className="form-input" placeholder="yourname@company.com.bd" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <button className="btn btn-primary btn-block" onClick={() => setStage('sent')} disabled={!isValidEmail} style={{ opacity: !isValidEmail ? 0.5 : 1 }}>
              Send Verification Code
            </button>
          </>
        ) : (
          <>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: 14 }}>Check <strong style={{ color: 'var(--text-main)' }}>{email}</strong> for the 6-digit code.</p>
            <div className="form-group">
              <label className="form-label">Verification Code</label>
              <input type="tel" className="form-input" placeholder="Enter 6-digit code" maxLength={6} value={code} onChange={e => setCode(e.target.value)} style={{ fontSize: 20, letterSpacing: 4, textAlign: 'center' }} />
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Demo: enter any 6 digits</div>
            </div>
            <button className="btn btn-primary btn-block" onClick={handleVerify} disabled={code.length < 6 || loading} style={{ opacity: (code.length < 6 || loading) ? 0.5 : 1 }}>
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
            <button style={{ marginTop: 12, width: '100%', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }} onClick={() => setStage('form')}>Change email</button>
          </>
        )}
      </div>
    </div>
  );
};

export default WorkEmailView;
