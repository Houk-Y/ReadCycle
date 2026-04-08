import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="footer-logo-mark">RC</span>
              <span>ReadCycle</span>
            </div>
            <p>A marketplace for readers. Buy, sell, and swap second-hand books. Give every story a second life.</p>
            <div className="footer-tagline">📚 Books deserve more than one reader.</div>
          </div>
          <div className="footer-col">
            <h5>Marketplace</h5>
            <Link to="/books">Browse Books</Link>
            <Link to="/add-book">Sell a Book</Link>
            <Link to="/register">Join Free</Link>
          </div>
          <div className="footer-col">
            <h5>Account</h5>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/wishlist">Wishlist</Link>
            <Link to="/messages">Messages</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© {new Date().getFullYear()} ReadCycle — built for book lovers</p>
          <p>All prices in USD</p>
        </div>
      </div>
    </footer>
  );
}