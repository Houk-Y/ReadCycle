import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css';

export default function NotFoundPage() {
  return (
    <div className="notfound-page">
      <div className="notfound-inner fade-up">
        <div className="notfound-decoration" aria-hidden="true">
          <div className="nf-books">
            {['#1C2B22','#C9993A','#2E4035','#7A9E87','#243329'].map((c,i) => (
              <div key={i} className="nf-book" style={{ background: c, height: 40 + i*18, width: 16 + (i%2)*8 }} />
            ))}
          </div>
        </div>
        <div className="notfound-code">404</div>
        <h1>Chapter Not Found</h1>
        <p>It seems this page has gone out of print.<br />Let's get you back to the bookshelf.</p>
        <div className="notfound-actions">
          <Link to="/"      className="btn btn-primary btn-lg">Go Home</Link>
          <Link to="/books" className="btn btn-outline btn-lg">Browse Books</Link>
        </div>
      </div>
    </div>
  );
}