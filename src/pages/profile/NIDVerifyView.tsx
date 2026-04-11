import { useState } from 'react';
import { ChevronLeft, Upload, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';

interface Props { onBack: () => void; }
type Step = 'intro' | 'front' | 'selfie' | 'pending' | 'verified';

const NIDVerifyView = ({ onBack }: Props) => {
  const { user } = useApp();
  const [step, setStep] = useState<Step>(user?.isNidVerified ? 'verified' : 'intro');
  const [frontUploaded, setFrontUploaded] = useState(false);
  const [selfieUploaded, setSelfieUploaded] = useState(false);

  const markVerified = async () => {
    if (!user) return;
    // In production: this would be done by an admin after reviewing uploads
    // For demo: we directly update the DB
    await supabase.from('profiles').update({ is_nid_verified: true }).eq('id', user.id);
    setStep('verified');
  };

  const handleUpload = (type: 'front' | 'selfie') => {
    if (type === 'front') {
      setFrontUploaded(true);
      setTimeout(() => setStep('selfie'), 700);
    } else {
      setSelfieUploaded(true);
      setStep('pending');
      // Simulate review + auto-approve (2.5s) for demo
      setTimeout(markVerified, 2500);
    }
  };

  if (step === 'verified') {
    return (
      <div className="page-scroll">
        <div className="page-header">
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', marginBottom: 8 }}><ChevronLeft size={20} /> Back</button>
          <h1 className="page-title">NID Verification</h1>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px', gap: 12 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={44} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>NID Verified ✅</h2>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: 260 }}>Your National ID has been verified. The ✅ badge is now displayed on your profile.</p>
          <span className="trust-badge verified" style={{ marginTop: 8, fontSize: 13, padding: '6px 16px' }}>✅ NID Verified</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-scroll">
      <div className="page-header">
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', marginBottom: 8 }}><ChevronLeft size={20} /> Back</button>
        <h1 className="page-title">Verify Your NID</h1>
        <p className="page-subtitle">Builds trust with other commuters</p>
      </div>

      <div className="section">
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {['intro', 'front', 'selfie', 'pending'].map((s, i) => (
            <div key={s} style={{ flex: 1, height: 4, borderRadius: 99, background: ['intro','front','selfie','pending'].indexOf(step) >= i ? 'var(--primary)' : 'var(--border)', transition: 'background 0.4s' }} />
          ))}
        </div>

        {step === 'intro' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 64, marginBottom: 12 }}>🪪</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Identity Verification</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6 }}>
                We verify your National ID Card to ensure all users are real people. Your data is encrypted and never shared.
              </p>
            </div>
            <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-lg)', padding: '16px', marginBottom: 20 }}>
              {['Government-issued NID or Smart Card', 'Clear, readable photo (not blurry)', 'Photo plus selfie holding the card'].map(r => (
                <div key={r} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 0', fontSize: 14 }}>
                  <span style={{ color: 'var(--primary)' }}>✓</span> {r}
                </div>
              ))}
            </div>
            <button className="btn btn-primary btn-block" onClick={() => setStep('front')}>Start Verification</button>
          </>
        )}

        {step === 'front' && (
          <>
            <h2 style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>Step 1: NID Front Photo</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>Take a clear photo of the front side of your NID card.</p>
            <div onClick={() => handleUpload('front')} style={{ border: `2px dashed ${frontUploaded ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 'var(--radius-xl)', padding: '48px 24px', textAlign: 'center', cursor: 'pointer', background: frontUploaded ? 'var(--primary-light)' : 'var(--surface-2)', transition: 'var(--transition)' }}>
              {frontUploaded ? <><CheckCircle size={40} color="var(--primary)" style={{ margin: '0 auto 8px' }} /><div style={{ fontWeight: 600, color: 'var(--primary)' }}>Photo Uploaded!</div></> : <><Upload size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} /><div style={{ fontWeight: 600 }}>Tap to Upload</div><div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>JPG, PNG — max 5MB</div></>}
            </div>
          </>
        )}

        {step === 'selfie' && (
          <>
            <h2 style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>Step 2: Selfie with NID</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>Take a selfie while clearly holding your NID next to your face.</p>
            <div onClick={() => handleUpload('selfie')} style={{ border: `2px dashed ${selfieUploaded ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 'var(--radius-xl)', padding: '48px 24px', textAlign: 'center', cursor: 'pointer', background: selfieUploaded ? 'var(--primary-light)' : 'var(--surface-2)', transition: 'var(--transition)' }}>
              {selfieUploaded ? <><CheckCircle size={40} color="var(--primary)" style={{ margin: '0 auto 8px' }} /><div style={{ fontWeight: 600, color: 'var(--primary)' }}>Selfie Uploaded!</div></> : <><Upload size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} /><div style={{ fontWeight: 600 }}>Tap to Upload Selfie</div><div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Make sure face & NID are visible</div></>}
            </div>
          </>
        )}

        {step === 'pending' && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#FEF3C7', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={36} color="#D97706" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Under Review</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>Verifying your NID...</p>
            <div className="loading-dots" style={{ justifyContent: 'center' }}>
              <div className="loading-dot" /><div className="loading-dot" /><div className="loading-dot" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NIDVerifyView;
