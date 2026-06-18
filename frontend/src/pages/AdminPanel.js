import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { timeAgo, categoryEmoji } from '../utils/helpers';

const AdminPanel = () => {
  const { user } = useAuth();

  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [donors, setDonors] = useState([]);
  const [receivers, setReceivers] = useState([]);
  const [listings, setListings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // ADD / EDIT STATES
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDonor, setNewDonor] = useState({
    name: '',
    email: '',
    phone: '',
    organization: ''
  });

  const [editUserData, setEditUserData] = useState(null);
  const [editListing, setEditListing] = useState(null);

  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" />;

  useEffect(() => { loadData(); }, [tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === 'stats') {
        const { data } = await api.get('/admin/stats');
        setStats(data.data);
      } else if (tab === 'donors') {
        const { data } = await api.get('/admin/users', { params: { role: 'donor' } });
        setDonors(data.data || []);
      } else if (tab === 'receivers') {
        const { data } = await api.get('/admin/users', { params: { role: 'receiver' } });
        setReceivers(data.data || []);
      } else if (tab === 'listings') {
        const { data } = await api.get('/admin/listings');
        setListings(data.data || []);
      } else if (tab === 'requests') {
        const { data } = await api.get('/admin/requests');
        setRequests(data.data || []);
      }
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // CREATE DONOR
  const createDonor = async () => {
    try {
      await api.post('/admin/users', { ...newDonor, role: 'donor' });
      toast.success('Donor created');
      setShowAddModal(false);
      loadData();
    } catch {
      toast.error('Failed');
    }
  };

  // DELETE USER
  const deleteUser = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('Deleted');
      loadData();
    } catch {
      toast.error('Failed');
    }
  };

  // TOGGLE USER
  const toggleUser = async (id, name) => {
    try {
      await api.put(`/admin/users/${id}/toggle`);
      toast.success(`${name} updated`);
      loadData();
    } catch {
      toast.error('Failed');
    }
  };

  // UPDATE USER
  const updateUser = async () => {
    try {
      await api.put(`/admin/users/${editUserData._id}`, editUserData);
      toast.success('User updated');
      setEditUserData(null);
      loadData();
    } catch {
      toast.error('Failed');
    }
  };

  // DELETE LISTING
  const deleteListing = async (id) => {
    if (!window.confirm('Delete listing?')) return;
    try {
      await api.delete(`/admin/listings/${id}`);
      toast.success('Deleted');
      loadData();
    } catch {
      toast.error('Failed');
    }
  };

  // UPDATE REQUEST STATUS
  const handleRequestAction = async (id, status) => {
    try {
      await api.put(`/admin/requests/${id}/status`, { status });
      toast.success(`Request ${status}!`);
      loadData();
    } catch { toast.error('Action failed'); }
  };

  // UPDATE LISTING
  const updateListing = async () => {
    try {
      const payload = {
        title: editListing.title,
        description: editListing.description,
        category: editListing.category,
        quantity: editListing.quantity,
        quantityUnit: editListing.quantityUnit,
        expiryTime: editListing.expiryTime,
        status: editListing.status,
        address: editListing.address,
        city: editListing.city,
        pincode: editListing.pincode,
        pickupInstructions: editListing.pickupInstructions || '',
        isVegetarian: editListing.isVegetarian,
        isVegan: editListing.isVegan || false,
        allergens: editListing.allergens || [],
        tags: editListing.tags || [],
      };
      await api.put(`/food/${editListing._id}`, payload);
      toast.success('Listing updated');
      setEditListing(null);
      loadData();
    } catch {
      toast.error('Failed');
    }
  };

  const filterUsers = (list) => {
    const s = search.toLowerCase();
    return list.filter(u =>
      u.name?.toLowerCase().includes(s) ||
      u.email?.toLowerCase().includes(s) ||
      u.organization?.toLowerCase().includes(s)
    );
  };

  const UserCard = ({ u }) => (
  <div style={{
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '18px 20px',
    marginBottom: 12,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }}>

    <div>
      <strong>{u.name}</strong>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
        {u.email}
      </div>
      {u.organization && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          🏢 {u.organization}
        </div>
      )}
    </div>

    <div style={{ display: 'flex', gap: 8 }}>
      <button className="btn btn-sm" onClick={() => toggleUser(u._id, u.name)}>
        {u.isActive ? 'Disable' : 'Enable'}
      </button>

      <button className="btn btn-primary btn-sm" onClick={() => setEditUserData(u)}>
        Edit
      </button>

      <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u._id, u.name)}>
        Delete
      </button>
    </div>
  </div>
);

 // 🔥 ONLY ADD THIS WRAPPER (no removals)

