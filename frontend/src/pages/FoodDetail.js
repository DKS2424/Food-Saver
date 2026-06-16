import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { getTimeLeft, categoryEmoji, categoryLabel, formatDateTime, getImageUrl } from '../utils/helpers';

const FoodDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [quantityRequested, setQuantityRequested] = useState('');
  const [quantityUnit, setQuantityUnit] = useState('kg');
  const [requesterPhone, setRequesterPhone] = useState(user?.phone || '');

  useEffect(() => {
    const viewed = JSON.parse(localStorage.getItem('fs_viewed') || '[]');
    const isFirstView = !viewed.includes(id);
    const v = isFirstView ? '1' : '0';
    if (isFirstView) {
      localStorage.setItem('fs_viewed', JSON.stringify([...viewed, id]));
    }

    api.get(`/food/${id}?v=${v}`).then(({ data }) => {
      console.log(`[view-debug] id=${id} sent_v=${v} got_v=${data._v} views=${data.data?.views}`);
      if (data.success) {
        setListing(data.data);
        setQuantityRequested(data.data.quantity || '');
        setQuantityUnit(data.data.quantityUnit || 'kg');
      }
    }).catch(() => toast.error('Failed to load listing')).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (user?.phone) setRequesterPhone(user.phone);
  }, [user]);

  const handleRequest = async () => {
    if (!user) { navigate('/login'); return; }
    if (user.role === 'donor') { toast.error('Switch to a receiver account to request food'); return; }
    setRequesting(true);
    try {
      const { data } = await api.post('/requests', {
        foodListingId: id, message,
        quantityRequested, quantityUnit,
        requesterPhone: requesterPhone || user?.phone
      });
      if (data.success) {
        toast.success('🎉 Request sent! The donor will be notified.');
        setShowForm(false);
        setListing(prev => ({ ...prev, status: 'pending' }));
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to send request');
    } finally { setRequesting(false); }
  };

  if (loading) return (
    <div style={{ paddingTop: 100, minHeight: '100vh' }} className="container">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
        <div className="skeleton" style={{ height: 450, borderRadius: 16 }} />
        <div>
          <div className="skeleton" style={{ height: 40, marginBottom: 16, width: '80%' }} />
          <div className="skeleton" style={{ height: 20, marginBottom: 10, width: '60%' }} />
          <div className="skeleton" style={{ height: 100, marginBottom: 20 }} />
        </div>
      </div>
    </div>
  );

  if (!listing) return <div style={{ paddingTop: 120, textAlign: 'center' }}>Listing not found</div>;

  const timeLeft = getTimeLeft(listing.expiryTime);

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh' }}>
      <div className="container" style={{ padding: '40px 24px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
          ← Back to listings
        </button>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: 40 }}>
          {/* Image */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: 420, background: 'var(--bg-card)', position: 'relative' }}>
              <img src={getImageUrl(listing.images?.[0])} alt={listing.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80'; }} />
              <div style={{ position: 'absolute', top: 16, left: 16 }}>
                <span className={`badge badge-${listing.status}`}>{listing.status}</span>
              </div>
              <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(6,8,16,0.85)', borderRadius: 10, padding: '6px 14px', color: timeLeft.color, fontSize: 13, fontWeight: 600 }}>
                ⏱ {timeLeft.text}
              </div>
            </div>
            {listing.images?.length > 1 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                {listing.images.slice(1).map((img, i) => (
                  <div key={i} style={{ width: 70, height: 70, borderRadius: 10, overflow: 'hidden', border: '2px solid var(--border)' }}>
                    <img src={getImageUrl(img)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 28 }}>{categoryEmoji[listing.category]}</span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{categoryLabel[listing.category]}</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(22px,3vw,32px)', marginBottom: 16, lineHeight: 1.2 }}>{listing.title}</h1>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>{listing.description}</p>

            {/* Details grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              {[
                { icon: '📦', label: 'Quantity', value: `${listing.quantity} ${listing.quantityUnit}` },
                { icon: '📍', label: 'Location', value: listing.location?.city },
                { icon: '📅', label: 'Expires', value: formatDateTime(listing.expiryTime) },
                { icon: '👁', label: 'Views', value: listing.views || 0 },
              ].map((item, i) => (
                <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.icon} {item.label}</div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Flags */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              {listing.isVegetarian && <span className="badge badge-available">🌱 Vegetarian</span>}
              {listing.isVegan && <span className="badge badge-available">🌿 Vegan</span>}
              {listing.allergens?.map(a => <span key={a} className="badge badge-pending">{a}</span>)}
            </div>
            {listing.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
                {listing.tags.map(tag => (
                  <span key={tag} style={{ background: 'rgba(0,188,212,0.1)', border: '1px solid rgba(0,188,212,0.2)', borderRadius: 6, padding: '3px 10px', fontSize: 12, color: 'var(--accent-teal)', fontWeight: 500 }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Donor info */}
            {listing.donor && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#00e676,#00bfa5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: '#060810' }}>
                  {listing.donor.name?.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{listing.donor.name}</div>
                  {listing.donor.organization && <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{listing.donor.organization}</div>}
                  {listing.donor.phone && <div style={{ color: 'var(--accent-green)', fontSize: 13, marginTop: 2 }}>📞 {listing.donor.phone}</div>}
                </div>
                <div style={{ marginLeft: 'auto', color: 'var(--accent-yellow)', fontSize: 14 }}>★ {listing.donor.rating?.toFixed(1) || '5.0'}</div>
              </div>
            )}

            {/* Address */}
            {listing.location?.address && (
              <div style={{ background: 'rgba(0,188,212,0.05)', border: '1px solid rgba(0,188,212,0.15)', borderRadius: 12, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: 'var(--text-secondary)' }}>
                📍 {listing.location.address}, {listing.location.city}
              </div>
            )}

            {/* Action */}
            {listing.status === 'available' && user?.role === 'receiver' && (
              !showForm ? (
                <button onClick={() => setShowForm(true)} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                  Request This Food
                </button>
              ) : (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <div style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontSize: 12 }}>Qty Needed</label>
                      <input className="form-input" type="number" placeholder="Qty" value={quantityRequested} onChange={e => setQuantityRequested(e.target.value)}
                        style={{ padding: '10px 12px' }} />
                    </div>
                    <div style={{ width: 100 }}>
                      <label className="form-label" style={{ fontSize: 12 }}>Unit</label>
                      <select className="form-input" value={quantityUnit} onChange={e => setQuantityUnit(e.target.value)}
                        style={{ padding: '10px 12px' }}>
                        {['kg','liter','pieces','servings','packets'].map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <label className="form-label" style={{ fontSize: 12 }}>Your Phone (donor will see this)</label>
                    <input className="form-input" type="tel" placeholder="+91 98765 43210" value={requesterPhone} onChange={e => setRequesterPhone(e.target.value)}
                      style={{ padding: '10px 12px' }} />
                  </div>
                  <textarea className="form-input" placeholder="Add a message to the donor (optional)..." value={message} onChange={e => setMessage(e.target.value)}
                    style={{ resize: 'vertical', minHeight: 70, marginBottom: 12 }} />
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={handleRequest} disabled={requesting} className="btn btn-primary" style={{ flex: 1 }}>
                      {requesting ? '⏳ Sending...' : '📞 Send Inquiry'}
                    </button>
                    <button onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
                  </div>
                </motion.div>
              )
            )}
            {listing.status !== 'available' && (
              <div style={{ padding: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 12, textAlign: 'center', color: 'var(--text-muted)' }}>
                This listing is no longer available
              </div>
            )}
            {!user && listing.status === 'available' && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Login as a receiver to request this food</p>
                <a href="/login" className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>Login to Request</a>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FoodDetail;
