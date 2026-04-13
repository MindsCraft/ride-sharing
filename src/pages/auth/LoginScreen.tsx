import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';

const LoginScreen = () => {
  const { setScreen, setPendingPhone, setUser } = useApp();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formattedPhone = `+880${phone.replace(/^0/, '').replace(/\D/g, '')}`;
  const isValid = phone.replace(/\D/g, '').length >= 10;

  const handleSendOTP = async () => {
    if (!isValid) return;
    setLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
    });

    setLoading(false);

    if (authError) {
      // If phone provider not configured, show friendly message
      if (authError.message.includes('not enabled') || authError.message.includes('provider')) {
        setError('SMS provider not yet configured. Go to Supabase Auth → Providers → Phone to enable it, or add a test phone number.');
      } else {
        setError(authError.message);
      }
      return;
    }

    setPendingPhone(formattedPhone);
    setScreen('otp');
  };

  const handleGoogleLogin = async () => {
    // Bypass authentication to allow UI work
    const mockUser: any = {
      id: 'mock-bypassed-user',
      name: 'Designer',
      phone: '+8801700000000',
      role: 'both',
      avatarInitial: 'D',
      rating: 5.0,
      totalRides: 100,
      totalEarnings: 0,
      isNidVerified: true,
      isEmailVerified: true,
      workEmail: 'design@notion.com',
      emergencyContact: '',
      emergencyName: '',
      vehicles: []
    };
    
    localStorage.setItem('rs_bypass_user', JSON.stringify(mockUser));
    setUser(mockUser);
    setScreen('main');
  };

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ background: 'var(--primary)', padding: '60px 28px 48px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🗺️</div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: 'white', marginBottom: 8 }}>Welcome to RideShare BD</h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>Share daily commutes, beat traffic, and<br />help each other save fuel costs.</p>
      </div>

      {/* Form card */}
      <div style={{ flex: 1, background: 'var(--surface)', borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0', marginTop: -24, padding: '32px 24px 40px' }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Sign In</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>Enter your mobile number to continue</p>

        {error && (
          <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 'var(--radius-md)', padding: '12px 14px', marginBottom: 16, fontSize: 13, color: '#991B1B', lineHeight: 1.5 }}>
            {error}
          </div>
        )}

        <div className="form-group">
          <div style={{ display: 'flex', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--surface)', transition: 'var(--transition)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 12px', borderRight: '1.5px solid var(--border)', background: 'var(--surface-2)', flexShrink: 0 }}>
              <span>🇧🇩</span>
              <span style={{ fontWeight: 600, color: 'var(--text-sub)', fontSize: 15 }}>+880</span>
            </div>
            <input
              type="tel"
              placeholder="01X XXXX XXXX"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              style={{ flex: 1, padding: '14px 14px', border: 'none', outline: 'none', fontSize: 16, color: 'var(--text-main)', background: 'transparent' }}
              maxLength={11}
            />
          </div>
        </div>

        <button
          className="btn btn-primary btn-block"
          onClick={handleSendOTP}
          disabled={!isValid || loading}
          style={{ opacity: (!isValid || loading) ? 0.6 : 1, fontSize: 16, marginBottom: 20 }}
          id="send-otp-btn"
        >
          {loading ? 'Sending...' : <>Send OTP <ArrowRight size={18} /></>}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <button
          className="btn btn-secondary btn-block"
          onClick={handleGoogleLogin}
          style={{ fontSize: 15 }}
          id="google-login-btn"
        >
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 24 }}>
          By continuing you agree to our <span style={{ color: 'var(--primary)' }}>Terms of Service</span> &amp; <span style={{ color: 'var(--primary)' }}>Privacy Policy</span>
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
