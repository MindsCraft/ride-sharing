import { useState, useRef, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';

const OTPScreen = () => {
  const { pendingPhone, setScreen } = useApp();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendSecs, setResendSecs] = useState(30);
  const [verified, setVerified] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend countdown
  useEffect(() => {
    if (resendSecs <= 0) return;
    const t = setTimeout(() => setResendSecs(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendSecs]);

  const code = digits.join('');

  const handleDigit = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...digits];
    next[i] = val.slice(-1);
    setDigits(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
    if (next.join('').length === 6) verifyOTP(next.join(''));
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const verifyOTP = async (token: string) => {
    setLoading(true);
    setError('');

    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone: pendingPhone,
      token,
      type: 'sms',
    });

    setLoading(false);

    if (verifyError) {
      setError('Invalid or expired code. Please try again.');
      setDigits(['', '', '', '', '', '']);
      refs.current[0]?.focus();
      return;
    }

    setVerified(true);
    // Auth state change in AppContext will handle navigation
  };

  const handleResend = async () => {
    if (resendSecs > 0) return;
    await supabase.auth.signInWithOtp({ phone: pendingPhone });
    setResendSecs(30);
    setDigits(['', '', '', '', '', '']);
    refs.current[0]?.focus();
  };

  if (verified) {
    return (
      <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 }}>
        <CheckCircle size={64} color="var(--primary)" />
        <h2 style={{ fontSize: 22, fontWeight: 800 }}>Verified!</h2>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Setting up your account...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div style={{ background: 'linear-gradient(160deg, var(--primary) 0%, #065F46 100%)', padding: '60px 28px 48px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📱</div>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: 'white', marginBottom: 8 }}>Verify Your Number</h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>
          We sent a 6-digit code to<br />
          <strong style={{ color: 'white' }}>{pendingPhone}</strong>
        </p>
      </div>

      <div style={{ flex: 1, background: 'var(--surface)', borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0', marginTop: -24, padding: '36px 24px 40px' }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Enter OTP</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>
          Type the 6-digit code from your SMS
        </p>

        {error && (
          <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 'var(--radius-md)', padding: '12px 14px', marginBottom: 16, fontSize: 13, color: '#991B1B' }}>
            {error}
          </div>
        )}

        {/* OTP boxes */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 28 }}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={el => { refs.current[i] = el; }}
              type="tel"
              maxLength={1}
              value={d}
              onChange={e => handleDigit(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              style={{
                width: 46, height: 58, textAlign: 'center', fontSize: 22, fontWeight: 700,
                border: `2px solid ${d ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-md)', background: d ? 'var(--primary-light)' : 'var(--surface)',
                color: 'var(--text-main)', outline: 'none', transition: 'var(--transition)',
              }}
            />
          ))}
        </div>

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <div className="loading-dots">
              <div className="loading-dot" /><div className="loading-dot" /><div className="loading-dot" />
            </div>
          </div>
        )}

        <button
          className="btn btn-primary btn-block"
          onClick={() => verifyOTP(code)}
          disabled={code.length < 6 || loading}
          style={{ opacity: (code.length < 6 || loading) ? 0.5 : 1, fontSize: 16, marginBottom: 20 }}
          id="verify-otp-btn"
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleResend}
            disabled={resendSecs > 0}
            style={{ fontSize: 14, color: resendSecs > 0 ? 'var(--text-muted)' : 'var(--primary)', fontWeight: 600 }}
          >
            {resendSecs > 0 ? `Resend in ${resendSecs}s` : 'Resend OTP'}
          </button>
        </div>

        <button onClick={() => setScreen('login')} style={{ display: 'block', width: '100%', textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-muted)' }}>
          ← Change phone number
        </button>

        {/* Test mode hint */}
        <div style={{ marginTop: 24, background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
          💡 <strong>Dev mode:</strong> Add test numbers in Supabase Dashboard<br />Authentication → Testing → Phone numbers
        </div>
      </div>
    </div>
  );
};

export default OTPScreen;
