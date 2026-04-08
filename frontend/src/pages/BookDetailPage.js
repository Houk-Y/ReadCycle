import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { booksAPI, wishlistAPI, transactionsAPI, messagesAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './BookDetailPage.css';

const COND_LABEL = { 'new':'New','like-new':'Like New','good':'Good','fair':'Fair','poor':'Poor' };

export default function BookDetailPage() {
  const { id } = useParams();
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [book, setBook]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [wishlisted, setWishlisted] = useState(false);
  const [buying, setBuying]       = useState(false);
  const [messaging, setMessaging] = useState(false);

  useEffect(() => {
    booksAPI.getOne(id)
      .then(({ data }) => {
        setBook(data.data);
        setWishlisted(data.data.isWishlisted || false);
      })
      .catch(() => { toast.error('Book not found'); navigate('/books'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const toggleWishlist = async () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    try {
      if (wishlisted) {
        await wishlistAPI.remove(id);
        setWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await wishlistAPI.add(id);
        setWishlisted(true);
        toast.success('Added to wishlist ♥');
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
  };

  const handleBuy = async () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    if (!window.confirm(`Buy "${book.title}" for $${book.price.toFixed(2)}? This will send a purchase request to the seller.`)) return;
    setBuying(true);
    try {
      await transactionsAPI.buy({ bookId: id });
      toast.success('Purchase request sent! The seller will contact you. 🎉');
      setBook(b => ({ ...b, status: 'sold' }));
    } catch (err) { toast.error(err.response?.data?.message || 'Purchase failed'); }
    finally { setBuying(false); }
  };

  const handleMessage = async () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    setMessaging(true);
    try {
      const { data } = await messagesAPI.send({ recipientId: book.seller._id, bookId: book._id, content: `Hi! I'm interested in your listing: "${book.title}".` });
      navigate(`/messages/${data.conversationId}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Could not start conversation'); }
    finally { setMessaging(false); }
  };

  if (loading) return <div className="spinner-overlay" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;
  if (!book) return null;

  const img = book.image ? `http://localhost:5000${book.image}` : null;
  const isMine = user && book.seller?._id === user._id;
  const canBuy = isLoggedIn && !isMine && book.status === 'available';

  return (
    <div className="page-wrapper">
      <div className="container">
        <Link to="/books" className="back-link">← Back to Books</Link>

        <div className="detail-layout">
          {/* ── Image Column ── */}
          <div className="detail-image-col">
            <div className="detail-image-wrap">
              {img ? <img src={img} alt={book.title} /> : <div className="detail-no-img"><span>📖</span></div>}
              <div className={`detail-status-ribbon ${book.status !== 'available' ? 'sold' : ''}`}>
                {book.status === 'available' ? 'Available' : book.status}
              </div>
            </div>
            {book.allowSwap && (
              <div className="detail-swap-badge">⇄ Open to book swaps</div>
            )}
          </div>

          {/* ── Info Column ── */}
          <div className="detail-info-col">
            {/* Breadcrumb */}
            <div className="detail-meta-row">
              <span className="badge badge-good">{book.category}</span>
              <span className="detail-views">👁 {book.views} views</span>
            </div>

            <h1 className="detail-title">{book.title}</h1>
            <p className="detail-author">by <strong>{book.author}</strong></p>
            {book.isbn && <p className="detail-isbn">ISBN: {book.isbn}</p>}

            <div className="detail-price-row">
              <span className="detail-price">${book.price.toFixed(2)}</span>
              <span className={`badge badge-${book.condition}`}>{COND_LABEL[book.condition]}</span>
            </div>

            {book.description && (
              <div className="detail-description">
                <h4>About this copy</h4>
                <p>{book.description}</p>
              </div>
            )}

            {/* Seller */}
            {book.seller && (
              <div className="detail-seller">
                <div className="detail-seller-avatar">
                  {book.seller.avatar
                    ? <img src={`http://localhost:5000${book.seller.avatar}`} alt="" />
                    : <span>{book.seller.name[0]}</span>}
                </div>
                <div className="detail-seller-info">
                  <p className="detail-seller-label">Listed by</p>
                  <Link to={`/sellers/${book.seller._id}`} className="detail-seller-name">{book.seller.name}</Link>
                  {book.seller.location && <p className="detail-seller-location">📍 {book.seller.location}</p>}
                  {book.seller.totalSales > 0 && <p className="detail-seller-sales">{book.seller.totalSales} sales</p>}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="detail-actions">
              {isMine ? (
                <div className="detail-own-actions">
                  <div className="alert alert-info" style={{ margin: 0 }}>📌 This is your listing</div>
                  <Link to={`/books/${id}/edit`} className="btn btn-dark btn-lg">✏️ Edit Listing</Link>
                </div>
              ) : canBuy ? (
                <div className="detail-buy-actions">
                  <button onClick={handleBuy} className="btn btn-primary btn-xl" disabled={buying}>
                    {buying ? 'Sending request…' : `Buy for $${book.price.toFixed(2)}`}
                  </button>
                  <button onClick={handleMessage} className="btn btn-outline btn-xl" disabled={messaging}>
                    {messaging ? 'Opening…' : '💬 Message Seller'}
                  </button>
                </div>
              ) : !isLoggedIn ? (
                <div className="detail-buy-actions">
                  <Link to="/login" className="btn btn-primary btn-xl">Sign in to Buy</Link>
                  <button onClick={handleMessage} className="btn btn-outline btn-xl">💬 Message Seller</button>
                </div>
              ) : (
                <div className="alert alert-error">This book is no longer available.</div>
              )}

              <button onClick={toggleWishlist} className={`btn btn-ghost btn-lg wishlist-btn${wishlisted ? ' wishlisted' : ''}`}>
                {wishlisted ? '❤️ In Wishlist' : '🤍 Save to Wishlist'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}