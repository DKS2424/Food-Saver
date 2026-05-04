import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const useInfiniteScroll = (endpoint, params = {}, limit = 12) => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async (pg = 1, reset = false) => {
    if (pg === 1) setLoading(true); else setLoadingMore(true);
    try {
      const { data } = await api.get(endpoint, { params: { ...params, page: pg, limit } });
      const newItems = data.data || [];
      if (reset || pg === 1) setItems(newItems);
      else setItems(prev => [...prev, ...newItems]);
      setHasMore(pg < (data.pagination?.pages || 1));
      setPage(pg);
      setError(null);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [endpoint, JSON.stringify(params), limit]);

  const loadMore = () => { if (hasMore && !loadingMore) fetchItems(page + 1); };
  const refresh = () => fetchItems(1, true);

  useEffect(() => { fetchItems(1, true); }, [fetchItems]);

  return { items, loading, loadingMore, hasMore, error, loadMore, refresh, setItems };
};

export default useInfiniteScroll;
