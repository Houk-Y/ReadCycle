import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [tab, setTab] = useState('profile');

  const [form, setForm]     = useState({ name: user?.name||'', bio: user?.bio||'', location: user?.location||'', phone: user?.phone||'' });
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(user?.avatar ? `http://localhost:5000${user.avatar}` : null);
  const [saving, setSaving] = useState(false);

  const [pw, setPw]     = useState({ currentPassword:'', newPassword:'', confirm:'' });
  const [pwSaving, setPwSaving] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k, v));
      if (avatar) fd.append('avatar', avatar);
      await authAPI.updateProfile(fd);
      await refreshUser();
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirm) { toast.error('Passwords do not match'); return; }
    if (pw.newPassword.length < 6)     { toast.error('Password must be at least 6 characters'); return; }
    setPwSaving(true);
    try {
      await authAPI.changePassword({ currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      toast.success('Password changed!');
      setPw({ currentPassword:'', newPassword:'', confirm:'' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password'); }
    finally { setPwSaving(false); }
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1>My Profile</h1>
          <p className="section-subtitle">Manage your account settings</p>
        </div>

        <div className="profile-layout">
          {/* Sidebar nav */}
          <nav className="profile-nav">
            <button className={`profile-nav-btn${tab==='profile'?' active':''}`} onClick={() => setTab('profile')}>
              <span>👤</span> Edit Profile
            </button>
            <button className={`profile-nav-btn${tab==='security'?' active':''}`} onClick={() => setTab('security')}>
              <span>🔒</span> Security
            </button>
          </nav>

          {/* Content */}
          <div className="profile-content card">
            {tab === 'profile' && (
              <form onSubmit={saveProfile} className="profile-form">
                <h3 className="profile-section-title">Profile Information</h3>

                {/* Avatar */}
                <div className="avatar-upload-row">
                  <div className="profile-avatar-wrap" onClick={() => document.getElementById('avatarInput').click()}>
                    {preview
                      ? <img src={preview} alt="avatar" />
                      : <span>{user?.name?.[0]?.toUpperCase()}</span>}
                    <div className="avatar-hover-overlay">📷 Change</div>
                  </div>
                  <input id="avatarInput" type="file" accept="image/*" onChange={handleAvatarChange} style={{display:'none'}} />
                  <div className="avatar-info">
                    <p><strong>{user?.name}</strong></p>
                    <p>{user?.email}</p>
                    <span className={`badge ${user?.role==='admin'?'badge-admin':'badge-user'}`}>{user?.role}</span>
                    <p className="avatar-hint">Click avatar to change photo</p>
                  </div>
                </div>

                <div className="divider" />

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" placeholder="Optional" value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input className="form-input" placeholder="City, Country" value={form.location} onChange={e => setForm(f=>({...f,location:e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Bio</label>
                  <textarea className="form-textarea" rows={3} placeholder="Tell other readers about yourself…"
                    value={form.bio} onChange={e => setForm(f=>({...f,bio:e.target.value}))} maxLength={300} />
                  <span className="form-hint">{form.bio.length}/300</span>
                </div>

                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Profile'}
                </button>
              </form>
            )}

            {tab === 'security' && (
              <form onSubmit={savePassword} className="profile-form" style={{ maxWidth: 440 }}>
                <h3 className="profile-section-title">Change Password</h3>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input type="password" className="form-input" value={pw.currentPassword}
                    onChange={e => setPw(p=>({...p,currentPassword:e.target.value}))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input type="password" className="form-input" placeholder="Min. 6 characters" value={pw.newPassword}
                    onChange={e => setPw(p=>({...p,newPassword:e.target.value}))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input type="password" className="form-input" value={pw.confirm}
                    onChange={e => setPw(p=>({...p,confirm:e.target.value}))} required />
                </div>
                <button type="submit" className="btn btn-primary" disabled={pwSaving}>
                  {pwSaving ? 'Updating…' : 'Update Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}