import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getTimeLeft, categoryEmoji, getImageUrl, timeAgo } from '../../utils/helpers';

const FoodCard = ({ listing, index = 0 }) => {
  const timeLeft = getTimeLeft(listing.expiryTime);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -6 }}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        transition: 'border-color 0.3s, box-shadow 0.3s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,230,118,0.25)'; e.currentTarget.style.boxShadow = 'var(--shadow-hover)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <Link to={`/food/${listing._id}`}>
        {/* Image */}
        <div style={{ position: 'relative', height: 200, overflow: 'hidden', background: 'var(--bg-secondary)' }}>
          <img
            src={getImageUrl(listing.images?.[0])}
            alt={listing.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'; }}
          />
          {/* Overlay badges */}
          <div style={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className={`badge badge-${listing.status}`}>
              {listing.status === 'available' ? '●' : listing.status === 'pending' ? '◐' : '○'} {listing.status}
            </span>
            <div style={{
              background: 'rgba(6,8,16,0.8)', backdropFilter: 'blur(8px)',
              padding: '4px 10px', borderRadius: 8, fontSize: 12,
              color: timeLeft.color, fontWeight: 600,
              border: `1px solid ${timeLeft.color}33`,
            }}>
              ⏱ {timeLeft.text}
            </div>
          </div>
          {/* Category emoji */}
          <div style={{ position: 'absolute', bottom: 12, right: 12, fontSize: 28, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>
            {categoryEmoji[listing.category] || '🥘'}
          </div>
          {listing.isVegetarian && (
            <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(0,230,118,0.15)', border: '1px solid rgba(0,230,118,0.3)', borderRadius: 6, padding: '2px 8px', fontSize: 11, color: 'var(--accent-green)', fontWeight: 600 }}>
              🌱 VEG
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '16px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 6, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {listing.title}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
            {listing.description}
          </p>

          {listing.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
              {listing.tags.slice(0, 3).map(tag => (
                <span key={tag} style={{ background: 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.15)', borderRadius: 4, padding: '2px 8px', fontSize: 11, color: 'var(--accent-green)', fontWeight: 500 }}>
                  {tag}
                </span>
              ))}
              {listing.tags.length > 3 && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>+{listing.tags.length - 3}</span>}
            </div>
          )}

          {/* Meta row */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
              <span>📍</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {listing.location?.city}
              </span>
              <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 12 }}>{timeAgo(listing.createdAt)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--text-secondary)' }}>
                📦 {listing.quantity} {listing.quantityUnit}
              </span>
              {listing.donor && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#00e676,#00bfa5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#060810', fontWeight: 700 }}>
                    {listing.donor.name?.charAt(0)}
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: 12, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {listing.donor.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export const FoodCardSkeleton = () => (
  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
    <div className="skeleton" style={{ height: 200 }} />
    <div style={{ padding: 16 }}>
      <div className="skeleton" style={{ height: 20, marginBottom: 10, width: '70%' }} />
      <div className="skeleton" style={{ height: 14, marginBottom: 6, width: '90%' }} />
      <div className="skeleton" style={{ height: 14, marginBottom: 16, width: '60%' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className="skeleton" style={{ height: 14, width: '40%' }} />
        <div className="skeleton" style={{ height: 14, width: '30%' }} />
      </div>
    </div>
  </div>
);

export default FoodCard;
