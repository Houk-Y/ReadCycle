import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { booksAPI } from '../utils/api';
import BookCard from '../components/books/BookCard';
import './BooksPage.css';

const CATEGORIES = ['fiction','non-fiction','science','history','biography','self-help','technology','business','children','academic','art','travel','cooking','health','religion','other'];
const CONDITIONS  = ['new','like-new','good','fair','poor'];
const SORTS = [
  { val: '-createdAt', label: 'Newest First' },
  { val: 'price',      label: 'Price: Low → High' },
  { val: '-price',     label: 'Price: High → Low' },
  { val: '-views',     label: 'Most Popular' },
];

export default function BooksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks]           = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 });
  const [loading, setLoading]       = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search:   searchParams.get('search')   || '',
    category: searchParams.get('category') || '',
    condition:'',
    minPrice: '',
    maxPrice: '',
    sort:     '-createdAt',
    page:     1,
  });
  const [draftSearch, setDraftSearch] = useState(filters.search);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, status: 'available', limit: 12 };
      Object.keys(params).forEach(k => { if (!params[k] && params[k] !== 0) delete params[k]; });
      const { data } = await booksAPI.getAll(params);
      setBooks(data.data);
      setPagination(data.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }));
  const clearAll  = () => { setFilters({ search:'', category:'', condition:'', minPrice:'', maxPrice:'', sort:'-createdAt', page:1 }); setDraftSearch(''); setSearchParams({}); };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilter('search', draftSearch);
    if (draftSearch) setSearchParams({ search: draftSearch });
    else setSearchParams({});
  };

  const activeFilters = [filters.category, filters.condition, filters.minPrice, filters.maxPrice].filter(Boolean).length;

  return (
    <div className="books-page">
      {/* ── Page Header ── */}
      <div className="books-header">
        <div className="container books-header-inner">
          <div>
            <h1 className="books-page-title">Browse Books</h1>
            <p className="books-page-sub">
              {loading ? 'Loading…' : `${pagination.total} book${pagination.total !== 1 ? 's' : ''} available`}
            </p>
          </div>
          <form onSubmit={handleSearch} className="books-search-form">
            <div className="books-search-wrap">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Title, author, ISBN…"
                value={draftSearch}
                onChange={e => setDraftSearch(e.target.value)}
                className="books-search-input"
              />
              {draftSearch && (
                <button type="button" className="books-search-clear" onClick={() => { setDraftSearch(''); setFilter('search', ''); }}>✕</button>
              )}
            </div>
            <button type="submit" className="btn btn-dark">Search</button>
          </form>
        </div>
      </div>

      <div className="container books-body">
        {/* ── Sidebar ── */}
        <aside className={`books-sidebar${showFilters ? ' open' : ''}`}>
          <div className="sidebar-header">
            <h3>Filters {activeFilters > 0 && <span className="filter-count">{activeFilters}</span>}</h3>
            {activeFilters > 0 && <button onClick={clearAll} className="clear-btn">Clear all</button>}
          </div>

          {/* Sort */}
          <div className="filter-section">
            <label className="filter-label">Sort By</label>
            <select className="form-select" value={filters.sort} onChange={e => setFilter('sort', e.target.value)}>
              {SORTS.map(s => <option key={s.val} value={s.val}>{s.label}</option>)}
            </select>
          </div>

          {/* Category */}
          <div className="filter-section">
            <label className="filter-label">Category</label>
            <div className="filter-chips">
              <button className={`chip${!filters.category ? ' active' : ''}`} onClick={() => setFilter('category', '')}>All</button>
              {CATEGORIES.map(c => (
                <button key={c} className={`chip${filters.category === c ? ' active' : ''}`}
                  onClick={() => setFilter('category', filters.category === c ? '' : c)}>
                  {c.charAt(0).toUpperCase() + c.slice(1).replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Condition */}
          <div className="filter-section">
            <label className="filter-label">Condition</label>
            <div className="filter-chips">
              <button className={`chip${!filters.condition ? ' active' : ''}`} onClick={() => setFilter('condition', '')}>Any</button>
              {CONDITIONS.map(c => (
                <button key={c} className={`chip${filters.condition === c ? ' active' : ''}`}
                  onClick={() => setFilter('condition', filters.condition === c ? '' : c)}>
                  {c.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="filter-section">
            <label className="filter-label">Price Range (USD)</label>
            <div className="price-range">
              <input type="number" placeholder="Min" min="0" className="form-input price-input"
                value={filters.minPrice} onChange={e => setFilter('minPrice', e.target.value)} />
              <span className="price-dash">—</span>
              <input type="number" placeholder="Max" min="0" className="form-input price-input"
                value={filters.maxPrice} onChange={e => setFilter('maxPrice', e.target.value)} />
            </div>
          </div>
        </aside>

        {/* ── Results ── */}
        <main className="books-results">
          {/* Mobile filter toggle */}
          <div className="mobile-filter-bar">
            <button className="btn btn-ghost btn-sm" onClick={() => setShowFilters(!showFilters)}>
              {showFilters ? 'Hide Filters ✕' : `Filters${activeFilters ? ` (${activeFilters})` : ''} ⇅`}
            </button>
            <span className="mobile-count">{pagination.total} results</span>
          </div>

          {loading ? (
            <div className="spinner-overlay"><div className="spinner" /></div>
          ) : books.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No books found</h3>
              <p>Try adjusting your filters or search term</p>
              <button onClick={clearAll} className="btn btn-outline" style={{ marginTop: '1.5rem' }}>Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="books-grid">
                {books.map(b => <BookCard key={b._id} book={b} />)}
              </div>

              {pagination.pages > 1 && (
                <div className="pagination">
                  <button className="page-num" disabled={pagination.page <= 1}
                    onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>←</button>
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                    <button key={p} className={`page-num${p === pagination.page ? ' active' : ''}`}
                      onClick={() => setFilters(f => ({ ...f, page: p }))}>{p}</button>
                  ))}
                  <button className="page-num" disabled={pagination.page >= pagination.pages}
                    onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>→</button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}