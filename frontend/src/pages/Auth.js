import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Auth = ({ mode = 'login' }) => {
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: searchParams.get('role') || 'donor', phone: '', organization: ''
  });

  useEffect(() => { if (user) navigate('/dashboard'); }, [user, navigate]);
  useEffect(() => { setIsLogin(mode === 'login'); }, [mode]);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLogin && form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      if (isLogin) {
        const data = await login(form.email, form.password);
        if (data.success) { toast.success(`Welcome back, ${data.user.name}! 👋`); navigate('/dashboard'); }
      } else {
        const data = await register(form);
        if (data.success) { toast.success(`Welcome to FoodSaver, ${data.user.name}! 🎉`); navigate('/dashboard'); }
      }
    } catch (e) {
      toast.error(e.response?.data?.message || e.response?.data?.errors?.[0]?.msg || 'Authentication failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px 40px', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(0,230,118,0.06) 0%, transparent 70%)' }} />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg,#00e676,#00bfa5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 16px' }}>🌿</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28 }}>
            Food<span style={{ color: 'var(--accent-green)' }}>Saver</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>Fight food waste, feed lives</p>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '36px' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 4, marginBottom: 28 }}>
            {[['Login', true], ['Register', false]].map(([label, isL]) => (
              <button key={label} onClick={() => setIsLogin(isL)} style={{
                flex: 1, padding: '10px', borderRadius: 8, border: 'none', transition: 'all 0.2s',
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14,
                background: isLogin === isL ? 'var(--accent-green)' : 'transparent',
                color: isLogin === isL ? '#060810' : 'var(--text-secondary)',
              }}>{label}</button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.form key={isLogin ? 'login' : 'register'} initial={{ opacity: 0, x: isLogin ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onSubmit={handleSubmit}>
              {!isLogin && (
                <>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input name="name" className="form-input" placeholder="John Doe" value={form.name} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">I Am A</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {[['donor','🍱 Food Donor'],['receiver','🏢 NGO / Receiver']].map(([val,label]) => (
                        <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: form.role === val ? 'rgba(0,230,118,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${form.role === val ? 'var(--accent-green)' : 'var(--border)'}`, borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                          <input type="radio" name="role" value={val} checked={form.role === val} onChange={handleChange} style={{ accentColor: 'var(--accent-green)' }} />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input name="email" type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
              </div>
              {!isLogin && (
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input name="phone" className="form-input" placeholder="+91 9876543210" value={form.phone} onChange={handleChange} />
                </div>
              )}
              {!isLogin && form.role === 'receiver' && (
                <div className="form-group">
                  <label className="form-label">Organization Name</label>
                  <input name="organization" className="form-input" placeholder="NGO / Trust name" value={form.organization} onChange={handleChange} />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Password</label>
                <input name="password" type="password" className="form-input" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required />
              </div>
              {!isLogin && (
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input name="confirmPassword" type="password" className="form-input" placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange} required />
                </div>
              )}
              <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: 8, padding: '14px' }}>
                {loading ? '⏳ Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </motion.form>
          </AnimatePresence>

          <div style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)', fontSize: 14 }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: 'var(--accent-green)', fontWeight: 600, cursor: 'pointer' }}>
              {isLogin ? 'Register' : 'Sign In'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
