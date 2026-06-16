import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import './styles/globals.css';

const Home       = lazy(() => import('./pages/Home'));
const Browse     = lazy(() => import('./pages/Browse'));
const FoodDetail = lazy(() => import('./pages/FoodDetail'));
const DonateFood = lazy(() => import('./pages/DonateFood'));
const RequestFood= lazy(() => import('./pages/RequestFood'));
const Auth       = lazy(() => import('./pages/Auth'));
const Dashboard  = lazy(() => import('./pages/Dashboard'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
    <div style={{
      width: 44, height: 44, borderRadius: '50%',
      border: '3px solid rgba(255,255,255,0.08)',
      borderTopColor: 'var(--accent-green)',
      animation: 'spin 0.7s linear infinite',
    }} />
    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading…</p>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

const AppInner = () => {
  const { loading } = useAuth();
  if (loading) return <PageLoader />;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"         element={<Home />} />
            <Route path="/browse"   element={<Browse />} />
            <Route path="/food/:id" element={<FoodDetail />} />
            <Route path="/request"  element={<RequestFood />} />

            <Route path="/donate"   element={
              <ProtectedRoute roles={['donor','admin']}>
                <DonateFood />
              </ProtectedRoute>
            }/>
            <Route path="/edit/:id" element={
              <ProtectedRoute roles={['donor','admin']}>
                <DonateFood />
              </ProtectedRoute>
            }/>

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }/>

            <Route path="/admin" element={
              <ProtectedRoute roles={['admin']}>
                <AdminPanel />
              </ProtectedRoute>
            }/>

            <Route path="/login"    element={<GuestRoute><Auth mode="login" /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Auth mode="register" /></GuestRoute>} />

            <Route path="*" element={
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', gap: 16 }}>
                <div style={{ fontSize: 72 }}>🍽️</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28 }}>Page Not Found</h2>
                <p style={{ color: 'var(--text-secondary)' }}>The page you're looking for doesn't exist.</p>
                <a href="/" className="btn btn-primary" style={{ marginTop: 8 }}>← Go Home</a>
              </div>
            }/>
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <AppInner />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#111827',
                color: '#f0f4ff',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                fontSize: 14,
                fontFamily: 'DM Sans, sans-serif',
              },
              success: { iconTheme: { primary: '#00e676', secondary: '#060810' } },
              error:   { iconTheme: { primary: '#f44336', secondary: '#fff' } },
            }}
          />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
