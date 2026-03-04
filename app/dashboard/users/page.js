'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import * as data from '@/lib/data';

export default function UsersPage() {
  const [session, setSession] = useState(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [profileUser, setProfileUser] = useState(null);

  useEffect(() => {
    const s = storage.getSession();
    setSession(s);
    data.getUsers().then(setUsers);
  }, []);

  const otherUsers = useMemo(() => {
    return users.filter((u) => u.username !== session?.username);
  }, [users, session]);

  const filtered = useMemo(() => {
    if (!search.trim()) return otherUsers;
    const q = search.toLowerCase().trim();
    return otherUsers.filter(
      (u) =>
        (u.username || '').toLowerCase().includes(q) ||
        (u.displayName || '').toLowerCase().includes(q)
    );
  }, [otherUsers, search]);

  function openProfile(u) {
    setProfileUser(u);
  }

  const displayName = (u) => (u?.displayName || u?.username || '').trim() || u?.username;

  return (
    <>
      <div className="card">
        <h2>Find people</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
          Search users and open their profile to send a message.
        </p>
        <div className="marketplace-search" style={{ maxWidth: '400px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <h2>Users</h2>
        {filtered.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>
            {otherUsers.length === 0 ? 'No other users yet.' : 'No users match your search.'}
          </p>
        ) : (
          <div className="users-list">
            {filtered.map((u) => (
              <div key={u.username} className="user-row">
                <button
                  type="button"
                  className="user-row-inner"
                  onClick={() => openProfile(u)}
                >
                  <div className="profile-avatar user-row-avatar">
                    {u.avatar ? (
                      <img src={u.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      (displayName(u) || u.username).charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="user-row-info">
                    <strong>@{u.username}</strong>
                    {u.displayName && u.displayName !== u.username && (
                      <span className="user-row-display">{u.displayName}</span>
                    )}
                    {u.joinDate && (
                      <span className="user-row-meta">
                        Joined {new Date(u.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <span className="user-row-arrow">View profile →</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {profileUser && (
        <div className="modal-overlay" onClick={() => setProfileUser(null)}>
          <div className="modal-box user-profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="user-profile-modal-header">
              <button
                type="button"
                className="listing-detail-back"
                onClick={() => setProfileUser(null)}
                style={{ background: 'none', border: 'none', marginBottom: '0.5rem', cursor: 'pointer', color: 'var(--accent)' }}
              >
                ← Back
              </button>
            </div>
            <div className="user-profile-modal-body">
              <div className="profile-avatar user-profile-avatar">
                {profileUser.avatar ? (
                  <img src={profileUser.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  (displayName(profileUser) || profileUser.username).charAt(0).toUpperCase()
                )}
              </div>
              <h2 className="user-profile-username">@{profileUser.username}</h2>
              {profileUser.displayName && profileUser.displayName !== profileUser.username && (
                <p className="user-profile-display">{profileUser.displayName}</p>
              )}
              {profileUser.joinDate && (
                <p className="user-profile-meta">
                  Joined {new Date(profileUser.joinDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              )}
              {profileUser.isAdmin && (
                <span className="badge badge-admin" style={{ marginTop: '0.5rem' }}>Admin</span>
              )}
              <Link
                href={`/dashboard/dms?user=${encodeURIComponent(profileUser.username)}`}
                className="btn btn-primary user-profile-dm"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Send message
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
