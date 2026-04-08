import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { booksAPI } from '../utils/api';
import BookCard from '../components/books/BookCard';
import './HomePage.css';

const CATEGORIES = [
  { slug: 'fiction',    label: 'Fiction',     icon: '✦' },
  { slug: 'science',    label: 'Science',     icon: '◎' },
  { slug: 'history',    label: 'History',     icon: '◈' },
  { slug: 'biography',  label: 'Biography',   icon: '◉' },
  { slug: 'self-help',  label: 'Self-Help',   icon: '◇' },
  { slug: 'technology', label: 'Technology',  icon: '◆' },
  { slug: 'business',   label: 'Business',    icon: '◐' },
  { slug: 'children',   label: "Children's",  icon: '◑' },
];

export default function HomePage() {
  const [books, setBooks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery]     = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    booksAPI.getAll({ limit: 8, status: 'available', sort: '-createdAt' })
      .then(({ data }) => setBooks(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/books?search=${encodeURIComponent(query.trim())}`);
    else navigate('/books');
  };

  return (
    <div className="home">
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-grid-overlay" />
        </div>
        <div className="container hero-inner">
          <div className="hero-content fade-up">
            <span className="section-label">The book lover's marketplace</span>
            <h1 className="hero-title">
              Every book<br />
              <em>deserves</em> a<br />
              second reader.
            </h1>
            <p className="hero-desc">
              Buy, sell, and swap second-hand books with a community of readers.
              Thousands of titles. Real people. Great prices.
            </p>
            <form className="hero-search" onSubmit={handleSearch}>
              <div className="hero-search-wrap">
                <span className="hero-search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search by title, author, or ISBN…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="hero-search-input"
                />
                <button type="submit" className="btn btn-primary">Search</button>
              </div>
            </form>
            <div className="hero-pills">
              {['Fiction', 'Science', 'History', 'Self-Help'].map(c => (
                <Link key={c} to={`/books?category=${c.toLowerCase()}`} className="hero-pill">{c}</Link>
              ))}
            </div>
          </div>

          <div className="hero-visual fade-up fade-up-2" aria-hidden="true">
            <div className="hero-bookshelf">
              {[
                { h: 220, w: 38, c: '#1C2B22', s: '#C9993A', t: 'Dune' },
                { h: 200, w: 32, c: '#2E4035', s: '#A8C4B0', t: 'Gatsby' },
                { h: 240, w: 42, c: '#C9993A', s: '#1C2B22', t: '1984' },
                { h: 190, w: 30, c: '#3D5A47', s: '#F2EDE3', t: 'Sapiens' },
                { h: 225, w: 40, c: '#243329', s: '#E4B85A', t: 'Clean Code' },
                { h: 205, w: 35, c: '#7A9E87', s: '#1C2B22', t: 'Atomic' },
                { h: 215, w: 36, c: '#A07C2C', s: '#F2EDE3', t: 'Lean' },
              ].map((book, i) => (
                <div key={i} className="hero-book" style={{
                  height: book.h, width: book.w,
                  background: book.c,
                  animationDelay: `${i * 0.08}s`,
                }}>
                  <div className="hero-book-spine" style={{ color: book.s }}>
                    {book.t.split('').map((ch, j) => <span key={j}>{ch}</span>)}
                  </div>
                </div>
              ))}
              <div className="hero-shelf" />
            </div>
            <div className="hero-stats-panel">
              <div className="hero-stat-item"><span className="hsi-val">500+</span><span className="hsi-lbl">Books Listed</span></div>
              <div className="hero-stat-sep" />
              <div className="hero-stat-item"><span className="hsi-val">200+</span><span className="hsi-lbl">Happy Readers</span></div>
              <div className="hero-stat-sep" />
              <div className="hero-stat-item"><span className="hsi-val">Free</span><span className="hsi-lbl">To Join</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="section cats-section">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-label">Explore</span>
              <h2 className="section-title">Browse by Genre</h2>
            </div>
            <Link to="/books" className="btn btn-outline btn-sm">View All →</Link>
          </div>
          <div className="cats-grid">
            {CATEGORIES.map((cat, i) => (
              <Link key={cat.slug} to={`/books?category=${cat.slug}`}
                className="cat-card fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <span className="cat-icon">{cat.icon}</span>
                <span className="cat-label">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Books ── */}
      <section className="section featured-section">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-label">Just listed</span>
              <h2 className="section-title">Recent Listings</h2>
            </div>
            <Link to="/books" className="btn btn-outline btn-sm">Browse All Books →</Link>
          </div>

          {loading ? (
            <div className="spinner-overlay"><div className="spinner" /></div>
          ) : books.length > 0 ? (
            <div className="books-grid">
              {books.map(b => <BookCard key={b._id} book={b} />)}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>No books yet</h3>
              <p>Be the first to list a book in the community!</p>
              <Link to="/add-book" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>List a Book</Link>
            </div>
          )}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="section how-section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="section-label">Simple process</span>
            <h2 className="section-title">How ReadCycle Works</h2>
          </div>
          <div className="how-grid">
            {[
              { n: '01', icon: '📝', title: 'List Your Books', desc: 'Photograph your books and list them in minutes. You set the price — or offer to swap.' },
              { n: '02', icon: '🔍', title: 'Discover & Search', desc: 'Browse by genre, author, price, or condition. Thousands of titles to explore.' },
              { n: '03', icon: '🤝', title: 'Buy, Sell, or Swap', desc: 'Connect with other readers directly. Simple, personal, and community-powered.' },
            ].map((step, i) => (
              <div key={step.n} className="how-card fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="how-num">{step.n}</div>
                <div className="how-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="container cta-inner">
          <div className="cta-text">
            <span className="section-label" style={{ color: 'var(--brass-light)' }}>Ready?</span>
            <h2 style={{ color: 'var(--parchment)' }}>Start your reading journey today.</h2>
            <p style={{ color: 'var(--sage-light)' }}>Join thousands of readers buying and selling second-hand books. Always free to join.</p>
          </div>
          <div className="cta-btns">
            <Link to="/register" className="btn btn-primary btn-xl">Create Free Account</Link>
            <Link to="/books"    className="btn btn-outline-light btn-xl">Browse Books</Link>
          </div>
        </div>
      </section>
    </div>
  );
}