import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

const LandingPage = () => {
  const { setScreen } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const goToLogin = () => setScreen('login');

  return (
    <div style={{ fontFamily: 'Inter, -apple-system, system-ui, sans-serif', color: 'rgba(0,0,0,0.95)', background: '#fff', overflowX: 'hidden' }}>

      {/* ===== NAVBAR ===== */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 1000,
        background: scrolled ? 'rgba(255,255,255,0.95)' : '#fff',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.1)' : '1px solid transparent',
        transition: 'all 0.2s ease',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <div style={{ fontSize: 24 }}>🗺️</div>
            <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.25px' }}>RideShare BD</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="landing-desktop-nav">
            <a href="#how-it-works" style={{ fontSize: 15, fontWeight: 500, color: 'rgba(0,0,0,0.75)', textDecoration: 'none' }}>How it works</a>
            <a href="#features" style={{ fontSize: 15, fontWeight: 500, color: 'rgba(0,0,0,0.75)', textDecoration: 'none' }}>Features</a>
            <a href="#testimonials" style={{ fontSize: 15, fontWeight: 500, color: 'rgba(0,0,0,0.75)', textDecoration: 'none' }}>Stories</a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={goToLogin} style={{ fontSize: 15, fontWeight: 500, color: 'rgba(0,0,0,0.75)', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px' }} className="landing-desktop-nav">Log in</button>
            <button
              onClick={goToLogin} id="landing-cta-nav"
              style={{ background: '#0075de', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s ease', whiteSpace: 'nowrap' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#005bab')}
              onMouseLeave={e => (e.currentTarget.style.background = '#0075de')}
            >Get started free</button>
            <button onClick={() => setMobileMenuOpen(v => !v)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 6, fontSize: 22 }} className="landing-mobile-menu-btn" aria-label="Menu">
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div style={{ background: '#fff', borderTop: '1px solid rgba(0,0,0,0.1)', padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 16, fontWeight: 500, color: 'rgba(0,0,0,0.85)', textDecoration: 'none' }}>How it works</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 16, fontWeight: 500, color: 'rgba(0,0,0,0.85)', textDecoration: 'none' }}>Features</a>
            <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 16, fontWeight: 500, color: 'rgba(0,0,0,0.85)', textDecoration: 'none' }}>Stories</a>
            <button onClick={goToLogin} style={{ background: '#0075de', color: '#fff', border: 'none', padding: '12px', borderRadius: 4, fontSize: 16, fontWeight: 600, cursor: 'pointer', textAlign: 'center' }}>Get started free</button>
          </div>
        )}
      </nav>

      {/* ===== HERO ===== */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px 64px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f2f9ff', color: '#097fe8', padding: '4px 12px', borderRadius: 9999, fontSize: 12, fontWeight: 600, letterSpacing: '0.125px', marginBottom: 32 }}>
          🇧🇩 Built for Bangladesh's commuters
        </div>
        <h1 style={{ fontSize: 'clamp(40px, 7vw, 64px)', fontWeight: 700, lineHeight: 1.02, letterSpacing: 'clamp(-1.5px, -0.033em, -2.125px)', color: 'rgba(0,0,0,0.95)', marginBottom: 24, maxWidth: 820, margin: '0 auto 24px' }}>
          Share your commute.<br />Save money. Build community.
        </h1>
        <p style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', fontWeight: 500, lineHeight: 1.5, color: '#615d59', maxWidth: 560, margin: '0 auto 40px', letterSpacing: '-0.125px' }}>
          RideShare BD connects Dhaka's daily commuters with verified drivers going the same way. Split fuel costs, cut traffic stress, and meet your neighbors.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button id="landing-cta-hero" onClick={goToLogin}
            style={{ background: '#0075de', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: 4, fontSize: 16, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s ease', letterSpacing: '-0.125px' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#005bab'; e.currentTarget.style.transform = 'scale(1.02)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#0075de'; e.currentTarget.style.transform = 'scale(1)'; }}
          >Start riding for free →</button>
          <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ background: 'rgba(0,0,0,0.05)', color: 'rgba(0,0,0,0.85)', border: 'none', padding: '14px 28px', borderRadius: 4, fontSize: 16, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s ease' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'scale(1.02)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'scale(1)'; }}
          >See how it works</button>
        </div>
        {/* Hero App Mockup */}
        <div style={{ marginTop: 64 }}>
          <div style={{ background: 'linear-gradient(160deg, #f6f5f4 0%, #e8f4ff 100%)', borderRadius: 24, padding: '32px 32px 0', border: '1px solid rgba(0,0,0,0.1)', boxShadow: 'rgba(0,0,0,0.04) 0px 4px 18px, rgba(0,0,0,0.027) 0px 2.025px 7.85px', maxWidth: 360, margin: '0 auto' }}>
            <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 -4px 24px rgba(0,0,0,0.08)' }}>
              <div style={{ height: 180, background: 'linear-gradient(135deg, #d4e8f0 0%, #c8dde8 100%)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255,255,255,0.3) 20px, rgba(255,255,255,0.3) 21px), repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,0.3) 20px, rgba(255,255,255,0.3) 21px)' }} />
                <div style={{ position: 'absolute', top: '50%', left: '45%', width: 10, height: 10, background: '#0075de', borderRadius: '50%', border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,117,222,0.4)' }} />
                <div style={{ position: 'absolute', top: '30%', left: '60%', width: 8, height: 8, background: '#000', borderRadius: '2px', border: '2px solid #fff' }} />
              </div>
              <div style={{ padding: '16px 16px 20px' }}>
                <div style={{ background: '#fff', borderRadius: 6, border: '1px solid rgba(0,0,0,0.1)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <div style={{ width: 8, height: 8, background: '#0075de', borderRadius: '50%' }} />
                  <span style={{ fontSize: 13, color: '#615d59', fontWeight: 500 }}>23 min · 7.2 km to Gulshan 2</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['Toyota · ৳150', 'Honda · ৳120'].map((label, i) => (
                    <div key={i} style={{ flex: 1, background: i === 0 ? '#0075de' : '#f6f5f4', borderRadius: 6, padding: '10px 8px', textAlign: 'center', border: i === 0 ? 'none' : '1px solid rgba(0,0,0,0.1)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: i === 0 ? '#fff' : 'rgba(0,0,0,0.8)' }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRUST BAR ===== */}
      <section style={{ background: '#f6f5f4', borderTop: '1px solid rgba(0,0,0,0.08)', borderBottom: '1px solid rgba(0,0,0,0.08)', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 24, textAlign: 'center' }}>
          {[
            { stat: '4,200+', label: 'Daily commuters', emoji: '🙋' },
            { stat: '৳850', label: 'Avg. monthly savings', emoji: '💰' },
            { stat: '98%', label: 'Rider satisfaction', emoji: '⭐' },
            { stat: '18+', label: 'Dhaka routes covered', emoji: '🗺️' },
          ].map(item => (
            <div key={item.stat}>
              <div style={{ fontSize: 28 }}>{item.emoji}</div>
              <div style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, letterSpacing: '-1.5px', color: 'rgba(0,0,0,0.95)', lineHeight: 1.1, marginTop: 8 }}>{item.stat}</div>
              <div style={{ fontSize: 14, color: '#615d59', marginTop: 4, fontWeight: 500 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ display: 'inline-flex', background: '#f2f9ff', color: '#097fe8', padding: '4px 12px', borderRadius: 9999, fontSize: 12, fontWeight: 600, marginBottom: 20 }}>Simple by design</div>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, letterSpacing: '-1.5px', lineHeight: 1.0, marginBottom: 16 }}>Commute smarter in 3 steps</h2>
          <p style={{ fontSize: 20, color: '#615d59', fontWeight: 500, maxWidth: 480, margin: '0 auto', lineHeight: 1.5 }}>Whether you're a daily rider or a driver with empty seats.</p>
        </div>
        <div style={{ marginBottom: 64 }}>
          <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#a39e98', marginBottom: 24 }}>For Riders</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {[
              { step: '1', title: 'Drop a pin', desc: 'Search your destination and confirm your pickup point on the map.', icon: '📍' },
              { step: '2', title: 'Browse & negotiate', desc: 'See real drivers on your route. Offer a fair price and message them directly.', icon: '🔍' },
              { step: '3', title: 'Ride & rate', desc: 'Your driver picks you up. Rate the ride to keep the community safe.', icon: '⭐' },
            ].map(item => (
              <div key={item.step} style={{ background: '#fff', borderRadius: 12, padding: '28px 24px', border: '1px solid rgba(0,0,0,0.1)', boxShadow: 'rgba(0,0,0,0.04) 0px 4px 18px, rgba(0,0,0,0.02) 0px 0.8px 2.93px' }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{item.icon}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 24, height: 24, background: '#0075de', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{item.step}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.25px' }}>{item.title}</div>
                </div>
                <p style={{ fontSize: 15, color: '#615d59', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: '#f6f5f4', borderRadius: 16, padding: '40px 32px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#a39e98', marginBottom: 24 }}>For Drivers</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {[
              { step: '1', title: 'Post your route', desc: "Tell us where you're going and when. Set your price and available seats.", icon: '🚗' },
              { step: '2', title: 'Accept requests', desc: 'Riders request to join your commute. Review their profile and negotiate the fare.', icon: '📱' },
              { step: '3', title: 'Drive & earn', desc: 'Pick up verified riders and offset your daily fuel cost — without running a taxi service.', icon: '💸' },
            ].map(item => (
              <div key={item.step} style={{ background: '#fff', borderRadius: 12, padding: '28px 24px', border: '1px solid rgba(0,0,0,0.1)', boxShadow: 'rgba(0,0,0,0.04) 0px 4px 18px, rgba(0,0,0,0.02) 0px 0.8px 2.93px' }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{item.icon}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 24, height: 24, background: 'rgba(0,0,0,0.85)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{item.step}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.25px' }}>{item.title}</div>
                </div>
                <p style={{ fontSize: 15, color: '#615d59', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" style={{ background: '#f6f5f4', padding: '96px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-flex', background: '#f2f9ff', color: '#097fe8', padding: '4px 12px', borderRadius: 9999, fontSize: 12, fontWeight: 600, marginBottom: 20 }}>Why RideShare BD</div>
            <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, letterSpacing: '-1.5px', lineHeight: 1.0 }}>
              Everything you need for safe,<br />reliable daily commutes
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {[
              { icon: '🛡️', title: 'NID Verified Drivers', desc: 'Every driver on RideShare BD has been verified with their National ID. You always know who\'s behind the wheel.', badge: 'Safety First' },
              { icon: '💬', title: 'Smart Negotiation', desc: 'Riders propose a fair price based on distance. Drivers can accept, decline or counter-offer. Transparent, always.', badge: 'Fair Pricing' },
              { icon: '🗺️', title: 'Real-time Map', desc: 'See available drivers on a live map tailored to Dhaka\'s street grid. Pick-up and drop-off are pinpointable to the curb.', badge: 'Map-driven' },
              { icon: '🔁', title: 'Daily Recurring Rides', desc: 'Post your commute once and repeat it every weekday automatically. Build trust with a consistent group of co-passengers.', badge: 'Commuter-first' },
              { icon: '📱', title: 'Works on Any Device', desc: 'A fast, responsive web app that works on your phone just like a native app — no download required.', badge: 'No download' },
              { icon: '🌱', title: 'Reduce Traffic & Emissions', desc: 'Every shared ride removes a car from Dhaka\'s congested roads. Better for you, your city, and the air you breathe.', badge: 'Eco impact' },
            ].map(item => (
              <div key={item.title}
                style={{ background: '#fff', borderRadius: 12, padding: '32px 28px', border: '1px solid rgba(0,0,0,0.1)', boxShadow: 'rgba(0,0,0,0.04) 0px 4px 18px, rgba(0,0,0,0.02) 0px 0.8px 2.93px', transition: 'transform 0.15s ease, box-shadow 0.15s ease', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'rgba(0,0,0,0.07) 0px 8px 24px, rgba(0,0,0,0.03) 0px 2px 6px'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'rgba(0,0,0,0.04) 0px 4px 18px, rgba(0,0,0,0.02) 0px 0.8px 2.93px'; }}
              >
                <div style={{ fontSize: 40, marginBottom: 20 }}>{item.icon}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.25px' }}>{item.title}</div>
                  <div style={{ background: '#f2f9ff', color: '#097fe8', padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 600, letterSpacing: '0.125px', whiteSpace: 'nowrap' }}>{item.badge}</div>
                </div>
                <p style={{ fontSize: 15, color: '#615d59', lineHeight: 1.65, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section id="testimonials" style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, letterSpacing: '-1.5px', lineHeight: 1.0, marginBottom: 16 }}>What our commuters say</h2>
          <p style={{ fontSize: 18, color: '#615d59', fontWeight: 500 }}>Real stories from Dhaka's daily commuters.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {[
            { quote: "I save over ৳1,200 a month on my Dhanmondi to Gulshan commute. The driver I found is punctual and we've become friends!", name: 'Tasnim R.', role: 'Marketing Executive, Gulshan', initial: 'T' },
            { quote: "I drive to Motijheel every day anyway. Picking up 2 riders covers my fuel completely. It's a no-brainer.", name: 'Arif H.', role: 'Software Engineer & Driver', initial: 'A' },
            { quote: "The NID verification gave me confidence. I'm a woman commuting alone and knowing my driver is verified matters a lot.", name: 'Nadia K.', role: 'University Student, Mirpur', initial: 'N' },
          ].map(item => (
            <div key={item.name} style={{ background: '#fff', borderRadius: 12, padding: '32px 28px', border: '1px solid rgba(0,0,0,0.1)', boxShadow: 'rgba(0,0,0,0.04) 0px 4px 18px, rgba(0,0,0,0.02) 0px 0.8px 2.93px' }}>
              <div style={{ display: 'flex', gap: 2, marginBottom: 20 }}>
                {'★★★★★'.split('').map((s, i) => <span key={i} style={{ color: '#f59e0b', fontSize: 18 }}>{s}</span>)}
              </div>
              <p style={{ fontSize: 16, lineHeight: 1.65, color: 'rgba(0,0,0,0.85)', marginBottom: 24, fontStyle: 'italic' }}>"{item.quote}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#0075de', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>{item.initial}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{item.name}</div>
                  <div style={{ fontSize: 13, color: '#a39e98' }}>{item.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== DARK CTA BAND ===== */}
      <section style={{ background: '#31302e', padding: '96px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 24 }}>🚗💨</div>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, letterSpacing: '-1.5px', lineHeight: 1.05, color: '#fff', marginBottom: 20 }}>Your commute, upgraded.</h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, marginBottom: 40, fontWeight: 500 }}>
            Join thousands of Dhaka commuters already sharing rides, splitting costs, and making friends.
          </p>
          <button id="landing-cta-bottom" onClick={goToLogin}
            style={{ background: '#0075de', color: '#fff', border: 'none', padding: '16px 32px', borderRadius: 4, fontSize: 17, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s ease', letterSpacing: '-0.125px' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#005bab'; e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#0075de'; e.currentTarget.style.transform = 'scale(1)'; }}
          >Get started free — no credit card</button>
          <div style={{ marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Phone number verification only · 100% free to join</div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ background: '#1a1a18', padding: '48px 24px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 32, marginBottom: 48 }}>
            <div style={{ maxWidth: 280 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 24 }}>🗺️</span>
                <span style={{ fontWeight: 700, fontSize: 17, color: '#fff' }}>RideShare BD</span>
              </div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>Bangladesh's community carpooling platform. Share the journey, share the cost.</p>
            </div>
            <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
              {[
                { heading: 'Product', links: ['How it works', 'Features', 'Safety', 'Pricing'] },
                { heading: 'Company', links: ['About', 'Blog', 'Press', 'Careers'] },
                { heading: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'] },
              ].map(col => (
                <div key={col.heading}>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255,255,255,0.35)', marginBottom: 16 }}>{col.heading}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {col.links.map(link => (
                      <a key={link} href="#" style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontWeight: 500, transition: 'color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
                      >{link}</a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>© 2026 RideShare BD. All rights reserved.</span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Made with ❤️ in Dhaka, Bangladesh</span>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 640px) {
          .landing-desktop-nav { display: none !important; }
          .landing-mobile-menu-btn { display: flex !important; }
        }
        @media (min-width: 641px) {
          .landing-mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
