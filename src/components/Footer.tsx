const Footer = () => {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      padding: '3rem 0',
      marginTop: 'auto',
      backgroundColor: 'var(--surface-color)'
    }}>
      <div className="layout-wrapper flex flex-col items-center gap-4">
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          Ride<span style={{ color: 'var(--primary)' }}>Share</span> BD
        </h2>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: '400px' }}>
          Empowering communities through affordable transportation and shared commutes. Let's beat the oil crisis together.
        </p>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2rem' }}>
          © 2026 RideShare BD. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
