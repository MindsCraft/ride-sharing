import { useState } from 'react';
import { ChevronLeft, Car, Plus, Trash2, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import type { Vehicle } from '../../context/AppContext';

interface Props { onBack: () => void; }

const CAR_MAKES = ['Toyota', 'Honda', 'Nissan', 'Suzuki', 'Mitsubishi', 'Hyundai', 'Kia', 'BMW', 'Mercedes', 'Other'];
const COLORS = ['White', 'Black', 'Silver', 'Blue', 'Red', 'Green', 'Grey', 'Brown', 'Other'];

const AddVehicleView = ({ onBack }: Props) => {
  const { user } = useApp();
  const [make, setMake] = useState('Toyota');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('White');
  const [plate, setPlate] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const isValid = model.trim().length >= 2 && plate.trim().length >= 4;

  const handleSave = async () => {
    if (!user || !isValid) return;
    setLoading(true);
    setError('');

    const { error: insertError } = await supabase
      .from('vehicles')
      .insert({
        user_id: user.id,
        make,
        model: model.trim(),
        color,
        plate: plate.trim().toUpperCase(),
      });

    setLoading(false);

    if (insertError) {
      setError('Could not save vehicle. Please try again.');
      return;
    }

    setSaved(true);
    setTimeout(onBack, 1800);
  };

  const handleDelete = async (vehicleId: string) => {
    await supabase.from('vehicles').delete().eq('id', vehicleId);
    onBack(); // Trigger refresh via parent
  };

  if (saved) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 }}>
        <CheckCircle size={56} color="var(--primary)" />
        <h2 style={{ fontSize: 20, fontWeight: 800 }}>Vehicle Added!</h2>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>{color} {make} {model} saved to your profile.</p>
      </div>
    );
  }

  return (
    <div className="page-scroll">
      <div className="page-header">
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', marginBottom: 8 }}>
          <ChevronLeft size={20} /> Back
        </button>
        <h1 className="page-title">Add Vehicle</h1>
        <p className="page-subtitle">Required to post rides as a driver</p>
      </div>

      <div className="section">
        {/* Existing Vehicles */}
        {user?.vehicles && user.vehicles.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div className="section-title">My Vehicles</div>
            {user.vehicles.map((v: Vehicle) => (
              <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Car size={20} color="var(--primary)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{v.color} {v.make} {v.model}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Plate: {v.plate}</div>
                </div>
                <button onClick={() => handleDelete(v.id)} style={{ color: 'var(--danger)' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="section-title">Add New Vehicle</div>

        {error && (
          <div style={{ color: '#991B1B', background: '#FEE2E2', borderRadius: 'var(--radius-md)', padding: '10px 12px', fontSize: 13, marginBottom: 12 }}>{error}</div>
        )}

        <div className="form-group">
          <label className="form-label">Make / Brand</label>
          <select className="form-input" value={make} onChange={e => setMake(e.target.value)}>
            {CAR_MAKES.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Model</label>
          <input type="text" className="form-input" placeholder="e.g. Axio, Civic, Sunny" value={model} onChange={e => setModel(e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Color</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {COLORS.map(c => (
              <button key={c} type="button" onClick={() => setColor(c)}
                style={{ padding: '7px 14px', borderRadius: 'var(--radius-full)', fontSize: 13, fontWeight: 500, cursor: 'pointer', border: `1.5px solid ${color === c ? 'var(--primary)' : 'var(--border)'}`, background: color === c ? 'var(--primary-light)' : 'var(--surface)', color: color === c ? 'var(--primary-dark)' : 'var(--text-sub)', transition: 'var(--transition)' }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">License Plate</label>
          <input type="text" className="form-input" placeholder="e.g. DHAKA METRO GA 11-1234" value={plate} onChange={e => setPlate(e.target.value)} style={{ textTransform: 'uppercase' }} />
        </div>

        <button className="btn btn-primary btn-block" onClick={handleSave} disabled={!isValid || loading} style={{ opacity: (!isValid || loading) ? 0.5 : 1 }}>
          <Plus size={18} /> {loading ? 'Saving...' : 'Save Vehicle'}
        </button>
      </div>
    </div>
  );
};

export default AddVehicleView;
