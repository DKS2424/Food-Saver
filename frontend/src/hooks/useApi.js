import { useState, useCallback } from 'react';
import api from '../utils/api';

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (method, url, data = null, config = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api[method](url, data, config);
      return res.data;
    } catch (e) {
      const msg = e.response?.data?.message || e.message || 'Request failed';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = (url, config) => request('get', url, null, config);
  const post = (url, data, config) => request('post', url, data, config);
  const put = (url, data, config) => request('put', url, data, config);
  const del = (url, config) => request('delete', url, null, config);

  return { loading, error, get, post, put, delete: del };
};

export default useApi;