return (

  <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 24
  }}>

    {/* ORIGINAL DIV (UNCHANGED) */}
    <div style={{ padding: 20 }}>

      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        fontSize: 24
      }}>
        Admin Panel
      </h1>

      {/* 🔥 IMPROVED TAB UI (ALREADY GOOD, slight polish added) */}
      <div style={{
        display: 'flex',
        gap: 10,
        marginBottom: 20,
        background: 'var(--bg-card)',
        padding: 10,
        borderRadius: 12,
        border: '1px solid var(--border)'
      }}>
        {['stats','donors','receivers','listings','requests'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13,
              background: tab === t ? 'var(--accent-green)' : 'transparent',
              color: tab === t ? '#000' : 'var(--text-secondary)',
              transition: '0.2s'
            }}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* DONORS */}
      {tab === 'donors' && (
        <>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
            Add Donor
          </button>

          <input
            className="form-input"
            placeholder="Search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ margin: '10px 0' }}
          />

          {filterUsers(donors).map(u => <UserCard key={u._id} u={u} />)}
        </>
      )}

      {/* 🔥 STATS UI (ADD THIS) */}
{tab === 'stats' && stats && (
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 16,
    marginBottom: 20
  }}>

    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: 16
    }}>
     👥 Donors: {stats.donors || 0}
    </div>

    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: 16
    }}>
      🏢 Receivers: {stats.receivers || 0}
    </div>

    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: 16
    }}>
      🍱 Listings: {stats.listings || 0}
    </div>

    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: 16
    }}>
      📦 Donations: {stats.donations || 0}
    </div>

  </div>
)}


      {/* RECEIVERS */}
      {tab === 'receivers' && (
        <>
          {filterUsers(receivers).map(u => <UserCard key={u._id} u={u} />)}
        </>
      )}

      {/* LISTINGS */}
      {tab === 'listings' && (
        listings.map(l => (
          <div key={l._id} style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: 16,
            marginBottom: 10,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8
          }}>
            <div>
              <div style={{ fontWeight: 600 }}>{categoryEmoji[l.category]} {l.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                👤 {l.donor?.name || 'Unknown'} · {l.quantity} {l.quantityUnit} · 📍 {l.location?.city || 'N/A'}
              </div>
              <span className={`badge badge-${l.status}`} style={{ marginTop: 4 }}>{l.status}</span>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-sm"
                style={{ background: '#7c3aed', color: '#fff' }}
                onClick={() => setEditListing({
                  ...l,
                  address: l.location?.address || '',
                  city: l.location?.city || '',
                  pincode: l.location?.pincode || '',
                  allergens: l.allergens?.join(', ') || '',
                  tags: l.tags?.join(', ') || '',
                })}
              >
                Edit
              </button>

              <button
                className="btn btn-danger btn-sm"
                onClick={() => deleteListing(l._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}

      {/* REQUESTS */}
      {tab === 'requests' && (
        requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📥</div>
            <p>No requests yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {requests.map(r => (
              <div key={r._id} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: 16, display: 'flex',
                alignItems: 'center', gap: 12, flexWrap: 'wrap'
              }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: 14 }}>{r.foodListing?.title || 'Unknown'}</strong>
                    <span className={`badge badge-${r.status}`}>{r.status}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    🏢 {r.requester?.name || 'N/A'} ({r.requester?.organization || 'NGO'})
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    🍱 Donor: {r.donor?.name || 'N/A'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    📦 {r.quantityRequested} {r.quantityUnit} needed · 📞 {r.requesterPhone || r.requester?.phone || 'N/A'}
                    {r.pickupTime && ` · 🕐 ${new Date(r.pickupTime).toLocaleDateString()}`}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {r.status === 'pending' && (
                    <>
                      <button className="btn btn-primary btn-sm" onClick={() => handleRequestAction(r._id, 'approved')}>
                        ✅ Approve
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleRequestAction(r._id, 'cancelled')}>
                        ✗ Cancel
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleRequestAction(r._id, 'rejected')}>
                        ✗ Reject
                      </button>
                    </>
                  )}
                  {r.status === 'approved' && (
                    <>
                      <button className="btn btn-primary btn-sm" onClick={() => handleRequestAction(r._id, 'completed')}>
                        🎉 Complete
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleRequestAction(r._id, 'cancelled')}>
                        ✗ Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ADD MODAL */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            padding: 20,
            borderRadius: 12,
            border: '1px solid var(--border)'
          }}>
            <input
              className="form-input"
              placeholder="Name"
              onChange={e => setNewDonor({...newDonor, name: e.target.value})}
            />
            <button className="btn btn-primary btn-sm" onClick={createDonor}>
              Create
            </button>
          </div>
        </div>
      )}

      {/* EDIT USER */}
      {editUserData && (
        <div className="modal">
          <input
            value={editUserData.name}
            onChange={e => setEditUserData({...editUserData, name: e.target.value})}
          />
          <button onClick={updateUser}>Save</button>
        </div>
      )}

      {/* EDIT LISTING MODAL */}
      {editListing && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }} onClick={() => setEditListing(null)}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
            padding: 28, maxWidth: 560, width: '100%', maxHeight: '85vh', overflowY: 'auto'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 20 }}>
              ✏️ Edit Listing — {editListing.title}
            </h3>

            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-input" value={editListing.title} onChange={e => setEditListing({...editListing, title: e.target.value})} />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" value={editListing.description || ''} onChange={e => setEditListing({...editListing, description: e.target.value})} style={{ minHeight: 70, resize: 'vertical' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" value={editListing.category} onChange={e => setEditListing({...editListing, category: e.target.value})}>
                  {['cooked-meals','raw-vegetables','fruits','dairy','bakery','packaged','beverages','other'].map(c => (
                    <option key={c} value={c}>{c.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input" value={editListing.status} onChange={e => setEditListing({...editListing, status: e.target.value})}>
                  {['available','pending','claimed','expired','cancelled'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input className="form-input" value={editListing.quantity || ''} onChange={e => setEditListing({...editListing, quantity: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Unit</label>
                <select className="form-input" value={editListing.quantityUnit} onChange={e => setEditListing({...editListing, quantityUnit: e.target.value})}>
                  {['kg','liter','pieces','servings','packets'].map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Expiry Time</label>
              <input className="form-input" type="datetime-local" value={editListing.expiryTime ? new Date(editListing.expiryTime).toISOString().slice(0, 16) : ''} onChange={e => setEditListing({...editListing, expiryTime: e.target.value})} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Address</label>
                <input className="form-input" value={editListing.address || ''} onChange={e => setEditListing({...editListing, address: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-input" value={editListing.city || ''} onChange={e => setEditListing({...editListing, city: e.target.value})} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Pincode</label>
              <input className="form-input" value={editListing.pincode || ''} onChange={e => setEditListing({...editListing, pincode: e.target.value})} />
            </div>

            <div className="form-group">
              <label className="form-label">Pickup Instructions</label>
              <textarea className="form-input" value={editListing.pickupInstructions || ''} onChange={e => setEditListing({...editListing, pickupInstructions: e.target.value})} style={{ minHeight: 50, resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
                <input type="checkbox" checked={editListing.isVegetarian} onChange={e => setEditListing({...editListing, isVegetarian: e.target.checked})} style={{ accentColor: 'var(--accent-green)' }} />
                🌱 Vegetarian
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
                <input type="checkbox" checked={editListing.isVegan} onChange={e => setEditListing({...editListing, isVegan: e.target.checked})} style={{ accentColor: 'var(--accent-green)' }} />
                🌿 Vegan
              </label>
            </div>

            <div className="form-group">
              <label className="form-label">Allergens (comma-separated)</label>
              <input className="form-input" value={editListing.allergens || ''} onChange={e => setEditListing({...editListing, allergens: e.target.value})} placeholder="nuts, gluten, dairy" />
            </div>

            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Tags (comma-separated)</label>
              <input className="form-input" value={editListing.tags || ''} onChange={e => setEditListing({...editListing, tags: e.target.value})} placeholder="hot-food, ready-to-eat" />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={updateListing} className="btn btn-primary" style={{ flex: 1 }}>💾 Save Changes</button>
              <button onClick={() => setEditListing(null)} className="btn btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  </div>
);
};

export default AdminPanel;