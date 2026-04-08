import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { booksAPI, transactionsAPI } from '../utils/api';
import toast from 'react-hot-toast';
import './DashboardPage.css';

const STATUS_CLASS = {
  pending:'badge-reserved', accepted:'badge-available',
  completed:'badge-new', cancelled:'badge-sold', rejected:'badge-sold',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab]           = useState('listings');
  const [listings, setListings] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales]       = useState([]);
  const [loading, setLoading]   = useState(true);

  const fetchAll = useCallback(() => {
    setLoading(true);
    Promise.all([
      booksAPI.getMyListings(),
      transactionsAPI.getMy('buyer'),
      transactionsAPI.getMy('seller'),
    ]).then(([lb, lp, ls]) => {
      setListings(lb.data.data);
      setPurchases(lp.data.data);
      setSales(ls.data.data);
    }).catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const deleteBook = async (id) => {
    if (!window.confirm('Delete this listing? This cannot be undone.')) return;
    try {
      await booksAPI.remove(id);
      setListings(l => l.filter(b => b._id !== id));
      toast.success('Listing deleted.');
    } catch { toast.error('Failed to delete.'); }
  };

  const updateTxn = async (id, status) => {
    try {
      await transactionsAPI.updateStatus(id, status);
      toast.success(`Transaction ${status}.`);
      fetchAll();
    } catch { toast.error('Failed to update.'); }
  };

  const avatarUrl = user?.avatar ? `http://localhost:5000${user.avatar}` : null;
  const activeListings = listings.filter(b => b.status === 'available').length;
  const soldCount      = listings.filter(b => b.status === 'sold').length;

  return (
    <div className="page-wrapper">
      <div className="container">

        {/* ── Profile Banner ── */}
        <div className="dash-banner">
          <div className="dash-banner-left">
            <div className="dash-avatar">
              {avatarUrl
                ? <img src={avatarUrl} alt={user.name} />
                : <span>{user.name[0].toUpperCase()}</span>}
            </div>
            <div className="dash-identity">
              <h1 className="dash-name">{user.name}</h1>
              <p className="dash-email">{user.email}</p>
              {user.location && <p className="dash-location">📍 {user.location}</p>}
            </div>
          </div>
          <div className="dash-banner-right">
            <Link to="/add-book" className="btn btn-primary btn-lg">+ List a Book</Link>
            <Link to="/profile"  className="btn btn-ghost btn-sm">Edit Profile</Link>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="dash-stats">
          {[
            { icon:'📚', value: listings.length,  label:'Total Listings' },
            { icon:'🟢', value: activeListings,    label:'Active' },
            { icon:'✅', value: soldCount,          label:'Sold' },
            { icon:'🛒', value: purchases.length,  label:'Purchases Made' },
            { icon:'💰', value: sales.length,       label:'Sale Requests' },
          ].map(s => (
            <div key={s.label} className="dash-stat-card">
              <span className="dsc-icon">{s.icon}</span>
              <span className="dsc-value">{s.value}</span>
              <span className="dsc-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="tabs">
          {[
            { key: 'listings',  label: `My Listings (${listings.length})` },
            { key: 'purchases', label: `Purchases (${purchases.length})` },
            { key: 'sales',     label: `Sale Requests (${sales.length})` },
          ].map(t => (
            <button key={t.key} className={`tab-btn${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="spinner-overlay"><div className="spinner" /></div>
        ) : (
          <>
            {/* My Listings */}
            {tab === 'listings' && (
              listings.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📚</div>
                  <h3>No listings yet</h3>
                  <p>Start earning by listing your first book</p>
                  <Link to="/add-book" className="btn btn-primary" style={{ marginTop:'1.5rem' }}>
                    List Your First Book
                  </Link>
                </div>
              ) : (
                <div className="dash-listings-grid">
                  {listings.map(book => {
                    const img = book.image ? `http://localhost:5000${book.image}` : null;
                    return (
                      <div key={book._id} className="dash-book-card">
                        <Link to={`/books/${book._id}`} className="dash-book-img">
                          {img ? <img src={img} alt={book.title} /> : <span>📖</span>}
                          <span className={`badge badge-${book.status} dash-book-status`}>{book.status}</span>
                        </Link>
                        <div className="dash-book-info">
                          <Link to={`/books/${book._id}`} className="dash-book-title">{book.title}</Link>
                          <p className="dash-book-author">{book.author}</p>
                          <p className="dash-book-price">${book.price?.toFixed(2)}</p>
                        </div>
                        <div className="dash-book-actions">
                          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/books/${book._id}/edit`)}>✏️ Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => deleteBook(book._id)}>🗑️</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* Purchases */}
            {tab === 'purchases' && (
              purchases.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🛒</div>
                  <h3>No purchases yet</h3>
                  <p><Link to="/books">Browse books</Link> to find your next read</p>
                </div>
              ) : (
                <div className="txn-list">
                  {purchases.map(t => (
                    <TxnCard key={t._id} t={t} viewAs="buyer" onUpdate={updateTxn} />
                  ))}
                </div>
              )
            )}

            {/* Sales */}
            {tab === 'sales' && (
              sales.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">💰</div>
                  <h3>No sale requests yet</h3>
                  <p>When someone requests to buy your book, it'll appear here</p>
                </div>
              ) : (
                <div className="txn-list">
                  {sales.map(t => (
                    <TxnCard key={t._id} t={t} viewAs="seller" onUpdate={updateTxn} />
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TxnCard({ t, viewAs, onUpdate }) {
  const other  = viewAs === 'buyer' ? t.seller : t.buyer;
  const img    = t.book?.image ? `http://localhost:5000${t.book.image}` : null;
  const isSeller = viewAs === 'seller';

  return (
    <div className="txn-card card">
      <div className="txn-book-img">
        {img ? <img src={img} alt="" /> : <span>📖</span>}
      </div>
      <div className="txn-info">
        <p className="txn-book-title">{t.bookTitleSnapshot}</p>
        <p className="txn-party">
          {isSeller ? `Buyer: ${other?.name || '—'}` : `Seller: ${other?.name || '—'}`}
        </p>
        <p className="txn-meta">
          <span className={`badge ${t.type === 'swap' ? 'badge-reserved' : 'badge-new'}`}>
            {t.type === 'swap' ? '⇄ Swap' : '💰 Buy'}
          </span>
          {t.type === 'buy' && <span className="txn-amount">${t.amount?.toFixed(2)}</span>}
          <span className="txn-date">{new Date(t.createdAt).toLocaleDateString()}</span>
        </p>
        {t.notes && <p className="txn-notes">"{t.notes}"</p>}
      </div>
      <div className="txn-right">
        <span className={`badge ${STATUS_CLASS[t.status]}`}>{t.status}</span>
        {isSeller && t.status === 'pending' && (
          <div className="txn-actions">
            <button className="btn btn-success btn-sm" onClick={() => onUpdate(t._id, 'accepted')}>Accept</button>
            <button className="btn btn-danger btn-sm" onClick={() => onUpdate(t._id, 'rejected')}>Reject</button>
          </div>
        )}
        {isSeller && t.status === 'accepted' && (
          <button className="btn btn-dark btn-sm" onClick={() => onUpdate(t._id, 'completed')}>Mark Complete</button>
        )}
        {!isSeller && t.status === 'pending' && (
          <button className="btn btn-ghost btn-sm" onClick={() => onUpdate(t._id, 'cancelled')}>Cancel</button>
        )}
      </div>
    </div>
  );
}