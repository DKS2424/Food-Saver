import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { timeAgo, getTimeLeft, categoryEmoji, getImageUrl } from '../utils/helpers';
import AdminPanel from './AdminPanel';

const StatBox = ({ icon, value, label, color = 'var(--accent-green)' }) => (
  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px', display: 'flex', alignItems: 'center', gap: 16 }}>
    <div style={{ width: 52, height: 52, borderRadius: 14, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{icon}</div>
    <div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color }}>{value}</div>
      <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 2 }}>{label}</div>
    </div>
  </div>
);

const RequestCard = ({ request, onAction, isIncoming }) => {
  const timeLeft = request.foodListing ? getTimeLeft(request.foodListing.expiryTime) : null;
  const [acting, setActing] = useState(false);

  const handleAction = async (status) => {
    setActing(true);
    await onAction(request._id, status);
    setActing(false);
  };

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      {request.foodListing?.images?.[0] && (
        <img src={getImageUrl(request.foodListing.images[0])} alt="" style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }}
          onError={e => e.target.style.display = 'none'} />
      )}
      <div style={{ flex: 1, minWidth: 180 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
          <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>{request.foodListing?.title || 'Unknown'}</h4>
          <span className={`badge badge-${request.status}`}>{request.status}</span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8 }}>
          {isIncoming ? `From: ${request.requester?.name}` : `To: ${request.donor?.name}`}
          {request.foodListing?.location?.city && ` · 📍 ${request.foodListing.location.city}`}
        </p>
        {(request.quantityRequested || request.requesterPhone) && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
            {request.quantityRequested && <span>📦 {request.quantityRequested} {request.quantityUnit} needed</span>}
            {request.requesterPhone && <span> · 📞 {request.requesterPhone}</span>}
          </p>
        )}
        {request.message && <p style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 8 }}>"{request.message}"</p>}
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{timeAgo(request.createdAt)}</span>
      </div>
      {isIncoming && request.status === 'pending' && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button disabled={acting} onClick={() => handleAction('approved')} className="btn btn-primary btn-sm">✅ Approve</button>
          <button disabled={acting} onClick={() => handleAction('rejected')} className="btn btn-danger btn-sm">✗ Reject</button>
        </div>
      )}
      {isIncoming && request.status === 'approved' && (
        <button disabled={acting} onClick={() => handleAction('completed')} className="btn btn-primary btn-sm">🎉 Mark Done</button>
      )}
    </div>
  );
};

const Dashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [listings, setListings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [dashRes] = await Promise.all([api.get('/users/dashboard/stats')]);
      const { stats: s, listings: l, history: h } = dashRes.data.data;
      setStats(s); setListings(l); setHistory(h);

      if (user?.role === 'receiver') {
        const reqRes = await api.get('/requests/my');
        setRequests(reqRes.data.data || []);
      }
      if (user?.role === 'donor' || user?.role === 'admin') {
        const incRes = await api.get('/requests/incoming');
        setIncomingRequests(incRes.data.data || []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleRequestAction = async (id, status) => {
    try {
      await api.put(`/requests/${id}/status`, { status });
      toast.success(`Request ${status}!`);
      loadDashboard();
    } catch (e) { toast.error('Action failed'); }
  };

  const handleDeleteListing = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await api.delete(`/food/${id}`);
      toast.success('Listing deleted');
      setListings(prev => prev.filter(l => l._id !== id));
    } catch (e) { toast.error('Delete failed'); }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await api.put('/notifications/read-all');
      if (user?.notifications) {
        updateUser({ notifications: user.notifications.map(n => ({ ...n, read: true })) });
      }
      toast.success('All notifications read');
    } catch (e) {}
    finally { setMarkingAll(false); }
  };

  if (!user) return null;

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    user.role !== 'receiver' && { id: 'listings', label: '🍱 My Listings' },
    user.role !== 'receiver' && { id: 'incoming', label: `📥 Requests ${incomingRequests.filter(r => r.status === 'pending').length > 0 ? `(${incomingRequests.filter(r => r.status === 'pending').length})` : ''}` },
    user.role === 'receiver' && { id: 'myrequests', label: '📤 My Requests' },
    { id: 'history', label: '📜 History' },
    { id: 'notifications', label: `🔔 Alerts ${stats?.unreadNotifs > 0 ? `(${stats.unreadNotifs})` : ''}` },
    user.role === 'admin' && { id: 'admin', label: '⚙️ Admin' },
  ].filter(Boolean);

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '28px 24px' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(22px,3vw,32px)', marginBottom: 4 }}>
              Welcome back, <span className="text-gradient">{user.name}</span> 👋
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              {user.role === 'donor' ? '🍱 Donor' : user.role === 'receiver' ? '🏢 Receiver / NGO' : '⚙️ Admin'} 
              {user.organization && ` · ${user.organization}`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {user.role !== 'receiver' && <Link to="/donate" className="btn btn-primary btn-sm">+ New Listing</Link>}
            {user.role === 'receiver' && <Link to="/browse" className="btn btn-primary btn-sm">Browse Food</Link>}
            <button onClick={logout} className="btn btn-secondary btn-sm">Sign Out</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)', padding: '0 24px', overflowX: 'auto' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 0, minWidth: 'max-content' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '16px 20px', background: 'none', border: 'none', fontSize: 14, fontWeight: 600,
              color: tab === t.id ? 'var(--accent-green)' : 'var(--text-secondary)',
              borderBottom: `2px solid ${tab === t.id ? 'var(--accent-green)' : 'transparent'}`,
              transition: 'all 0.2s', whiteSpace: 'nowrap',
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 20 }}>
            {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 'var(--radius)' }} />)}
          </div>
        ) : (
          <motion.div key={tab} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {/* Overview */}
            {tab === 'overview' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginBottom: 32 }}>
                  {user.role !== 'receiver' && <StatBox icon="🍱" value={stats?.totalListings || 0} label="Total Listings" />}
                  {user.role !== 'receiver' && <StatBox icon="✅" value={stats?.activeListing || 0} label="Active Now" color="var(--accent-green)" />}
                  {user.role !== 'receiver' && <StatBox icon="🤝" value={stats?.totalDonations || 0} label="Donations" color="var(--accent-teal)" />}
                  {user.role === 'receiver' && <StatBox icon="📦" value={stats?.totalReceived || 0} label="Food Received" color="var(--accent-teal)" />}
                  <StatBox icon="🍽️" value={stats?.mealsProvided || 0} label="Meals Provided" color="var(--accent-orange)" />
                  <StatBox icon="🌍" value={`${stats?.co2Saved || 0}kg`} label="CO₂ Saved" color="#7c3aed" />
                </div>
                {/* Recent listings preview */}
                {listings.length > 0 && (
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Recent Listings</h3>
                    <div style={{ display: 'grid', gap: 12 }}>
                      {listings.slice(0, 4).map(l => (
                        <div key={l._id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 24 }}>{categoryEmoji[l.category]}</span>
                          <div style={{ flex: 1, minWidth: 140 }}>
                            <Link to={`/food/${l._id}`} style={{ fontWeight: 600, fontSize: 15, display: 'block', marginBottom: 2 }}>{l.title}</Link>
                            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{timeAgo(l.createdAt)} · {l.location?.city}</span>
                          </div>
                          <span className={`badge badge-${l.status}`}>{l.status}</span>
                          <span style={{ color: getTimeLeft(l.expiryTime).color, fontSize: 13, fontWeight: 600 }}>{getTimeLeft(l.expiryTime).text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* My Listings */}
            {tab === 'listings' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20 }}>My Food Listings</h3>
                  <Link to="/donate" className="btn btn-primary btn-sm">+ Add New</Link>
                </div>
                {listings.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🍽️</div>
                    <p>No listings yet. <Link to="/donate" style={{ color: 'var(--accent-green)' }}>Create your first!</Link></p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: 12 }}>
                    {listings.map(l => (
                      <div key={l._id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                        {l.images?.[0] && <img src={getImageUrl(l.images[0])} alt="" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 10 }} onError={e => e.target.style.display='none'} />}
                        <div style={{ flex: 1, minWidth: 150 }}>
                          <Link to={`/food/${l._id}`} style={{ fontWeight: 700, fontSize: 15 }}>{l.title}</Link>
                          <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 3 }}>{l.quantity} {l.quantityUnit} · {l.location?.city} · {timeAgo(l.createdAt)}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <span className={`badge badge-${l.status}`}>{l.status}</span>
                          <span style={{ fontSize: 12, color: getTimeLeft(l.expiryTime).color }}>{getTimeLeft(l.expiryTime).text}</span>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>👁 {l.views}</span>
                          {l.status === 'available' && <Link to={`/edit/${l._id}`} className="btn btn-secondary btn-sm">Edit</Link>}
                          <button onClick={() => handleDeleteListing(l._id)} className="btn btn-danger btn-sm">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Incoming Requests */}
            {tab === 'incoming' && (
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, marginBottom: 20 }}>Incoming Requests</h3>
                {incomingRequests.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>📥</div>
                    <p>No requests yet. Make sure your listings are active!</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {incomingRequests.map(r => <RequestCard key={r._id} request={r} onAction={handleRequestAction} isIncoming={true} />)}
                  </div>
                )}
              </div>
            )}

            {/* My Requests (receiver) */}
            {tab === 'myrequests' && (
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, marginBottom: 20 }}>My Food Requests</h3>
                {requests.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>📤</div>
                    <p>No requests yet. <Link to="/browse" style={{ color: 'var(--accent-green)' }}>Browse available food!</Link></p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {requests.map(r => <RequestCard key={r._id} request={r} onAction={handleRequestAction} isIncoming={false} />)}
                  </div>
                )}
              </div>
            )}

            {/* History */}
            {tab === 'history' && (
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, marginBottom: 20 }}>Donation History</h3>
                {history.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>📜</div>
                    <p>No completed donations yet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {history.map(h => (
                      <div key={h._id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 24 }}>{categoryEmoji[h.category]}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 15 }}>{h.foodListing?.title || 'Food Donation'}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 3 }}>{timeAgo(h.completedAt)}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: 'var(--accent-green)', fontWeight: 600, fontSize: 14 }}>🍽️ {h.impact?.mealsProvided || 4} meals</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>🌍 {h.impact?.co2Saved || 2.5}kg CO₂ saved</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Notifications */}
            {tab === 'notifications' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20 }}>Notifications</h3>
                  <button onClick={handleMarkAllRead} disabled={markingAll} className="btn btn-secondary btn-sm">Mark All Read</button>
                </div>
                {user.notifications?.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🔔</div>
                    <p>No notifications yet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(user.notifications || []).map((n, i) => (
                      <div key={i} style={{ background: n.read ? 'var(--bg-card)' : 'rgba(0,230,118,0.04)', border: `1px solid ${n.read ? 'var(--border)' : 'rgba(0,230,118,0.15)'}`, borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)', marginTop: 6, flexShrink: 0 }} />}
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 14 }}>{n.message}</p>
                          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{timeAgo(n.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
         {tab === 'admin' && (
  <div className="container" style={{ padding: '32px 24px' }}>
    <AdminPanel />
  </div>
)}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
