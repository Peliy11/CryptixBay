'use client';

import { useEffect, useState } from 'react';
import { storage } from '@/lib/storage';
import * as data from '@/lib/data';

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [session, setSession] = useState(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setSession(storage.getSession());
    data.getNews().then(setNews);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!session) return;
    const item = {
      id: null,
      title: title.trim(),
      body: body.trim(),
      date: new Date().toISOString(),
      author: session.username,
    };
    try {
      const created = await data.addNews(item);
      setNews((prev) => [created, ...prev]);
      setTitle('');
      setBody('');
      setSuccess('Update posted.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setSuccess(err?.message || 'Failed to post.');
    }
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
            <div key={item.id || item.date} className="news-item">
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
