import { useApp } from '../../context/AppContext';

const SplashScreen = () => {
  useApp(); // keeps auth state active

  return (
    <div style={{
      height: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--primary)',
      gap: 20,
    }}>
      <div style={{ fontSize: 72, animation: 'pulse 2s infinite' }}>🗺️</div>
      <div>
        <h1 style={{ fontSize: 30, fontWeight: 900, color: 'white', textAlign: 'center', letterSpacing: -1 }}>
          RideShare BD
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.65)', textAlign: 'center', fontSize: 14, marginTop: 4 }}>
          Share the journey, share the cost
        </p>
      </div>
      <div style={{ position: 'absolute', bottom: 60 }}>
        <div className="loading-dots">
          <div className="loading-dot" style={{ background: 'rgba(255,255,255,0.6)' }} />
          <div className="loading-dot" style={{ background: 'rgba(255,255,255,0.6)' }} />
          <div className="loading-dot" style={{ background: 'rgba(255,255,255,0.6)' }} />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
