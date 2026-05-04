import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const RequestFood = () => {
  const { user } = useAuth();
  return (
    <div style={{ paddingTop: 80, minHeight: '100vh' }}>
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '40px 24px 0' }}>
        <div className="container">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(28px,4vw,44px)', marginBottom: 8 }}>
            Request <span className="text-gradient">Food Donations</span>
          </motion.h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 40 }}>NGOs and receivers can browse and request available food</p>
        </div>
      </div>
      <div className="container" style={{ padding: '60px 24px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 80, marginBottom: 24 }}>🏢</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, marginBottom: 16 }}>Are you an NGO or receiver?</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 36 }}>
            Browse available food donations in your area and send pickup requests directly to donors. Create a receiver account to get started.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/browse" className="btn btn-primary btn-lg">Browse Available Food</Link>
            {!user && <Link to="/register?role=receiver" className="btn btn-secondary btn-lg">Register as NGO</Link>}
            {user?.role === 'receiver' && <Link to="/dashboard" className="btn btn-secondary btn-lg">My Dashboard</Link>}
          </div>
          <div style={{ marginTop: 60, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 20 }}>
            {[['🔍','Browse','Search food by category, location, and availability'],['📝','Request','Send a pickup request to the donor with your details'],['🤝','Collect','Coordinate pickup time and collect the donation']].map(([icon,title,desc]) => (
              <div key={title} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>{icon}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 8 }}>{title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestFood;
