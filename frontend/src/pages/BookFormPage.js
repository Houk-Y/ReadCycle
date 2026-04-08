import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { booksAPI } from '../utils/api';
import toast from 'react-hot-toast';
import './BookFormPage.css';

const CONDITIONS = ['new','like-new','good','fair','poor'];
const CATEGORIES = ['fiction','non-fiction','science','history','biography','self-help','technology','business','children','academic','art','travel','cooking','health','religion','other'];

function BookForm({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit   = mode === 'edit';

  const [form, setForm] = useState({
    title:'', author:'', isbn:'', description:'',
    price:'', condition:'good', category:'fiction',
    allowSwap: false, status:'available', image: null,
  });
  const [preview, setPreview]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError]       = useState('');

  useEffect(() => {
    if (!isEdit) return;
    booksAPI.getOne(id)
      .then(({ data }) => {
        const b = data.data;
        setForm({ title: b.title, author: b.author, isbn: b.isbn||'', description: b.description||'',
          price: b.price, condition: b.condition, category: b.category, allowSwap: b.allowSwap,
          status: b.status, image: null });
        if (b.image) setPreview(`http://localhost:5000${b.image}`);
      })
      .catch(() => { toast.error('Book not found'); navigate('/dashboard'); })
      .finally(() => setFetching(false));
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB.'); return; }
    setForm(f => ({ ...f, image: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim() || !form.author.trim() || !form.price) { setError('Title, author, and price are required.'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (k === 'image' && !v) return; fd.append(k, v); });
      if (isEdit) {
        await booksAPI.update(id, fd);
        toast.success('Listing updated!');
        navigate(`/books/${id}`);
      } else {
        const { data } = await booksAPI.create(fd);
        toast.success('Book listed successfully! 📚');
        navigate(`/books/${data.data._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed. Please try again.');
    } finally { setLoading(false); }
  };

  if (fetching) return <div className="spinner-overlay"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <div className="container">
        <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>
        <div className="page-header">
          <h1>{isEdit ? 'Edit Listing' : 'List a Book'}</h1>
          <p className="section-subtitle">{isEdit ? 'Update your listing details' : 'Share a book with the ReadCycle community'}</p>
        </div>

        <div className="book-form-layout">
          {/* Image Column */}
          <div className="book-form-img-col">
            <label className="img-upload-area" htmlFor="img-input">
              {preview
                ? <img src={preview} alt="Preview" className="img-preview" />
                : <div className="img-placeholder">
                    <div className="img-placeholder-icon">📷</div>
                    <p>Click to upload cover image</p>
                    <span>JPG, PNG, WebP · Max 5MB</span>
                  </div>}
            </label>
            <input id="img-input" type="file" accept="image/*" onChange={handleImage} style={{ display:'none' }} />
            {preview && (
              <button type="button" className="btn btn-ghost btn-sm img-remove-btn"
                onClick={() => { setPreview(null); setForm(f => ({ ...f, image: null })); }}>
                Remove Image
              </button>
            )}

            {isEdit && (
              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label className="form-label">Listing Status</label>
                <select name="status" className="form-select" value={form.status} onChange={handleChange}>
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
            )}
          </div>

          {/* Form Column */}
          <form onSubmit={handleSubmit} className="book-form-fields">
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label className="form-label">Book Title *</label>
              <input name="title" className="form-input" placeholder="e.g. The Great Gatsby"
                value={form.title} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Author *</label>
              <input name="author" className="form-input" placeholder="e.g. F. Scott Fitzgerald"
                value={form.author} onChange={handleChange} required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Price (USD) *</label>
                <input name="price" type="number" min="0" step="0.01" className="form-input"
                  placeholder="0.00" value={form.price} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">ISBN</label>
                <input name="isbn" className="form-input" placeholder="Optional"
                  value={form.isbn} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Condition *</label>
                <select name="condition" className="form-select" value={form.condition} onChange={handleChange}>
                  {CONDITIONS.map(c => <option key={c} value={c}>{c.replace('-',' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select name="category" className="form-select" value={form.category} onChange={handleChange}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('-',' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea name="description" className="form-textarea" rows={4}
                placeholder="Condition details, edition info, reason for selling…"
                value={form.description} onChange={handleChange} />
            </div>

            <label className="toggle-row" style={{ marginBottom: '1.5rem' }}>
              <input type="checkbox" name="allowSwap" checked={form.allowSwap} onChange={handleChange} />
              <span className="toggle-track" />
              <span className="toggle-label">I'm open to book swaps</span>
            </label>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={loading}>
                {loading ? 'Saving…' : isEdit ? 'Save Changes' : '📚 Publish Listing'}
              </button>
              <Link to="/dashboard" className="btn btn-ghost btn-lg">Cancel</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function AddBookPage()  { return <BookForm mode="add" />; }
export function EditBookPage() { return <BookForm mode="edit" />; }
export default AddBookPage;