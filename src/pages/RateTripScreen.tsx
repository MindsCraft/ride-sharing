import { useState } from 'react';
import { Star } from 'lucide-react';
import { useApp } from '../context/AppContext';

const COMPLIMENTS = ['Friendly', 'Punctual', 'Safe Driver', 'Clean Car', 'Great Conversation', 'Recommended Route'];

const RateTripScreen = () => {
  const { completedTrip, setCompletedTrip, setScreen } = useApp();
  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [done, setDone] = useState(false);

  if (!completedTrip) { setScreen('main'); return null; }

  const toggleCompliment = (c: string) =>
    setSelected(s => s.includes(c) ? s.filter(x => x !== c) : [...s, c]);

  const handleSubmit = () => setDone(true);

  if (done) {
    return (
      <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32, background: 'var(--bg)' }}>
        <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 44 }}>🎉</span>
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 900, textAlign: 'center' }}>Trip Completed!</h2>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: 260 }}>
          Thank you for rating {completedTrip.driverName}. Your feedback helps keep RideShare BD safe and trustworthy.
        </p>
        <div style={{ background: 'var(--primary-light)', borderRadius: 'var(--radius-lg)', padding: '16px 24px', textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 22, color: 'var(--primary-dark)' }}>৳{completedTrip.agreedPrice}</div>
          <div style={{ fontSize: 13, color: 'var(--primary)', marginTop: 2 }}>Cost shared</div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 16, width: '100%', fontSize: 16 }} onClick={() => { setCompletedTrip(null); setScreen('main'); }}>
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: 'var(--primary)', padding: '48px 24px 60px', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: 'white', margin: '0 auto 12px' }}>
          {completedTrip.driverName.charAt(0)}
        </div>
        <div style={{ color: 'white', fontWeight: 800, fontSize: 20 }}>{completedTrip.driverName}</div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 }}>
          {completedTrip.from} → {completedTrip.to}
        </div>
      </div>

      {/* Rating card overlapping header */}
      <div style={{ margin: '-28px 16px 0', borderRadius: 'var(--radius-xl)', background: 'var(--surface)', boxShadow: 'var(--shadow-lg)', padding: '24px 20px', flex: 1, overflowY: 'auto' }}>
        <h3 style={{ fontWeight: 800, fontSize: 18, textAlign: 'center', marginBottom: 6 }}>How was your ride?</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', marginBottom: 20 }}>Your rating is anonymous to the driver.</p>

        {/* Stars */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 24 }}>
          {[1, 2, 3, 4, 5].map(s => (
            <button
              key={s}
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setStars(s)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', transition: 'transform 0.2s', transform: hovered >= s || stars >= s ? 'scale(1.2)' : 'scale(1)' }}
            >
              <Star
                size={38}
                fill={(hovered || stars) >= s ? '#F59E0B' : 'none'}
                color={(hovered || stars) >= s ? '#F59E0B' : 'var(--border)'}
              />
            </button>
          ))}
        </div>

        {/* Compliments */}
        {stars >= 4 && (
          <>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>What stood out?</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {COMPLIMENTS.map(c => (
                <button
                  key={c}
                  onClick={() => toggleCompliment(c)}
                  style={{
                    padding: '7px 14px', borderRadius: 'var(--radius-full)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    border: `1.5px solid ${selected.includes(c) ? 'var(--primary)' : 'var(--border)'}`,
                    background: selected.includes(c) ? 'var(--primary-light)' : 'var(--surface)',
                    color: selected.includes(c) ? 'var(--primary-dark)' : 'var(--text-sub)',
                    transition: 'var(--transition)',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Comment */}
        <div className="form-group">
          <label className="form-label">Leave a comment (optional)</label>
          <textarea className="form-input" rows={3} placeholder="Tell others about your experience..." value={comment} onChange={e => setComment(e.target.value)} />
        </div>

        <button className="btn btn-primary btn-block" onClick={handleSubmit} disabled={stars === 0} style={{ opacity: stars === 0 ? 0.5 : 1, fontSize: 16 }}>
          Submit Rating
        </button>

        <button style={{ display: 'block', width: '100%', textAlign: 'center', marginTop: 14, color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }} onClick={() => { setCompletedTrip(null); setScreen('main'); }}>
          Skip for now
        </button>
      </div>
    </div>
  );
};

export default RateTripScreen;
