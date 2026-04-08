import React from 'react';
import { Link } from 'react-router-dom';
import './BookCard.css';

const COND_LABEL = { 'new':'New','like-new':'Like New','good':'Good','fair':'Fair','poor':'Poor' };

export default function BookCard({ book }) {
  const img = book.image ? `http://localhost:5000${book.image}` : null;
  return (
    <Link to={`/books/${book._id}`} className="book-card">
      <div className="book-card-img">
        {img
          ? <img src={img} alt={book.title} loading="lazy" />
          : <div className="book-card-fallback"><span>📖</span></div>}
        {book.status !== 'available' && (
          <div className="book-card-sold-overlay">{book.status}</div>
        )}
        {book.allowSwap && <div className="book-card-swap">⇄ Swap OK</div>}
      </div>
      <div className="book-card-body">
        <p className="book-card-category">{book.category}</p>
        <h4 className="book-card-title">{book.title}</h4>
        <p className="book-card-author">{book.author}</p>
        <div className="book-card-footer">
          <span className="book-card-price">${book.price?.toFixed(2)}</span>
          <span className={`badge badge-${book.condition}`}>{COND_LABEL[book.condition]}</span>
        </div>
      </div>
    </Link>
  );
}