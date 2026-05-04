import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import api from '../utils/api';
import FoodCard, { FoodCardSkeleton } from '../components/common/FoodCard';

const StatCard = ({ value, label, icon, delay }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }} style={{ textAlign: 'center', padding: '32px 24px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36, background: 'var(--gradient-green)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{value}</div>
      <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>{label}</div>
    </motion.div>
  );
};

const FeatureRow = ({ icon, title, desc, accent, reverse, delay }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, x: reverse ? 40 : -40 }} animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.4,0,0.2,1] }}
      style={{ display: 'flex', alignItems: 'center', gap: 40, flexDirection: reverse ? 'row-reverse' : 'row', flexWrap: 'wrap', padding: '40px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: 80, height: 80, borderRadius: 24, background: `${accent}15`, border: `1px solid ${accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 200 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, marginBottom: 10 }}>{title}</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 15 }}>{desc}</p>
      </div>
    </motion.div>
  );
};

const Home = () => {
  const [listings, setListings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [listRes, statRes] = await Promise.all([
          api.get('/food?limit=6&status=available'),
          api.get('/food/stats/summary')
        ]);
        setListings(listRes.data.data || []);
        setStats(statRes.data.data || {});
      } catch (e) {
        // Use fallback demo data
        setListings([]);
        setStats({ total: 1240, available: 89, donations: 3120, mealsProvided: 12480 });
      } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const categories = [
    { emoji: '🍱', label: 'Cooked Meals', value: 'cooked-meals', color: '#ff6d00' },
    { emoji: '🥦', label: 'Vegetables', value: 'raw-vegetables', color: '#00e676' },
    { emoji: '🍎', label: 'Fruits', value: 'fruits', color: '#f44336' },
    { emoji: '🧀', label: 'Dairy', value: 'dairy', color: '#ffd600' },
    { emoji: '🍞', label: 'Bakery', value: 'bakery', color: '#ff8f00' },
    { emoji: '📦', label: 'Packaged', value: 'packaged', color: '#00bcd4' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section ref={heroRef} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', paddingTop: 80 }}>
        {/* Animated background */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(0,230,118,0.07) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', top: '20%', right: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,188,212,0.05) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 70%)' }} />

        {/* Grid lines */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px', maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%)' }} />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="container" css={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', padding: '60px 0' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span style={{ display: 'inline-block', background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.2)', borderRadius: 100, padding: '6px 18px', fontSize: 13, color: 'var(--accent-green)', fontWeight: 600, marginBottom: 32, letterSpacing: '0.05em' }}>
                🌿 FIGHT FOOD WASTE · FEED LIVES
              </span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
              style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(42px, 7vw, 80px)', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 28 }}>
              Don't Waste Food.
              <br />
              <span style={{ background: 'linear-gradient(135deg,#00e676 0%,#00bfa5 50%,#00bcd4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Share It Instead.
              </span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              style={{ fontSize: 18, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 40, maxWidth: 560, margin: '0 auto 40px' }}>
              Connect surplus food from restaurants, events & homes with NGOs and families in need. Real-time, transparent, impactful.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/donate" className="btn btn-primary btn-lg">🍱 Donate Food</Link>
              <Link to="/browse" className="btn btn-secondary btn-lg">Browse Available</Link>
            </motion.div>

            {/* Live counter strip */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
              style={{ display: 'flex', gap: 32, justifyContent: 'center', marginTop: 60, flexWrap: 'wrap' }}>
              {[
                { v: `${stats?.available || 89}+`, l: 'Available Now' },
                { v: `${stats?.donations || '3.1K'}+`, l: 'Total Donations' },
                { v: `${stats?.mealsProvided || '12K'}+`, l: 'Meals Provided' },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: 'var(--accent-green)' }}>{s.v}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.l}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}
          style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', color: 'var(--text-muted)', fontSize: 13, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span>Scroll to explore</span>
          <span style={{ fontSize: 20 }}>↓</span>
        </motion.div>
      </section>

      {/* Categories */}
      <section className="section" style={{ paddingTop: 40 }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(28px,4vw,40px)', marginBottom: 12 }}>Browse by Category</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Find exactly what you need</p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16 }}>
            {categories.map((cat, i) => (
              <motion.div key={cat.value} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                whileHover={{ scale: 1.05, y: -4 }}>
                <Link to={`/browse?category=${cat.value}`} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '24px 16px',
                  background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                  transition: 'all 0.3s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${cat.color}50`; e.currentTarget.style.background = `${cat.color}08`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)'; }}>
                  <span style={{ fontSize: 36 }}>{cat.emoji}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, textAlign: 'center' }}>{cat.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Listings */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(24px,3vw,36px)', marginBottom: 8 }}>Available Right Now</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Fresh donations waiting to be claimed</p>
            </div>
            <Link to="/browse" className="btn btn-secondary">View All →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {loading ? Array(6).fill(0).map((_, i) => <FoodCardSkeleton key={i} />) :
              listings.length ? listings.map((l, i) => <FoodCard key={l._id} listing={l} index={i} />) :
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🍽️</div>
                <p>No listings available yet. <Link to="/donate" style={{ color: 'var(--accent-green)' }}>Be the first to donate!</Link></p>
              </div>
            }
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section">
        <div className="container">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(28px,4vw,42px)', marginBottom: 12 }}>Our Collective Impact</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Every donation makes a measurable difference</p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
            <StatCard value={`${stats?.mealsProvided?.toLocaleString() || '12,480'}+`} label="Meals Provided" icon="🍽️" delay={0} />
            <StatCard value={`${stats?.donations?.toLocaleString() || '3,120'}+`} label="Donations Completed" icon="🤝" delay={0.1} />
            <StatCard value="3.2t" label="CO₂ Saved" icon="🌍" delay={0.2} />
            <StatCard value="2,400+" label="Active Members" icon="👥" delay={0.3} />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(28px,4vw,42px)', marginBottom: 12 }}>How FoodSaver Works</h2>
          </motion.div>
          <FeatureRow icon="📸" title="List Your Surplus Food" accent="#00e676"
            desc="Donors post food items with photos, quantity, expiry time, and pickup location. Takes less than 2 minutes." delay={0} />
          <FeatureRow icon="🔍" title="Discover & Request" reverse accent="#00bcd4"
            desc="NGOs and receivers browse available food by location and category, then send pickup requests with a message." delay={0.1} />
          <FeatureRow icon="🤝" title="Coordinate & Complete" accent="#7c3aed"
            desc="Donors approve requests, coordinate pickup times, and mark donations complete. Track your impact in real-time." delay={0.2} />
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ background: 'linear-gradient(135deg, rgba(0,230,118,0.08) 0%, rgba(0,188,212,0.06) 100%)', border: '1px solid rgba(0,230,118,0.2)', borderRadius: 'var(--radius-lg)', padding: '60px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,230,118,0.1) 0%, transparent 70%)' }} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(28px,5vw,48px)', marginBottom: 16 }}>Ready to Make a Difference?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 36, maxWidth: 500, margin: '0 auto 36px' }}>Join thousands of donors and NGOs already fighting food waste together.</p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register?role=donor" className="btn btn-primary btn-lg">I Want to Donate 🍱</Link>
              <Link to="/register?role=receiver" className="btn btn-secondary btn-lg">I'm an NGO / Receiver</Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
