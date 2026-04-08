import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usersAPI, messagesAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import BookCard from '../components/books/BookCard';
import toast from 'react-hot-toast';
import './SellerPage.css';

export default function SellerPage() {
  const { id } = useParams();
  const { user: me, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [seller, setSeller]   = useState(null);
  const [books, setBooks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [contacting, setContacting] = useState(false);

  useEffect(() => {
    usersAPI.getProfile(id)
      .then(({ data }) => { setSeller(data.data.user); setBooks(data.data.books); })
      .catch(() => toast.error('Seller not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleContact = async () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    if (me._id === id) { toast('That\'s your own profile!'); return; }
    setContacting(true);
    try {
      const { data } = await messagesAPI.send({ recipientId: id, content: `Hi! I discovered your ReadCycle profile and I'm interested in your listings.` });
      navigate(`/messages/${data.conversationId}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to send message'); }
    finally { setContacting(false); }
  };

  if (loading) return <div className="spinner-overlay"><div className="spinner" /></div>;

  if (!seller) return (
    <div className="page-wrapper"><div className="container">
      <div className="empty-state">
        <div className="empty-icon">🔍</div>
        <h3>Seller not found</h3>
        <Link to="/books" className="btn btn-primary" style={{ marginTop:'1rem' }}>Browse Books</Link>
      </div>
    </div></div>
  );

  const avatarUrl = seller.avatar ? `http://localhost:5000${seller.avatar}` : null;
  const isMe = isLoggedIn && me._id === id;

  return (
    <div className="page-wrapper">
      <div className="container">

        {/* ── Profile Card ── */}
        <div className="seller-card card">
          <div className="seller-card-inner">
            <div className="seller-avatar">
              {avatarUrl
                ? <img src={avatarUrl} alt={seller.name} />
                : <span>{seller.name[0].toUpperCase()}</span>}
            </div>
            <div className="seller-details">
              <h1 className="seller-name">{seller.name}</h1>
              <div className="seller-meta-row">
                {seller.location && <span className="seller-meta-item">📍 {seller.location}</span>}
                <span className="seller-meta-item">🗓 Member since {new Date(seller.createdAt).getFullYear()}</span>
              </div>
              {seller.bio && <p className="seller-bio">{seller.bio}</p>}
              <div className="seller-stats">
                <div className="seller-stat">
                  <span className="ss-val">{seller.totalListings || 0}</span>
                  <span className="ss-lbl">Listings</span>
                </div>
                <div className="seller-stat-divider" />
                <div className="seller-stat">
                  <span className="ss-val">{seller.totalSales || 0}</span>
                  <span className="ss-lbl">Books Sold</span>
                </div>
                <div className="seller-stat-divider" />
                <div className="seller-stat">
                  <span className="ss-val">{books.length}</span>
                  <span className="ss-lbl">Active Now</span>
                </div>
              </div>
            </div>
            {!isMe && (
              <div className="seller-cta">
                {isLoggedIn ? (
                  <button className="btn btn-primary btn-lg" onClick={handleContact} disabled={contacting}>
                    {contacting ? 'Opening…' : '✉️ Contact Seller'}
                  </button>
                ) : (
                  <Link to="/login" className="btn btn-primary btn-lg">Sign in to Contact</Link>
                )}
              </div>
            )}
            {isMe && (
              <Link to="/profile" className="btn btn-outline btn-lg">Edit Profile</Link>
            )}
          </div>
        </div>

        {/* ── Listings ── */}
        <div style={{ marginTop: '3rem' }}>
          <div className="section-header">
            <div>
              <span className="section-label">Available now</span>
              <h2 className="section-title">Books by {seller.name.split(' ')[0]}</h2>
            </div>
          </div>

          {books.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>No active listings</h3>
              <p>Check back later — {seller.name.split(' ')[0]} might list new books soon.</p>
            </div>
          ) : (
            <div className="books-grid">
              {books.map(b => <BookCard key={b._id} book={b} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}