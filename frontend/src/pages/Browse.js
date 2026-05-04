import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import FoodCard, { FoodCardSkeleton } from '../components/common/FoodCard';

const CATEGORIES = ['all','cooked-meals','raw-vegetables','fruits','dairy','bakery','packaged','beverages','other'];
const CATEGORY_LABELS = { all:'All Categories','cooked-meals':'Cooked Meals','raw-vegetables':'Vegetables','fruits':'Fruits','dairy':'Dairy','bakery':'Bakery','packaged':'Packaged','beverages':'Beverages','other':'Other' };

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [city, setCity] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const observerRef = useRef();
  const bottomRef = useRef();

  const fetchListings = useCallback(async (pg = 1, reset = false) => {
    if (pg === 1) setLoading(true); else setLoadingMore(true);
    try {
      const params = { page: pg, limit: 12, status: 'available', sort };
      if (category !== 'all') params.category = category;
      if (search) params.search = search;
      if (city) params.city = city;
      const { data } = await api.get('/food', { params });
      const newListings = data.data || [];
      if (reset || pg === 1) setListings(newListings);
      else setListings(prev => [...prev, ...newListings]);
      setHasMore(pg < (data.pagination?.pages || 1));
      setPage(pg);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setLoadingMore(false); }
  }, [category, search, city, sort]);

  useEffect(() => { fetchListings(1, true); }, [category, sort]);
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setCategory(cat);
  }, [searchParams]);

  // Infinite scroll
  useEffect(() => {
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        fetchListings(page + 1);
      }
    }, { threshold: 0.1 });
    if (bottomRef.current) observerRef.current.observe(bottomRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, loadingMore, page, fetchListings]);

  const handleSearch = (e) => { e.preventDefault(); fetchListings(1, true); };

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '40px 24px' }}>
        <div className="container">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(28px,4vw,44px)', marginBottom: 8 }}>
            Browse <span className="text-gradient">Available Food</span>
          </motion.h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>Discover surplus food available in your area</p>

          {/* Search bar */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <input className="form-input" placeholder="🔍 Search food items..." value={search}
              onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
            <input className="form-input" placeholder="📍 City" value={city}
              onChange={e => setCity(e.target.value)} style={{ width: 160 }} />
            <select className="form-input" value={sort} onChange={e => setSort(e.target.value)} style={{ width: 180 }}>
              <option value="-createdAt">Newest First</option>
              <option value="expiryTime">Expiring Soon</option>
              <option value="-requestCount">Most Requested</option>
            </select>
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </div>
      </div>

      {/* Category filters */}
      <div style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)', padding: '16px 24px', overflowX: 'auto' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 8, minWidth: 'max-content' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              style={{ padding: '8px 18px', borderRadius: 100, fontSize: 13, fontWeight: 600, border: '1px solid', transition: 'all 0.2s', whiteSpace: 'nowrap',
                background: category === cat ? 'var(--accent-green)' : 'transparent',
                borderColor: category === cat ? 'var(--accent-green)' : 'var(--border)',
                color: category === cat ? '#060810' : 'var(--text-secondary)',
              }}>
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="container" style={{ padding: '32px 24px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: 24 }}>
            {Array(12).fill(0).map((_, i) => <FoodCardSkeleton key={i} />)}
          </div>
        ) : listings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🕵️</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 12 }}>No Food Found</h3>
            <p>Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>{listings.length} listing{listings.length !== 1 ? 's' : ''} found</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: 24 }}>
              {listings.map((l, i) => <FoodCard key={l._id} listing={l} index={i % 12} />)}
            </div>
            {loadingMore && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: 24, marginTop: 24 }}>
                {Array(3).fill(0).map((_, i) => <FoodCardSkeleton key={i} />)}
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} style={{ height: 40 }} />
      </div>
    </div>
  );
};

export default Browse;
