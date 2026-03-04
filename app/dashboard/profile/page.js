'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import * as data from '@/lib/data';

function threadKey(a, b) {
  return [a, b].sort().join('::');
}

export default function ProfilePage() {
  const [session, setSession] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [dms, setDms] = useState({});
  const [editingName, setEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const s = storage.getSession();
    setSession(s);
    data.getUsers().then(setUsers);
    data.getStorePosts().then(setPosts);
    data.getDms().then(setDms);
    data.getCryptoBalances().then((bal) => setBalance(s && bal[s.username] ? bal[s.username] : 0));
  }, []);

  const user = session ? users.find((u) => u.username === session.username) : null;
  const displayName = (user?.displayName || session?.username || '').trim() || session?.username;
  const isAdmin = user?.isAdmin === true;
  const joinDate = user?.joinDate ? new Date(user.joinDate) : null;
  const myListings = posts.filter((p) => p.author === session?.username);
  const messageCount = session
    ? Object.entries(dms).filter(([key]) => key.includes(session.username)).reduce((acc, [, msgs]) => acc + msgs.length, 0)
    : 0;

  function handleStartEdit() {
    setEditName(displayName);
    setEditingName(true);
  }

  async function handleSaveName() {
    if (!session || !user) return;
    const name = editName.trim() || session.username;
    try {
      await data.updateUser(session.username, { displayName: name || undefined });
      setUsers((prev) => prev.map((u) => (u.username === session.username ? { ...u, displayName: name || undefined } : u)));
      setEditingName(false);
    } catch (_) {}
  }

  if (!session) return null;

  function handlePfpChange(e) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/') || !session || !user) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await data.updateUser(session.username, { avatar: reader.result });
        setUsers((prev) => prev.map((u) => (u.username === session.username ? { ...u, avatar: reader.result } : u)));
      } catch (_) {}
    };
    reader.readAsDataURL(file);
  }

  const avatarUrl = user?.avatar || null;

  return (
    <>
      <div className="card profile-header-card">
        <label className="profile-avatar-wrap" style={{ cursor: 'pointer', flexShrink: 0 }}>
          <input type="file" accept="image/*" onChange={handlePfpChange} style={{ display: 'none' }} />
          <div className="profile-avatar">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              (displayName || session.username).charAt(0).toUpperCase()
            )}
          </div>
          <span className="profile-avatar-edit" title="Change photo">Edit</span>
        </label>
        <div className="profile-info">
          <div className="profile-name-row">
            {editingName ? (
              <>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  style={{ flex: 1, padding: '0.35rem 0.5rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '1.25rem' }}
                  autoFocus
                />
                <button type="button" className="btn btn-primary" onClick={handleSaveName}>Save</button>
                <button type="button" className="btn btn-ghost" onClick={() => setEditingName(false)}>Cancel</button>
              </>
            ) : (
              <>
                <h1>{displayName}</h1>
                <button type="button" onClick={handleStartEdit} title="Edit name" aria-label="Edit name">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </>
            )}
          </div>
          <div className="profile-badges">
            <span className="badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              VERIFIED
            </span>
            {joinDate && (
              <span className="badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {joinDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            )}
            {isAdmin && (
              <span className="badge badge-admin">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                ADMIN
              </span>
            )}
            {balance > 0 && (
              <span className="badge">
                {balance} CB
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div className="stat-value">{myListings.length}</div>
          <div className="stat-label">Active Listings</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <div className="stat-value">0</div>
          <div className="stat-label">Total Views</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className="stat-value">{messageCount}</div>
          <div className="stat-label">Messages</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <div className="stat-value">0</div>
          <div className="stat-label">Unread</div>
        </div>
      </div>

      <div className="card">
        <div className="my-listings-header">
          <h2>My Listings</h2>
          <Link href="/dashboard" className="btn btn-ghost">View Market</Link>
        </div>
        {myListings.length === 0 ? (
          <div className="listings-empty">
            <svg className="listings-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <p>No listings yet</p>
            <Link href="/dashboard" className="btn btn-primary">Create Listing</Link>
          </div>
        ) : (
          myListings.map((p) => (
            <div key={p.id} className="listing-item">
              <div className="meta">{new Date(p.date).toLocaleString()}</div>
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
