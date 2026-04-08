import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AdminPage.css';

export default function AdminPage() {
  const { user } = useAuth();
  const [tab, setTab]         = useState('overview');
  const [stats, setStats]     = useState(null);
  const [users, setUsers]     = useState([]);
  const [books, setBooks]     = useState([]);
  const [txns, setTxns]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const LIMIT = 15;

  const fetchStats = useCallback(async () => {
    const { data } = await adminAPI.getStats();
    setStats(data.data);
  }, []);

  const fetchUsers = useCallback(async (page = 1, q = '') => {
    const { data } = await adminAPI.getUsers({ page, limit: LIMIT, search: q });
    setUsers(data.data);
    setUserTotal(data.pagination.total);
  }, []);

  const fetchBooks = useCallback(async () => {
    const { data } = await adminAPI.getBooks({ limit: 100 });
    setBooks(data.data);
  }, []);

  const fetchTxns = useCallback(async () => {
    const { data } = await adminAPI.getTransactions();
    setTxns(data.data);
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchStats(), fetchUsers(), fetchBooks(), fetchTxns()])
      .finally(() => setLoading(false));
  }, [fetchStats, fetchUsers, fetchBooks, fetchTxns]);

  useEffect(() => { fetchUsers(userPage, search); }, [userPage, search, fetchUsers]);

  const toggleBlock = async (userId, isBlocked, name) => {
    if (userId === user._id) { toast.error("Can't block yourself."); return; }
    await adminAPI.toggleBlock(userId);
    toast.success(`${name} ${isBlocked ? 'unblocked' : 'blocked'}.`);
    fetchUsers(userPage, search);
    fetchStats();
  };

  const deleteUser = async (userId, name) => {
    if (!window.confirm(`Delete "${name}" and all their listings? This is permanent.`)) return;
    await adminAPI.deleteUser(userId);
    toast.success('User deleted.');
    fetchUsers(userPage, search);
    fetchStats();
  };

  const deleteBook = async (bookId, title) => {
    if (!window.confirm(`Remove listing "${title}"?`)) return;
    await adminAPI.deleteBook(bookId);
    setBooks(b => b.filter(x => x._id !== bookId));
    toast.success('Listing removed.');
    fetchStats();
  };

  if (loading) return <div className="spinner-overlay"><div className="spinner" /></div>;

  const s = stats?.stats || {};

  return (
    <div className="page-wrapper">
      <div className="container">

        <div className="admin-header">
          <div>
            <span className="section-label">Administration</span>
            <h1>Admin Dashboard</h1>
            <p className="section-subtitle">Signed in as <strong>{user.name}</strong> · {new Date().toLocaleDateString(undefined, { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
          </div>
          <Link to="/" className="btn btn-ghost btn-sm">← Back to Site</Link>
        </div>

        <div className="tabs">
          {[
            { key:'overview',     label:`📊 Overview` },
            { key:'users',        label:`👥 Users (${userTotal})` },
            { key:'books',        label:`📚 Books (${books.length})` },
            { key:'transactions', label:`💰 Transactions (${txns.length})` },
          ].map(t => (
            <button key={t.key} className={`tab-btn${tab===t.key?' active':''}`} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Overview ── */}
        {tab === 'overview' && stats && (
          <div className="admin-overview">
            <div className="admin-kpi-grid">
              {[
                { icon:'👥', val: s.totalUsers,       label:'Total Users',     color:'teal' },
                { icon:'📚', val: s.totalBooks,       label:'Total Listings',  color:'brass' },
                { icon:'🟢', val: s.activeBooks,      label:'Active Listings', color:'green' },
                { icon:'✅', val: s.soldBooks,         label:'Books Sold',      color:'brass' },
                { icon:'🔄', val: s.totalTransactions,label:'Transactions',    color:'teal' },
                { icon:'🚫', val: s.blockedUsers,      label:'Blocked Users',   color:'red' },
              ].map(k => (
                <div key={k.label} className={`kpi-card kpi-${k.color}`}>
                  <div className="kpi-icon">{k.icon}</div>
                  <div className="kpi-val">{k.val ?? 0}</div>
                  <div className="kpi-label">{k.label}</div>
                </div>
              ))}
            </div>

            <div className="admin-recent-grid">
              <div className="card" style={{ padding:'1.5rem', overflow:'auto' }}>
                <h3 style={{ marginBottom:'1rem' }}>Recent Users</h3>
                <table className="a-table">
                  <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
                  <tbody>
                    {stats.recentUsers?.map(u => (
                      <tr key={u._id}>
                        <td><strong>{u.name}</strong></td>
                        <td className="a-muted">{u.email}</td>
                        <td><span className={`badge ${u.role==='admin'?'badge-admin':'badge-user'}`}>{u.role}</span></td>
                        <td><span className={`badge ${u.isBlocked?'badge-sold':'badge-available'}`}>{u.isBlocked?'Blocked':'Active'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="card" style={{ padding:'1.5rem', overflow:'auto' }}>
                <h3 style={{ marginBottom:'1rem' }}>Recent Listings</h3>
                <table className="a-table">
                  <thead><tr><th>Title</th><th>Seller</th><th>Price</th><th>Status</th></tr></thead>
                  <tbody>
                    {stats.recentBooks?.map(b => (
                      <tr key={b._id}>
                        <td><Link to={`/books/${b._id}`} className="a-link">{b.title}</Link></td>
                        <td className="a-muted">{b.seller?.name}</td>
                        <td>${b.price?.toFixed(2)}</td>
                        <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Users ── */}
        {tab === 'users' && (
          <div>
            <div className="admin-toolbar">
              <input className="form-input" style={{ maxWidth:320 }} placeholder="Search name or email…"
                value={search} onChange={e => { setSearch(e.target.value); setUserPage(1); }} />
              <span className="admin-count">{userTotal} users total</span>
            </div>
            <div className="card" style={{ overflow:'auto' }}>
              <table className="a-table full">
                <thead>
                  <tr><th>User</th><th>Email</th><th>Role</th><th>Listings</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} className={u.isBlocked ? 'row-dim' : ''}>
                      <td>
                        <div className="a-user-cell">
                          <div className="a-avatar">
                            {u.avatar ? <img src={`http://localhost:5000${u.avatar}`} alt="" /> : <span>{u.name[0]}</span>}
                          </div>
                          <strong>{u.name}</strong>
                        </div>
                      </td>
                      <td className="a-muted">{u.email}</td>
                      <td><span className={`badge ${u.role==='admin'?'badge-admin':'badge-user'}`}>{u.role}</span></td>
                      <td>{u.totalListings || 0}</td>
                      <td className="a-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td><span className={`badge ${u.isBlocked?'badge-sold':'badge-available'}`}>{u.isBlocked?'Blocked':'Active'}</span></td>
                      <td>
                        {u.role !== 'admin' && (
                          <div className="a-actions">
                            <button className={`btn btn-sm ${u.isBlocked?'btn-success':'btn-ghost'}`}
                              onClick={() => toggleBlock(u._id, u.isBlocked, u.name)}>
                              {u.isBlocked ? 'Unblock' : 'Block'}
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u._id, u.name)}>Delete</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {userTotal > LIMIT && (
              <div className="pagination" style={{ marginTop:'1.5rem' }}>
                <button className="page-num" disabled={userPage===1} onClick={() => setUserPage(p=>p-1)}>←</button>
                <span style={{ fontSize:'0.85rem', color:'var(--ink-faint)' }}>Page {userPage} of {Math.ceil(userTotal/LIMIT)}</span>
                <button className="page-num" disabled={userPage>=Math.ceil(userTotal/LIMIT)} onClick={() => setUserPage(p=>p+1)}>→</button>
              </div>
            )}
          </div>
        )}

        {/* ── Books ── */}
        {tab === 'books' && (
          <div className="card" style={{ overflow:'auto' }}>
            <table className="a-table full">
              <thead>
                <tr><th>Cover</th><th>Title</th><th>Author</th><th>Seller</th><th>Price</th><th>Condition</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {books.map(b => (
                  <tr key={b._id}>
                    <td>
                      <div className="a-book-thumb">
                        {b.image ? <img src={`http://localhost:5000${b.image}`} alt="" /> : <span>📖</span>}
                      </div>
                    </td>
                    <td><Link to={`/books/${b._id}`} className="a-link">{b.title}</Link></td>
                    <td className="a-muted">{b.author}</td>
                    <td className="a-muted">
                      <Link to={`/sellers/${b.seller?._id}`} className="a-link">{b.seller?.name}</Link>
                    </td>
                    <td>${b.price?.toFixed(2)}</td>
                    <td><span className={`badge badge-${b.condition}`}>{b.condition}</span></td>
                    <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                    <td><button className="btn btn-danger btn-sm" onClick={() => deleteBook(b._id, b.title)}>Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Transactions ── */}
        {tab === 'transactions' && (
          <div className="card" style={{ overflow:'auto' }}>
            <table className="a-table full">
              <thead>
                <tr><th>Book</th><th>Type</th><th>Buyer</th><th>Seller</th><th>Amount</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {txns.map(t => (
                  <tr key={t._id}>
                    <td style={{ maxWidth:160 }}><span className="a-truncate">{t.bookTitleSnapshot}</span></td>
                    <td><span className={`badge ${t.type==='swap'?'badge-reserved':'badge-new'}`}>{t.type==='swap'?'⇄ Swap':'💰 Buy'}</span></td>
                    <td className="a-muted">{t.buyer?.name}</td>
                    <td className="a-muted">{t.seller?.name}</td>
                    <td>{t.type==='swap'?'Swap':`$${t.amount?.toFixed(2)}`}</td>
                    <td>
                      <span className={`badge badge-${
                        {pending:'reserved',accepted:'available',completed:'new',cancelled:'sold',rejected:'sold'}[t.status]||'reserved'
                      }`}>{t.status}</span>
                    </td>
                    <td className="a-muted">{new Date(t.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}