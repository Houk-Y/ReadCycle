import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar      from './components/common/Navbar';
import Footer      from './components/common/Footer';

import HomePage        from './pages/HomePage';
import LoginPage       from './pages/LoginPage';
import RegisterPage    from './pages/RegisterPage';
import BooksPage       from './pages/BooksPage';
import BookDetailPage  from './pages/BookDetailPage';
import AddBookPage     from './pages/AddBookPage';
import EditBookPage    from './pages/EditBookPage';
import DashboardPage   from './pages/DashboardPage';
import WishlistPage    from './pages/WishlistPage';
import MessagesPage    from './pages/MessagesPage';
import ProfilePage     from './pages/ProfilePage';
import SellerPage      from './pages/SellerPage';
import AdminPage       from './pages/AdminPage';
import NotFoundPage    from './pages/NotFoundPage';

import './styles/global.css';

const Loading = () => (
  <div className="spinner-overlay" style={{ minHeight:'100vh' }}>
    <div className="spinner" />
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return <Loading />;
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();
  if (loading) return <Loading />;
  return isAdmin ? children : <Navigate to="/" replace />;
};

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/"            element={<HomePage />} />
        <Route path="/login"       element={<LoginPage />} />
        <Route path="/register"    element={<RegisterPage />} />
        <Route path="/books"       element={<BooksPage />} />
        <Route path="/books/:id"   element={<BookDetailPage />} />
        <Route path="/sellers/:id" element={<SellerPage />} />

        {/* Protected */}
        <Route path="/add-book"       element={<ProtectedRoute><AddBookPage /></ProtectedRoute>} />
        <Route path="/books/:id/edit" element={<ProtectedRoute><EditBookPage /></ProtectedRoute>} />
        <Route path="/dashboard"      element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/wishlist"       element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
        <Route path="/messages"       element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
        <Route path="/messages/:conversationId" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
        <Route path="/profile"        element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin"   element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="/admin/*" element={<AdminRoute><AdminPage /></AdminRoute>} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.88rem',
              background: '#1C2B22',
              color: '#F2EDE3',
              border: '1px solid #2E4035',
            },
            success: { iconTheme: { primary: '#5aA87A', secondary: '#F2EDE3' } },
            error:   { iconTheme: { primary: '#B84040', secondary: '#F2EDE3' } },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}