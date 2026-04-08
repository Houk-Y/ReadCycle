import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const close = () => { setMenuOpen(false); setDropOpen(false); };

  const handleLogout = () => {
    logout();
    navigate('/');
    close();
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-inner">
          {/* Logo */}
          <Link to="/" className="nav-logo" onClick={close}>
            <span className="nav-logo-mark">RC</span>
            <span className="nav-logo-text">Read<span>Cycle</span></span>
          </Link>

          {/* Desktop links */}
          <div className="nav-links">
            <NavLink to="/books" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Browse</NavLink>
            {isLoggedIn && <>
              <NavLink to="/add-book"  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Sell a Book</NavLink>
              <NavLink to="/wishlist"  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Wishlist</NavLink>
              <NavLink to="/messages"  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Messages</NavLink>
              {isAdmin && <NavLink to="/admin" className={({ isActive }) => `nav-link nav-admin${isActive ? ' active' : ''}`}>Admin</NavLink>}
            </>}
          </div>

          {/* Right side */}
          <div className="nav-right">
            {isLoggedIn ? (
              <div className="nav-user" ref={dropRef}>
                <button className="nav-avatar-btn" onClick={() => setDropOpen(!dropOpen)}>
                  <div className="nav-avatar">
                    {user.avatar
                      ? <img src={`http://localhost:5000${user.avatar}`} alt="" />
                      : <span>{user.name[0].toUpperCase()}</span>}
                  </div>
                  <span className="nav-user-name">{user.name.split(' ')[0]}</span>
                  <svg className={`nav-chevron${dropOpen ? ' flipped' : ''}`} viewBox="0 0 10 6" fill="none">
                    <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {dropOpen && (
                  <div className="nav-dropdown">
                    <div className="nav-dropdown-header">
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                    </div>
                    <div className="nav-dropdown-divider" />
                    <Link to="/dashboard" onClick={close}>Dashboard</Link>
                    <Link to="/profile"   onClick={close}>Edit Profile</Link>
                    <Link to="/messages"  onClick={close}>Messages</Link>
                    <div className="nav-dropdown-divider" />
                    <button onClick={handleLogout} className="nav-dropdown-logout">Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="nav-auth">
                <Link to="/login"    className="btn btn-ghost btn-sm" onClick={close}>Sign In</Link>
                <Link to="/register" className="btn btn-primary btn-sm" onClick={close}>Join Free</Link>
              </div>
            )}

            {/* Hamburger */}
            <button className={`nav-burger${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="nav-mobile-drawer">
          <NavLink to="/books"    className="mobile-link" onClick={close}>Browse Books</NavLink>
          {isLoggedIn ? <>
            <NavLink to="/add-book"  className="mobile-link" onClick={close}>Sell a Book</NavLink>
            <NavLink to="/dashboard" className="mobile-link" onClick={close}>Dashboard</NavLink>
            <NavLink to="/wishlist"  className="mobile-link" onClick={close}>Wishlist</NavLink>
            <NavLink to="/messages"  className="mobile-link" onClick={close}>Messages</NavLink>
            <NavLink to="/profile"   className="mobile-link" onClick={close}>Profile</NavLink>
            {isAdmin && <NavLink to="/admin" className="mobile-link admin" onClick={close}>Admin Panel</NavLink>}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
              <button className="mobile-link logout" onClick={handleLogout}>Sign Out</button>
            </div>
          </> : <>
            <NavLink to="/login"    className="mobile-link" onClick={close}>Sign In</NavLink>
            <NavLink to="/register" className="mobile-link highlight" onClick={close}>Join Free →</NavLink>
          </>}
        </div>
      )}
    </>
  );
}