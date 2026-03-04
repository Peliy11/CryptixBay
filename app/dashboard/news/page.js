'use client';

import { useEffect, useState } from 'react';
import { storage } from '@/lib/storage';

const SEED_NEWS = [
  { id: 'seed1', title: 'Welcome to CryptixBay', body: 'This is the official news channel. Site updates and announcements will be posted here.', date: new Date().toISOString(), author: 'System' },
  { id: 'seed2', title: 'Store & DMs live', body: 'Marketplace and DM services are now active. Post listings and message other users.', date: new Date().toISOString(), author: 'System' },
];

function id() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [session, setSession] = useState(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setSession(storage.getSession());
    let items = storage.getNews();
    if (items.length === 0) {
      storage.setNews(SEED_NEWS);
      items = SEED_NEWS;
    }
    setNews(items);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (!session) return;
    const item = {
      id: id(),
      title: title.trim(),
      body: body.trim(),
      date: new Date().toISOString(),
      author: session.username,
    };
    const next = [item, ...news];
    storage.setNews(next);
    setNews(next);
    setTitle('');
    setBody('');
    setSuccess('Update posted.');
    setTimeout(() => setSuccess(''), 3000);
  }

  return (
    <>
      <div className="card">
        <h2>Post an update</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
          Add news or announcements to the channel.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Headline" />
          </div>
          <div className="form-group">
            <label>Body</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Full update text..." />
          </div>
          <button type="submit" className="btn btn-primary">Post update</button>
          {success && <p className="success-msg">{success}</p>}
        </form>
      </div>

      <div className="card">
        <h2>News channel</h2>
        {news.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No updates yet.</p>
        ) : (
          news.map((item) => (
            <div key={item.id} className="news-item">
              <div className="news-meta">@{item.author} · {new Date(item.date).toLocaleString()}</div>
              <strong>{item.title}</strong>
              <div className="news-body">{item.body}</div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
