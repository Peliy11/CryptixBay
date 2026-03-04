'use client';

import { useEffect, useState } from 'react';
import { storage } from '@/lib/storage';

function id() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function StorePage() {
  const [posts, setPosts] = useState([]);
  const [session, setSession] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setSession(storage.getSession());
    setPosts(storage.getStorePosts());
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (!session) return;
    const newPost = {
      id: id(),
      author: session.username,
      title: title.trim(),
      description: description.trim(),
      price: price.trim() || 'N/A',
      date: new Date().toISOString(),
    };
    const next = [newPost, ...posts];
    storage.setStorePosts(next);
    setPosts(next);
    setTitle('');
    setDescription('');
    setPrice('');
    setSuccess('Listing posted.');
    setTimeout(() => setSuccess(''), 3000);
  }

  return (
    <>
      <div className="card">
        <h2>Post a listing</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Item or service name" />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Details..." />
          </div>
          <div className="form-group">
            <label>Price (e.g. 0.5 BTC)</label>
            <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00 BTC" />
          </div>
          <button type="submit" className="btn btn-primary">Post listing</button>
          {success && <p className="success-msg">{success}</p>}
        </form>
      </div>

      <div className="card">
        <h2>Marketplace</h2>
        {posts.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No listings yet. Be the first to post.</p>
        ) : (
          posts.map((p) => (
            <div key={p.id} className="listing-item">
              <div className="meta">@{p.author} · {new Date(p.date).toLocaleString()}</div>
              <strong>{p.title}</strong>
              {p.description && <p style={{ marginTop: '0.35rem', fontSize: '0.9rem' }}>{p.description}</p>}
              <div className="price">{p.price}</div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
