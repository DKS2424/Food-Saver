import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { timeAgo } from '../utils/helpers';

const AdminPanel = () => {
  const { user } = useAuth();

  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [donors, setDonors] = useState([]);
  const [receivers, setReceivers] = useState([]);
  const [listings, setListings] = useState([]);
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

  // UPDATE LISTING
  const updateListing = async () => {
    try {
      await api.put(`/admin/listings/${editListing._id}`, editListing);
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
        {['stats','donors','receivers','listings'].map(t => (
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

      {/* 🔥 LISTINGS UI UPGRADE */}
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
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontWeight: 600 }}>{l.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                👤 {l.donor?.name || 'Unknown'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-sm"
                style={{ background: '#7c3aed', color: '#fff' }}
                onClick={() => setEditListing(l)}
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

      {/* EDIT LISTING */}
      {editListing && (
        <div className="modal">
          <input
            value={editListing.title}
            onChange={e => setEditListing({...editListing, title: e.target.value})}
          />
          <button onClick={updateListing}>Save</button>
        </div>
      )}

    </div>
  </div>
);
};

export default AdminPanel;