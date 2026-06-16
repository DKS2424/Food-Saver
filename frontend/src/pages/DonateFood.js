import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['cooked-meals','raw-vegetables','fruits','dairy','bakery','packaged','beverages','other'];
const UNITS = ['kg','liter','pieces','servings','packets'];

const DonateFood = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEditing);
  const [imagePreview, setImagePreview] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', category: 'cooked-meals', quantity: '', quantityUnit: 'kg',
    expiryTime: '', address: '', city: '', pincode: '', pickupInstructions: '',
    isVegetarian: true, isVegan: false, allergens: '', tags: ''
  });

  useEffect(() => {
    if (!id) return;
    api.get(`/food/${id}`).then(({ data }) => {
      if (data.success) {
        const l = data.data;
        setForm({
          title: l.title || '',
          description: l.description || '',
          category: l.category || 'cooked-meals',
          quantity: l.quantity || '',
          quantityUnit: l.quantityUnit || 'kg',
          expiryTime: l.expiryTime ? new Date(l.expiryTime).toISOString().slice(0, 16) : '',
          address: l.location?.address || '',
          city: l.location?.city || '',
          pincode: l.location?.pincode || '',
          pickupInstructions: l.pickupInstructions || '',
          isVegetarian: l.isVegetarian !== false,
          isVegan: l.isVegan || false,
          allergens: l.allergens?.join(', ') || '',
          tags: l.tags?.join(', ') || ''
        });
        setExistingImages(l.images || []);
      }
    }).catch(() => toast.error('Failed to load listing')).finally(() => setPageLoading(false));
  }, [id]);

  if (!user) return <div style={{ paddingTop: 120, textAlign: 'center' }}><p>Please <a href="/login" style={{ color: 'var(--accent-green)' }}>login</a> to {isEditing ? 'edit' : 'donate'} food</p></div>;
  if (user.role === 'receiver') return <div style={{ paddingTop: 120, textAlign: 'center' }}><p>Donor accounts can post food donations</p></div>;
  if (pageLoading) return <div style={{ paddingTop: 120, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map(f => URL.createObjectURL(f));
    setImagePreview(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('category', form.category);
      fd.append('quantity', form.quantity);
      fd.append('quantityUnit', form.quantityUnit);
      fd.append('expiryTime', form.expiryTime);
      fd.append('address', form.address);
      fd.append('city', form.city);
      fd.append('pincode', form.pincode);
      fd.append('pickupInstructions', form.pickupInstructions);
      fd.append('allergens', form.allergens || '');
      fd.append('tags', form.tags || '');
      fd.append('isVegetarian', form.isVegetarian ? 'true' : 'false');
      fd.append('isVegan', form.isVegan ? 'true' : 'false');

      const fileInput = document.querySelector('input[name="images"]');
      if (fileInput?.files?.length) {
        for (const f of fileInput.files) fd.append('images', f);
      }

      const endpoint = isEditing ? `/food/${id}` : '/food';
      const method = isEditing ? api.put : api.post;
      const { data } = await method(endpoint, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (data.success) {
        toast.success(isEditing ? '✅ Listing updated!' : '🎉 Food listing created! Receivers will be notified.');
        navigate(`/food/${data.data._id}`);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} listing`);
    } finally { setLoading(false); }
  };

  const minExpiry = new Date(Date.now() + 30 * 60000).toISOString().slice(0, 16);

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh' }}>
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '40px 24px' }}>
        <div className="container">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(28px,4vw,44px)', marginBottom: 8 }}>
            {isEditing ? 'Edit' : 'Donate'} <span className="text-gradient">{isEditing ? 'Food Listing' : 'Surplus Food'}</span>
          </motion.h1>
          <p style={{ color: 'var(--text-secondary)' }}>{isEditing ? 'Update your food listing details' : 'List your surplus food and help reduce waste'}</p>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px', maxWidth: 800 }}>
        <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} encType="multipart/form-data">
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px', marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 24, fontSize: 20 }}>📋 Food Details</h2>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input name="title" className="form-input" placeholder="e.g. Biryani from wedding banquet" value={form.title} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea name="description" className="form-input" placeholder="Describe the food, its condition, and any relevant details..." value={form.description} onChange={handleChange} required style={{ minHeight: 90, resize: 'vertical' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select name="category" className="form-input" value={form.category} onChange={handleChange}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Quantity *</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input name="quantity" className="form-input" type="number" placeholder="10" value={form.quantity} onChange={handleChange} required style={{ flex: 1 }} />
                  <select name="quantityUnit" className="form-input" value={form.quantityUnit} onChange={handleChange} style={{ width: 100 }}>
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Expiry Time *</label>
              <input name="expiryTime" type="datetime-local" className="form-input" min={minExpiry} value={form.expiryTime} onChange={handleChange} required />
            </div>

            {/* Food Type - Veg / Non-Veg / Vegan */}
            <div className="form-group">
              <label className="form-label">Food Type *</label>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                  padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 500,
                  border: `1px solid ${!form.isVegetarian ? '#f4433680' : 'var(--border)'}`,
                  background: !form.isVegetarian ? 'rgba(244,67,54,0.08)' : 'transparent',
                  transition: 'all 0.2s',
                }}>
                  <input type="radio" name="foodType" value="nonveg"
                    checked={!form.isVegetarian}
                    onChange={() => setForm(prev => ({ ...prev, isVegetarian: false, isVegan: false }))}
                    style={{ accentColor: '#f44336' }} />
                  🍗 Non-Vegetarian
                </label>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                  padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 500,
                  border: `1px solid ${form.isVegetarian && !form.isVegan ? 'rgba(0,230,118,0.5)' : 'var(--border)'}`,
                  background: form.isVegetarian && !form.isVegan ? 'rgba(0,230,118,0.08)' : 'transparent',
                  transition: 'all 0.2s',
                }}>
                  <input type="radio" name="foodType" value="veg"
                    checked={form.isVegetarian && !form.isVegan}
                    onChange={() => setForm(prev => ({ ...prev, isVegetarian: true, isVegan: false }))}
                    style={{ accentColor: 'var(--accent-green)' }} />
                  🌱 Vegetarian
                </label>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                  padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 500,
                  border: `1px solid ${form.isVegan ? 'rgba(0,230,118,0.5)' : 'var(--border)'}`,
                  background: form.isVegan ? 'rgba(0,230,118,0.08)' : 'transparent',
                  transition: 'all 0.2s',
                }}>
                  <input type="radio" name="foodType" value="vegan"
                    checked={form.isVegan}
                    onChange={() => setForm(prev => ({ ...prev, isVegetarian: true, isVegan: true }))}
                    style={{ accentColor: 'var(--accent-green)' }} />
                  🌿 Vegan
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Allergens (comma-separated)</label>
              <input name="allergens" className="form-input" placeholder="e.g. nuts, gluten, dairy" value={form.allergens} onChange={handleChange} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Tags (comma-separated)</label>
              <input name="tags" className="form-input" placeholder="e.g. hot-food, ready-to-eat" value={form.tags} onChange={handleChange} />
            </div>
          </div>

          {/* Location */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px', marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 24, fontSize: 20 }}>📍 Pickup Location</h2>
            <div className="form-group">
              <label className="form-label">Address *</label>
              <input name="address" className="form-input" placeholder="Street address" value={form.address} onChange={handleChange} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">City *</label>
                <input name="city" className="form-input" placeholder="Bangalore" value={form.city} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Pincode</label>
                <input name="pincode" className="form-input" placeholder="560001" value={form.pincode} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Pickup Instructions</label>
              <textarea name="pickupInstructions" className="form-input" placeholder="e.g. Call before arriving, use side entrance..." value={form.pickupInstructions} onChange={handleChange} style={{ minHeight: 70, resize: 'vertical' }} />
            </div>
          </div>

          {/* Images */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px', marginBottom: 32 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 24, fontSize: 20 }}>📸 Photos</h2>
            <label style={{ display: 'block', border: '2px dashed var(--border)', borderRadius: 12, padding: 30, textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-green)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <input type="file" name="images" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImageChange} />
              <div style={{ fontSize: 36, marginBottom: 8 }}>🖼️</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Click to upload photos (max 5, 5MB each)</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>JPG, PNG, WebP supported</p>
            </label>
            {(imagePreview.length > 0 || existingImages.length > 0) && (
              <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                {existingImages.map((src, i) => (
                  <div key={`old-${i}`} style={{ width: 80, height: 80, borderRadius: 10, overflow: 'hidden', border: '2px solid var(--border)', position: 'relative' }}>
                    <img src={src.startsWith('http') ? src : (process.env.REACT_APP_API_URL?.replace('/api','') || '') + src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display='none'} />
                  </div>
                ))}
                {imagePreview.map((src, i) => (
                  <div key={`new-${i}`} style={{ width: 80, height: 80, borderRadius: 10, overflow: 'hidden', border: '2px solid var(--accent-green)' }}>
                    <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
            {loading ? '⏳ Saving...' : isEditing ? '💾 Save Changes' : '🍱 Create Food Listing'}
          </button>
        </motion.form>
      </div>
    </div>
  );
};

export default DonateFood;