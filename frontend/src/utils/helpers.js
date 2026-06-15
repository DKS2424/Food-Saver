import { formatDistanceToNow, format, isPast } from 'date-fns';

export const timeAgo = (date) => formatDistanceToNow(new Date(date), { addSuffix: true });
export const formatDate = (date) => format(new Date(date), 'MMM dd, yyyy');
export const formatDateTime = (date) => format(new Date(date), 'MMM dd, yyyy HH:mm');
export const isExpired = (date) => isPast(new Date(date));

export const getTimeLeft = (expiryDate) => {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diff = expiry - now;
  if (diff <= 0) return { text: 'Expired', urgent: true, color: '#f44336' };
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours < 2) return { text: `${hours}h ${mins}m left`, urgent: true, color: '#ff6d00' };
  if (hours < 6) return { text: `${hours}h left`, urgent: true, color: '#ffc107' };
  if (hours < 24) return { text: `${hours}h left`, urgent: false, color: '#00e676' };
  const days = Math.floor(hours / 24);
  return { text: `${days}d left`, urgent: false, color: '#00e676' };
};

export const categoryEmoji = {
  'cooked-meals': '🍱', 'raw-vegetables': '🥦', 'fruits': '🍎',
  'dairy': '🧀', 'bakery': '🍞', 'packaged': '📦', 'beverages': '🥤', 'other': '🥘'
};

export const categoryLabel = {
  'cooked-meals': 'Cooked Meals', 'raw-vegetables': 'Vegetables', 'fruits': 'Fruits',
  'dairy': 'Dairy', 'bakery': 'Bakery', 'packaged': 'Packaged', 'beverages': 'Beverages', 'other': 'Other'
};

export const getImageUrl = (path) => {
  if (!path) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80';
  if (path.startsWith('http')) return path;
  return `${process.env.REACT_APP_API_URL?.replace('/api', '') || ''}${path}`;
};
