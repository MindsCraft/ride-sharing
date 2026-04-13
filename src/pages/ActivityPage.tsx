import { useState } from 'react';
import { CheckCircle, Clock, XCircle, ChevronRight, Star, MessageSquare, Loader2, Phone } from 'lucide-react';
import type { RideRequest } from '../context/AppContext';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';


// Modal for counter-offer
const CounterModal = ({ request, onClose, onAccept, onDecline, loading }: {
  request: RideRequest;
  onClose: () => void;
  onAccept: (price: number) => void;
  onDecline: () => void;
  loading: boolean;
}) => {
  const [counter, setCounter] = useState(String(request.offeredPrice));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
            <div className="driver-avatar">{request.riderInitial}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{request.riderName}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--warning)', fontSize: 13 }}>
                <Star size={12} fill="currentColor" /> {request.riderRating}
              </div>
            </div>
          </div>
          {request.message && (
            <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', padding: '10px 12px', marginBottom: 16, fontSize: 14, color: 'var(--text-sub)', display: 'flex', gap: 8 }}>
              <MessageSquare size={14} color="var(--text-muted)" style={{ marginTop: 2, flexShrink: 0 }} />
              "{request.message}"
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Rider offered: <strong style={{ color: 'var(--text-main)' }}>৳{request.offeredPrice}</strong></div>
            <label className="form-label">Update Price (if negotiating)</label>
            <input type="number" className="form-input" value={counter} onChange={e => setCounter(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" style={{ flex: 1, fontSize: 14 }} onClick={() => onAccept(Number(counter))} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={16} /> : '✅ Confirm'}
            </button>
            <button onClick={onDecline} style={{ width: 44, height: 44, borderRadius: 'var(--radius-full)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }} disabled={loading}>
              <XCircle size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActivityPage = () => {
  const { postedRides, myRequests, refreshAppData } = useApp();
  const [tab, setTab] = useState<'my_rides' | 'activity'>('activity');
  const [counterTarget, setCounterTarget] = useState<{ rideId: string; req: RideRequest } | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);

  const pending = myRequests.filter(a => a.status === 'pending');
  const upcoming = myRequests.filter(a => a.status === 'accepted');
  const past = myRequests.filter(a => a.status === 'declined'); // Or actually completed trips? Filter requests for now

  const totalPendingRequests = postedRides.reduce((s, r) => s + r.requests.filter(req => req.status === 'pending').length, 0);

  const handleRequestAction = async (_rideId: string, reqId: string, action: 'accepted' | 'declined', price?: number) => {
    setLoadingAction(true);
    const { error } = await supabase
      .from('ride_requests')
      .update({ 
        status: action,
        ...(price && { offered_price: price })
      })
      .eq('id', reqId);

    if (!error) {
      await refreshAppData();
      setCounterTarget(null);
    }
    setLoadingAction(false);
  };

  const handleCancelRide = async (rideId: string) => {
    const { error } = await supabase
      .from('rides')
      .update({ status: 'cancelled' })
      .eq('id', rideId);

    if (!error) {
      await refreshAppData();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Activity</h1>

        {/* Tab switch */}
        <div style={{ display: 'flex', gap: 0, marginTop: 12, background: 'var(--surface-2)', borderRadius: 'var(--radius-full)', padding: 3 }}>
          <button onClick={() => setTab('activity')} style={{ flex: 1, padding: '8px 0', borderRadius: 'var(--radius-full)', fontSize: 13, fontWeight: 600, background: tab === 'activity' ? 'var(--surface)' : 'none', color: tab === 'activity' ? 'var(--text-main)' : 'var(--text-muted)', boxShadow: tab === 'activity' ? 'var(--shadow-xs)' : 'none', transition: 'var(--transition)' }}>
            My Rides
          </button>
          <button onClick={() => setTab('my_rides')} style={{ flex: 1, padding: '8px 0', borderRadius: 'var(--radius-full)', fontSize: 13, fontWeight: 600, background: tab === 'my_rides' ? 'var(--surface)' : 'none', color: tab === 'my_rides' ? 'var(--text-main)' : 'var(--text-muted)', boxShadow: tab === 'my_rides' ? 'var(--shadow-xs)' : 'none', transition: 'var(--transition)', position: 'relative' }}>
            Driver Inbox
            {totalPendingRequests > 0 && <span style={{ position: 'absolute', top: 4, right: 12, width: 16, height: 16, background: 'var(--danger)', color: 'white', borderRadius: '50%', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{totalPendingRequests}</span>}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 24 }}>
        {/* === MY ACTIVITY TAB === */}
        {tab === 'activity' && (
          <>
            {pending.length > 0 && (
              <div className="section">
                <div className="section-title">⏳ Pending Negotiations</div>
                {pending.map(item => (
                  <div key={item.id} className="activity-card" style={{ borderLeft: '3px solid var(--warning)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>{item.driverName}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{item.from} → {item.to}</div>
                      </div>
                      <span className={`status-pill pending`}>
                        <Clock size={10} /> Awaiting Reply
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>🕐 {item.departureTime}</span>
                      <span style={{ fontWeight: 600, color: 'var(--primary)' }}>৳{item.offeredPrice}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {upcoming.length > 0 && (
              <div className="section">
                <div className="section-title">✅ Upcoming Rides</div>
                {upcoming.map(item => (
                  <div key={item.id} className="activity-card" style={{ borderLeft: '3px solid var(--primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>{item.driverName}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{item.from} → {item.to}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button 
                          onClick={() => item.driverPhone && window.open(`tel:${item.driverPhone}`, '_self')}
                          style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary-light)', border: 'none', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                          <Phone size={12} />
                        </button>
                        <span className={`status-pill confirmed`}>
                          <CheckCircle size={10} /> Confirmed
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>🕐 {item.departureTime}</span>
                      <span style={{ fontWeight: 600, color: 'var(--primary)' }}>৳{item.offeredPrice}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {past.length > 0 && (
              <div className="section">
                <div className="section-title">🕐 Ride History</div>
                {past.map(item => (
                  <div key={item.id} className="activity-card" style={{ cursor: 'pointer', borderLeft: '3px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>{item.driverName}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{item.from} → {item.to}</div>
                      </div>
                      <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 15 }}>৳{item.offeredPrice}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Declined</div>
                        </div>
                        <ChevronRight size={16} color="var(--text-muted)" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {pending.length === 0 && upcoming.length === 0 && past.length === 0 && (
              <div className="empty-state" style={{ marginTop: 60 }}>
                <div className="empty-state-icon"><Clock size={28} color="var(--text-muted)" /></div>
                <h3>No Activity Yet</h3>
                <p>Your ride requests and history will appear here.</p>
              </div>
            )}
          </>
        )}

        {/* === DRIVER INBOX TAB === */}
        {tab === 'my_rides' && (
          <>
            {postedRides.filter(r => r.status !== 'cancelled').length === 0 && (
              <div className="empty-state" style={{ marginTop: 60 }}>
                <div className="empty-state-icon"><span style={{ fontSize: 28 }}>🚗</span></div>
                <h3>No Posted Rides</h3>
                <p>Post your daily commute route to get ride requests from commuters.</p>
              </div>
            )}

            {postedRides.filter(r => r.status !== 'cancelled').map(ride => (
              <div key={ride.id} className="section" style={{ paddingTop: 0 }}>
                {/* Ride header */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 10 }}>
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', background: ride.status === 'full' ? 'var(--primary-light)' : 'var(--surface)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{ride.from} → {ride.to}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>🕐 {ride.time} · 💰 {ride.price} · {ride.isRecurring ? '🔁 Daily' : '1 time'}</div>
                      </div>
                      <span className={`status-pill ${ride.status === 'active' ? 'confirmed' : 'completed'}`}>
                        {ride.status === 'active' ? '🟢 Active' : '🔴 Full'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                      <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-full)', padding: '4px 12px', fontSize: 12, color: 'var(--text-sub)' }}>
                        {ride.seatsLeft}/{ride.seats} seats left
                      </div>
                      <button onClick={() => handleCancelRide(ride.id)} style={{ padding: '4px 12px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)', fontSize: 12, color: 'var(--danger)', cursor: 'pointer' }}>
                        Cancel Ride
                      </button>
                    </div>
                  </div>

                  {/* Requests */}
                  {ride.requests.length === 0
                    ? <div style={{ padding: '20px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>No requests yet. Share your route to get riders!</div>
                    : ride.requests.map(req => (
                        <div key={req.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)', background: req.status !== 'pending' ? 'var(--surface-2)' : 'var(--surface)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)' }}>
                              {req.riderInitial}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, fontSize: 14 }}>{req.riderName}</div>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>⭐ {req.riderRating} · Offered: ৳{req.offeredPrice}</div>
                            </div>
                            {req.status === 'pending'
                              ? <button onClick={() => setCounterTarget({ rideId: ride.id, req })} className="request-btn" style={{ fontSize: 12 }}>
                                  Respond
                                </button>
                              : <div style={{ display: 'flex', gap: 6 }}>
                                  <button 
                                    onClick={() => req.riderPhone && window.open(`tel:${req.riderPhone}`, '_self')}
                                    style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--primary-light)', border: 'none', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                  >
                                    <Phone size={14} />
                                  </button>
                                  <span className={`status-pill ${req.status === 'accepted' ? 'confirmed' : 'completed'}`}>
                                    {req.status === 'accepted' ? '✅ Accepted' : '❌ Declined'}
                                  </span>
                                </div>
                            }
                          </div>
                          {req.message && (
                            <div style={{ marginTop: 8, fontSize: 13, color: 'var(--text-sub)', paddingLeft: 50 }}>"{req.message}"</div>
                          )}
                        </div>
                      ))
                  }
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Counter modal */}
      {counterTarget && (
        <CounterModal
          request={counterTarget.req}
          loading={loadingAction}
          onClose={() => setCounterTarget(null)}
          onAccept={(p) => handleRequestAction(counterTarget.rideId, counterTarget.req.id, 'accepted', p)}
          onDecline={() => handleRequestAction(counterTarget.rideId, counterTarget.req.id, 'declined')}
        />
      )}
    </div>
  );
};

export default ActivityPage;
