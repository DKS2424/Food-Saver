import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();

  const unread = user?.notifications?.filter(n => !n.read).length || 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const navLinks = [
    { to: '/browse', label: 'Browse Food' },
    { to: '/donate', label: 'Donate' },
    { to: '/request', label: 'Request' },
  ];

  return (
    <motion.nav className="navbar"
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? 'rgba(6,8,16,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : 'none',
        transition: 'all 0.4s ease',
        padding: '0 24px',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 70 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="nav-logo-icon" style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#00e676,#00bfa5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🌿</div>
          <span className="logo-text" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>
            Food<span style={{ color: 'var(--accent-green)' }}>Saver</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, listStyle: 'none' }} className="desktop-nav">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500,
              color: location.pathname === link.to ? 'var(--accent-green)' : 'var(--text-secondary)',
              background: location.pathname === link.to ? 'rgba(0,230,118,0.08)' : 'transparent',
              transition: 'all 0.2s',
            }}>{link.label}</Link>
          ))}
        </div>

        {/* Right side */}
        <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Connection dot */}
          <div className="conn-dot" title={connected ? 'Live' : 'Offline'} style={{
            width: 8, height: 8, borderRadius: '50%',
            background: connected ? 'var(--accent-green)' : '#f44336',
            boxShadow: connected ? '0 0 8px var(--accent-green)' : 'none',
          }} />

          {user ? (
            <>
              {/* Notifications */}
              <div style={{ position: 'relative' }}>
                <button className="nav-bell" onClick={() => setNotifOpen(!notifOpen)} style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                  borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-primary)', fontSize: 18, position: 'relative',
                }}>
                  🔔
                  {unread > 0 && (
                    <span style={{ position: 'absolute', top: -4, right: -4, background: '#f44336', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{unread}</span>
                  )}
                </button>
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="notif-dropdown" style={{ position: 'absolute', right: 0, top: 50, width: 320, maxWidth: 'calc(100vw - 32px)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, fontFamily: 'var(--font-display)' }}>Notifications</span>
                        <Link to="/dashboard" onClick={() => setNotifOpen(false)} style={{ fontSize: 12, color: 'var(--accent-green)' }}>View all</Link>
                      </div>
                      <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                        {user.notifications?.length ? user.notifications.slice(0, 5).map((n, i) => (
                          <div key={i} style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: n.read ? 'transparent' : 'rgba(0,230,118,0.04)', fontSize: 13, color: 'var(--text-secondary)' }}>
                            {!n.read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)', display: 'inline-block', marginRight: 8 }} />}
                            {n.message}
                          </div>
                        )) : (
                          <div style={{ padding: '24px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No notifications yet</div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Avatar */}
              <button className="nav-avatar" onClick={() => navigate('/dashboard')} style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'linear-gradient(135deg,#00e676,#00bfa5)',
                border: '2px solid rgba(0,230,118,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#060810', fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-display)',
              }}>
                {user.name?.charAt(0).toUpperCase()}
              </button>

              <button onClick={logout} className="btn btn-secondary btn-sm sign-out-btn">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm get-started-btn">Get Started</Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: 24, padding: 4 }} className="mobile-menu-btn">
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', padding: '16px 24px 24px' }}>
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} style={{ display: 'block', padding: '14px 0', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 16, fontWeight: 500 }}>{link.label}</Link>
            ))}
            {user ? (
              <button onClick={logout} style={{ marginTop: 20, width: '100%', padding: '14px 0' }} className="btn btn-secondary">Sign Out</button>
            ) : (
              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <Link to="/login" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '14px 0' }}>Login</Link>
                <Link to="/register" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '14px 0' }}>Register</Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .sign-out-btn { display: none !important; }
        }
        @media (max-width: 768px) {
          .navbar > div { height: 64px !important; }
          .nav-right { gap: 8px !important; }
          .conn-dot { display: none !important; }
          .nav-logo-icon { width: 28px !important; height: 28px !important; font-size: 14px !important; }
          .logo-text { font-size: 16px !important; }
          .nav-right .btn-sm { padding: 7px 14px !important; }
          .nav-bell { width: 34px !important; height: 34px !important; }
          .nav-avatar { width: 32px !important; height: 32px !important; }
        }
        @media (max-width: 480px) {
          .navbar { padding: 0 14px !important; }
          .nav-logo-icon { width: 26px !important; height: 26px !important; }
          .logo-text { font-size: 14px !important; }
          .nav-right .btn-sm { padding: 6px 12px !important; font-size: 12px !important; }
          .nav-bell { width: 32px !important; height: 32px !important; }
          .nav-avatar { width: 30px !important; height: 30px !important; }
          .mobile-menu-btn { font-size: 22px !important; }
        }
        @media (max-width: 400px) {
          .get-started-btn { display: none !important; }
        }
        @media (max-width: 360px) {
          .logo-text { display: none !important; }
        }
      `}</style>
    </motion.nav>
  );
};

export default Navbar;
