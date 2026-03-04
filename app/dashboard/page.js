'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import * as data from '@/lib/data';

const LISTING_CATEGORIES = ['OTHER', 'SERVICES', 'DIGITAL', 'PHYSICAL'];

function id() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function threadKey(a, b) {
  return [a, b].sort().join('::');
}

function migratePost(p) {
  return {
    ...p,
    category: p.category || 'OTHER',
    image: p.image || null,
    views: typeof p.views === 'number' ? p.views : 0,
  };
}

export default function StorePage() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [session, setSession] = useState(null);
  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailListingId, setDetailListingId] = useState(null);
  const [detailMessage, setDetailMessage] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('OTHER');
  const [image, setImage] = useState(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setSession(storage.getSession());
    data.getUsers().then((u) => setUsers(u));
    data.getStorePosts().then((raw) => setPosts(raw.map(migratePost)));
  }, []);

  const detailListing = detailListingId ? posts.find((p) => p.id === detailListingId) : null;
  const isAdmin = session && users.find((u) => u.username === session.username)?.isAdmin;

  async function openListingDetail(p) {
    const newViews = (p.views || 0) + 1;
    setDetailListingId(p.id);
    setDetailMessage('');
    try {
      await data.updateStorePost(p.id, { views: newViews });
      setPosts((prev) => prev.map((post) => (post.id === p.id ? { ...post, views: newViews } : post)));
    } catch (_) {
      setPosts((prev) => prev.map((post) => (post.id === p.id ? { ...post, views: newViews } : post)));
    }
  }

  async function handleDetailSendMessage(e) {
    e.preventDefault();
    if (!session || !detailMessage.trim() || !detailListing) return;
    const key = threadKey(session.username, detailListing.author);
    try {
      await data.sendDm(key, session.username, detailListing.author, detailMessage.trim());
    } catch (_) {}
    setDetailMessage('');
    setDetailListingId(null);
    router.push('/dashboard/dms?user=' + encodeURIComponent(detailListing.author));
  }

  async function handleDetailDelete() {
    if (!detailListing || !isAdmin) return;
    if (!confirm('Delete this listing? This cannot be undone.')) return;
    try {
      await data.deleteStorePost(detailListing.id);
      setPosts((prev) => prev.filter((p) => p.id !== detailListing.id));
      setDetailListingId(null);
    } catch (_) {}
  }

  function copyListingId() {
    if (detailListing?.id) navigator.clipboard.writeText(detailListing.id);
  }

  const filteredAndSorted = useMemo(() => {
    let list = posts.filter((p) => {
      const matchSearch = !search.trim() || p.title.toLowerCase().includes(search.toLowerCase()) || (p.description || '').toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === 'ALL' || (p.category || 'OTHER') === categoryFilter;
      return matchSearch && matchCat;
    });
    list = [...list].sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'price-low') return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
      if (sortBy === 'price-high') return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
      return 0;
    });
    return list;
  }, [posts, search, categoryFilter, sortBy]);

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!session) return;
    const newPost = {
      id: id(),
      author: session.username,
      title: title.trim(),
      description: description.trim(),
      price: price.trim() || '0',
      date: new Date().toISOString(),
      category: category || 'OTHER',
      image: image || null,
      views: 0,
    };
    try {
      const created = await data.addStorePost(newPost);
      setPosts((prev) => [created, ...prev]);
      setTitle('');
      setDescription('');
      setPrice('');
      setImage(null);
      setCategory('OTHER');
      setSuccess('Listing created.');
      setModalOpen(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setSuccess(err?.message || 'Failed to create listing.');
    }
  }

  function dmHref(username) {
    return '/dashboard/dms?user=' + encodeURIComponent(username);
  }

  return (
    <>
      <div className="marketplace-header">
        <h1 className="marketplace-title">Marketplace</h1>
        <p className="marketplace-subtitle">
          [ {posts.length} active listing{posts.length !== 1 ? 's' : ''} • encrypted transactions ]
        </p>
      </div>

      <div className="marketplace-toolbar">
        <div className="marketplace-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search listings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="marketplace-filter"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="ALL">All categories</option>
          {LISTING_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          className="marketplace-filter"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="price-low">Price: low to high</option>
          <option value="price-high">Price: high to low</option>
        </select>
        <div className="marketplace-view-toggle">
          <button
            type="button"
            className={viewMode === 'grid' ? 'active' : ''}
            onClick={() => setViewMode('grid')}
            title="Grid view"
            aria-label="Grid view"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          </button>
          <button
            type="button"
            className={viewMode === 'list' ? 'active' : ''}
            onClick={() => setViewMode('list')}
            title="List view"
            aria-label="List view"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </button>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.35rem', verticalAlign: 'middle' }}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          + New listing
        </button>
      </div>

      {success && <p className="success-msg" style={{ marginBottom: '1rem' }}>{success}</p>}

      {filteredAndSorted.length === 0 ? (
        <div className="card">
          <p style={{ color: 'var(--text-muted)' }}>No listings match. Post one with + New listing.</p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="card">
          {filteredAndSorted.map((p) => (
            <div key={p.id} className="listing-item" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => openListingDetail(p)}
                onKeyDown={(e) => e.key === 'Enter' && openListingDetail(p)}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0, cursor: 'pointer' }}
              >
                <div style={{ width: 56, height: 56, borderRadius: 6, overflow: 'hidden', background: 'var(--bg-secondary)', flexShrink: 0 }}>
                  {p.image ? (
                    <img src={p.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', opacity: 0.6 }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                      </svg>
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span className="badge" style={{ marginRight: '0.5rem', marginBottom: '0.25rem' }}>{p.category || 'OTHER'}</span>
                  <strong>{p.title}</strong>
                  {p.description && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{p.description.slice(0, 60)}{p.description.length > 60 ? '…' : ''}</p>}
                  <div style={{ marginTop: '0.35rem' }}>
                    <span className="card-price">₿ {p.price}</span>
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>· {p.views} views · by {p.author}</span>
                  </div>
                </div>
              </div>
              <Link href={dmHref(p.author)} className="btn btn-ghost" title="Message seller">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="listing-grid">
          {filteredAndSorted.map((p) => (
            <div key={p.id} className="listing-card">
              <div
                role="button"
                tabIndex={0}
                className="listing-card-link"
                onClick={() => openListingDetail(p)}
                onKeyDown={(e) => e.key === 'Enter' && openListingDetail(p)}
              >
                <div className="card-thumb-wrap">
                  <span className="card-tag">{p.category || 'OTHER'}</span>
                  {p.image ? (
                    <img src={p.image} alt={p.title} />
                  ) : (
                    <svg className="card-thumb-placeholder" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  )}
                </div>
                <div className="card-body">
                  <div className="card-title">{p.title}</div>
                  <div className="card-desc">{p.description || 'No description available'}</div>
                  <div className="card-price-row">
                    <span className="card-price">₿ {p.price}</span>
                    <span className="card-views">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      {p.views}
                    </span>
                  </div>
                  <div className="card-seller">by {p.author}</div>
                </div>
              </div>
              <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                <Link href={dmHref(p.author)} title="Message seller">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {detailListing && (
        <div className="modal-overlay" onClick={() => setDetailListingId(null)}>
          <div className="modal-box listing-detail-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="listing-detail-back" onClick={() => setDetailListingId(null)} style={{ background: 'none', border: 'none', marginBottom: '1rem', cursor: 'pointer', textAlign: 'left' }}>
              ← Back to market
            </button>
            <div className="listing-detail-grid">
              <div className="listing-detail-image-wrap">
                {detailListing.image ? (
                  <img src={detailListing.image} alt={detailListing.title} />
                ) : (
                  <div className="listing-detail-image-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="listing-detail-info">
                <span className="listing-detail-tag">{detailListing.category || 'OTHER'}</span>
                <h1 className="listing-detail-title">{detailListing.title}</h1>
                <div className="listing-detail-price-box">
                  <span className="listing-detail-price-label">Price</span>
                  <span className="listing-detail-price">₿ {detailListing.price} BTC</span>
                </div>
                <div className="listing-detail-meta-grid">
                  <div className="listing-detail-meta-item">
                    <span className="listing-detail-meta-label">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                      Seller
                    </span>
                    <span className="listing-detail-meta-value">{detailListing.author}</span>
                  </div>
                  <div className="listing-detail-meta-item">
                    <span className="listing-detail-meta-label">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                      Listed
                    </span>
                    <span className="listing-detail-meta-value">
                      {detailListing.date ? new Date(detailListing.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </span>
                  </div>
                  <div className="listing-detail-meta-item">
                    <span className="listing-detail-meta-label">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                      Views
                    </span>
                    <span className="listing-detail-meta-value">{detailListing.views ?? 0}</span>
                  </div>
                  <div className="listing-detail-meta-item">
                    <span className="listing-detail-meta-label">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                      ID
                    </span>
                    <span className="listing-detail-meta-value listing-detail-id">
                      {detailListing.id.slice(0, 12)}...
                      <button type="button" className="listing-detail-copy" onClick={copyListingId} title="Copy ID">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                      </button>
                    </span>
                  </div>
                </div>
                <div className="listing-detail-section">
                  <span className="listing-detail-section-label">Description</span>
                  <div className="listing-detail-description">
                    {detailListing.description || 'No description provided.'}
                  </div>
                </div>
                <div className="listing-detail-section">
                  <span className="listing-detail-section-label">Contact seller</span>
                  <form onSubmit={handleDetailSendMessage}>
                    <textarea
                      className="listing-detail-message-input"
                      placeholder="Write your message..."
                      value={detailMessage}
                      onChange={(e) => setDetailMessage(e.target.value)}
                      rows={3}
                    />
                    <button type="submit" className="btn btn-primary listing-detail-send">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" /></svg>
                      Send message
                    </button>
                  </form>
                </div>
                {isAdmin && (
                  <div className="listing-detail-admin">
                    <button type="button" className="btn btn-ghost listing-detail-delete" onClick={handleDetailDelete}>
                      Delete listing
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>Create new listing</h2>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Product image</label>
                  <label className={`upload-zone ${image ? 'has-image' : ''}`}>
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                    {image ? (
                      <img src={image} alt="Preview" />
                    ) : (
                      <span className="upload-text">Click to upload</span>
                    )}
                  </label>
                </div>
                <div className="form-group">
                  <label>Title</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Enter product title..." />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your product..." rows={3} />
                </div>
                <div className="form-group">
                  <label>Price</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input type="text" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" style={{ flex: 1 }} />
                    <span className="marketplace-filter" style={{ cursor: 'default' }}>₿ BTC</span>
                  </div>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select className="marketplace-filter" value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%' }}>
                    {LISTING_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c === 'OTHER' ? 'Other' : c.charAt(0) + c.slice(1).toLowerCase()}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn btn-primary">Create listing</button>
                  <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
