import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', padding: '60px 24px 30px' }}>
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 40 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#00e676,#00bfa5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🌿</div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18 }}>Food<span style={{ color: 'var(--accent-green)' }}>Saver</span></span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.7 }}>Fighting food waste, one meal at a time. Connect donors with those in need.</p>
        </div>
        <div>
          <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16, fontSize: 14, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Platform</h4>
          {[['Browse Food','/browse'],['Donate Food','/donate'],['Request Food','/request']].map(([label,to]) => (
            <Link key={to} to={to} style={{ display: 'block', color: 'var(--text-muted)', fontSize: 14, marginBottom: 10, transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = 'var(--accent-green)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>{label}</Link>
          ))}
        </div>
        <div>
          <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16, fontSize: 14, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Account</h4>
          {[['Dashboard','/dashboard'],['Login','/login'],['Register','/register']].map(([label,to]) => (
            <Link key={to} to={to} style={{ display: 'block', color: 'var(--text-muted)', fontSize: 14, marginBottom: 10 }}>{label}</Link>
          ))}
        </div>
        <div>
          <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16, fontSize: 14, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Impact</h4>
          {[['🍽️ Meals Provided: 12,480+'],['🌍 CO₂ Saved: 3.2 tons'],['💧 Water Saved: 1.2M L'],['👥 Active Members: 2,400+']].map((item,i) => (
            <p key={i} style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 8 }}>{item}</p>
          ))}
        </div>
      </div>
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>© 2025 FoodSaver. All rights reserved.</p>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Built with 💚 to fight food waste</p>
      </div>
    </div>
  </footer>
);

export default Footer;
