import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';

const ROLES = [
  { id: 'rider', emoji: '🙋', label: 'Find Rides', sub: 'I need a seat in someone\'s daily commute' },
  { id: 'driver', emoji: '🚗', label: 'Offer Rides', sub: 'I own a car and want to share my commute' },
  { id: 'both', emoji: '🔄', label: 'Both', sub: 'I want to both offer seats and find rides' },
] as const;

const OnboardingScreen = () => {
  const { user, setUser, setScreen } = useApp();
  const [step, setStep] = useState<'name' | 'role'>('name');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'rider' | 'driver' | 'both'>('both');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNameNext = () => {
    if (name.trim().length < 2) return;
    setStep('role');
  };

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);
    setError('');

    const { error: updateError } = await (supabase
      .from('profiles')
      .update({ name: name.trim(), role } as Record<string, unknown>)
      .eq('id', user.id) as unknown as Promise<{ error: Error | null }>);

    if (updateError) {
      setError('Could not save your profile. Please try again.');
      setLoading(false);
      return;
    }

    // Also update auth user metadata
    await supabase.auth.updateUser({ data: { name: name.trim() } });

    // Update local user state
    setUser({
      ...user,
      name: name.trim(),
      role,
      avatarInitial: name.trim().charAt(0).toUpperCase(),
    });

    setLoading(false);
    setScreen('main');
  };

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div style={{ background: 'linear-gradient(160deg, var(--primary) 0%, #065F46 100%)', padding: '60px 28px 48px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>{step === 'name' ? '👋' : '🤔'}</div>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: 'white', marginBottom: 8 }}>
          {step === 'name' ? 'Welcome aboard!' : 'How will you use RideShare?'}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>
          {step === 'name' ? 'Tell us your name' : `Hi ${name}! You can always change this later.`}
        </p>
      </div>

      <div style={{ flex: 1, background: 'var(--surface)', borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0', marginTop: -24, padding: '36px 24px 40px' }}>

        {error && (
          <div style={{ background: '#FEE2E2', borderRadius: 'var(--radius-md)', padding: '12px 14px', marginBottom: 16, fontSize: 13, color: '#991B1B' }}>
            {error}
          </div>
        )}

        {step === 'name' ? (
          <>
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Your full name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Kamal Uddin"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleNameNext()}
                style={{ fontSize: 17 }}
                autoFocus
              />
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                This is what riders and drivers will see
              </div>
            </div>
            <button
              className="btn btn-primary btn-block"
              onClick={handleNameNext}
              disabled={name.trim().length < 2}
              style={{ opacity: name.trim().length < 2 ? 0.5 : 1, fontSize: 16 }}
              id="name-continue-btn"
            >
              Continue →
            </button>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {ROLES.map(r => (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px',
                    border: `2px solid ${role === r.id ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-lg)', background: role === r.id ? 'var(--primary-light)' : 'var(--surface)',
                    cursor: 'pointer', transition: 'var(--transition)', textAlign: 'left',
                  }}
                  id={`role-${r.id}-btn`}
                >
                  <span style={{ fontSize: 32 }}>{r.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: role === r.id ? 'var(--primary-dark)' : 'var(--text-main)' }}>{r.label}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{r.sub}</div>
                  </div>
                  {role === r.id && (
                    <div style={{ marginLeft: 'auto' }}>
                      <CheckCircle size={22} color="var(--primary)" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <button
              className="btn btn-primary btn-block"
              onClick={handleComplete}
              disabled={loading}
              style={{ fontSize: 16 }}
              id="get-started-btn"
            >
              {loading ? 'Saving...' : 'Get Started 🚀'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default OnboardingScreen;
