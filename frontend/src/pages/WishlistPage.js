import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { wishlistAPI } from '../utils/api';
import toast from 'react-hot-toast';
import './WishlistPage.css';

const COND_LABEL = { 'new':'New','like-new':'Like New','good':'Good','fair':'Fair','poor':'Poor' };

export default function WishlistPage() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    wishlistAPI.get()
      .then(({ data }) => setItems(data.data))
      .catch(() => toast.error('Failed to load wishlist'))
      .finally(() => setLoading(false));
  }, []);

  const remove = async (bookId) => {
    try {
      await wishlistAPI.remove(bookId);
      setItems(i => i.filter(item => item.book?._id !== bookId));
      toast.success('Removed from wishlist');
    } catch { toast.error('Failed to remove'); }
  };

  if (loading) return <div className="spinner-overlay"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <span className="section-label">Your saved books</span>
          <h1>Wishlist</h1>
          <p className="section-subtitle">{items.length} saved book{items.length !== 1 ? 's' : ''}</p>
        </div>

        {items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🤍</div>
            <h3>Your wishlist is empty</h3>
            <p>Browse books and save the ones you want — we'll keep them here for you.</p>
            <Link to="/books" className="btn btn-primary" style={{ marginTop:'1.5rem' }}>Browse Books</Link>
          </div>
        ) : (
          <div className="wl-grid">
            {items.map(item => {
              const book = item.book;
              if (!book) return null;
              const img = book.image ? `http://localhost:5000${book.image}` : null;
              const available = book.status === 'available';
              return (
                <div key={item._id} className={`wl-card card${!available ? ' wl-unavailable' : ''}`}>
                  <Link to={`/books/${book._id}`} className="wl-img-wrap">
                    {img
                      ? <img src={img} alt={book.title} />
                      : <div className="wl-img-fallback"><span>📖</span></div>}
                    {!available && <div className="wl-sold-overlay">{book.status}</div>}
                  </Link>
                  <div className="wl-body">
                    <span className="wl-category">{book.category}</span>
                    <Link to={`/books/${book._id}`} className="wl-title">{book.title}</Link>
                    <p className="wl-author">{book.author}</p>
                    <div className="wl-price-row">
                      <span className="wl-price">${book.price?.toFixed(2)}</span>
                      <span className={`badge badge-${book.condition}`}>{COND_LABEL[book.condition]}</span>
                    </div>
                    {book.seller?.name && <p className="wl-seller">by {book.seller.name}</p>}
                    <div className="wl-actions">
                      {available
                        ? <Link to={`/books/${book._id}`} className="btn btn-primary btn-sm">View Listing</Link>
                        : <span className="badge badge-sold">No Longer Available</span>}
                      <button className="btn btn-ghost btn-sm" onClick={() => remove(book._id)}>Remove</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}