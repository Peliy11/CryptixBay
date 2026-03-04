'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [session, setSession] = useState(null);
  const [posts, setPosts] = useState([]);
  const [banned, setBanned] = useState([]);
  const [balances, setBalances] = useState({});
  const [cryptoUser, setCryptoUser] = useState('');
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const s = storage.getSession();
    setSession(s);
    const u = storage.getUsers();
    setUsers(u);
    const me = u.find((x) => x.username === s?.username);
    if (!me?.isAdmin) {
      router.replace('/dashboard');
      return;
    }
    setPosts(storage.getStorePosts());
    setBanned(storage.getBanned());
    setBalances(storage.getCryptoBalances());
  }, [router]);

  function showMsg(type, text) {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  }

  function handleGiveCrypto(e) {
    e.preventDefault();
    if (!cryptoUser.trim() || !cryptoAmount.trim()) return;
    const amount = parseFloat(cryptoAmount);
    if (isNaN(amount) || amount <= 0) {
      showMsg('error', 'Enter a valid amount.');
      return;
    }
    const next = { ...balances };
    next[cryptoUser.trim()] = (next[cryptoUser.trim()] || 0) + amount;
    storage.setCryptoBalances(next);
    setBalances(next);
    setCryptoUser('');
    setCryptoAmount('');
    showMsg('success', `Added ${amount} CB to @${cryptoUser.trim()}`);
  }

  function handleDeletePost(postId) {
    const next = posts.filter((p) => p.id !== postId);
    storage.setStorePosts(next);
    setPosts(next);
    showMsg('success', 'Listing deleted.');
  }

  function handleBan(username) {
    if (username === session?.username) {
      showMsg('error', 'You cannot ban yourself.');
      return;
    }
    if (banned.includes(username)) return;
    const next = [...banned, username];
    storage.setBanned(next);
    setBanned(next);
    showMsg('success', `Banned @${username}`);
  }

  function handleUnban(username) {
    const next = banned.filter((u) => u !== username);
    storage.setBanned(next);
    setBanned(next);
    showMsg('success', `Unbanned @${username}`);
  }

  function handleSetAdmin(username, isAdmin) {
    if (username === session?.username && !isAdmin) {
      showMsg('error', 'You cannot remove your own admin role.');
      return;
    }
    const next = users.map((u) => (u.username === username ? { ...u, isAdmin } : u));
    storage.setUsers(next);
    setUsers(next);
    showMsg('success', isAdmin ? `@${username} is now admin.` : `@${username} is no longer admin.`);
  }

  if (!session) return null;

  const isAdmin = users.find((u) => u.username === session.username)?.isAdmin;
  if (!isAdmin) return null;

  return (
    <>
      <div className="card">
        <h2>Admin Panel</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
          Give site crypto, delete listings, ban users, and set admins.
        </p>
        {message.text && (
          <p className={message.type === 'error' ? 'error-msg' : 'success-msg'}>{message.text}</p>
        )}
      </div>

      <div className="card admin-section">
        <h2>Give Crypto</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.85rem' }}>
          Credit CB (CryptixBay) balance to a user. Balances are stored locally.
        </p>
        <form onSubmit={handleGiveCrypto} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0, minWidth: '140px' }}>
            <label>Username</label>
            <input value={cryptoUser} onChange={(e) => setCryptoUser(e.target.value)} placeholder="username" />
          </div>
          <div className="form-group" style={{ marginBottom: 0, minWidth: '120px' }}>
            <label>Amount (CB)</label>
            <input type="number" step="0.01" min="0" value={cryptoAmount} onChange={(e) => setCryptoAmount(e.target.value)} placeholder="0.00" />
          </div>
          <button type="submit" className="btn btn-primary">Credit</button>
        </form>
      </div>

      <div className="card admin-section">
        <h2>Delete Listings</h2>
        {posts.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No listings.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id}>
                  <td>{p.title}</td>
                  <td>@{p.author}</td>
                  <td>{new Date(p.date).toLocaleString()}</td>
                  <td>
                    <button type="button" className="btn btn-ghost" style={{ fontSize: '0.8rem' }} onClick={() => handleDeletePost(p.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card admin-section">
        <h2>Users &amp; Ban</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Admin</th>
              <th>Balance (CB)</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.username}>
                <td>@{u.username}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ fontSize: '0.8rem' }}
                    onClick={() => handleSetAdmin(u.username, !u.isAdmin)}
                  >
                    {u.isAdmin ? 'Yes (revoke)' : 'Set admin'}
                  </button>
                </td>
                <td>{balances[u.username] ?? 0}</td>
                <td>{banned.includes(u.username) ? <span style={{ color: 'var(--danger)' }}>Banned</span> : 'Active'}</td>
                <td>
                  <div className="actions">
                    {banned.includes(u.username) ? (
                      <button type="button" className="btn btn-ghost" style={{ fontSize: '0.8rem' }} onClick={() => handleUnban(u.username)}>
                        Unban
                      </button>
                    ) : (
                      <button type="button" className="btn btn-ghost" style={{ fontSize: '0.8rem', color: 'var(--danger)' }} onClick={() => handleBan(u.username)}>
                        Ban
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
