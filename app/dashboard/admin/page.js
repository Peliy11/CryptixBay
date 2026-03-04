'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import * as data from '@/lib/data';

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
    Promise.all([data.getUsers(), data.getStorePosts(), data.getBanned(), data.getCryptoBalances()]).then(([u, p, b, bal]) => {
      setUsers(u);
      const me = u.find((x) => x.username === s?.username);
      if (!me?.isAdmin) {
        router.replace('/dashboard');
        return;
      }
      setPosts(p);
      setBanned(b);
      setBalances(bal);
    });
  }, [router]);

  function showMsg(type, text) {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  }

  async function handleGiveCrypto(e) {
    e.preventDefault();
    if (!cryptoUser.trim() || !cryptoAmount.trim()) return;
    const amount = parseFloat(cryptoAmount);
    if (isNaN(amount) || amount <= 0) {
      showMsg('error', 'Enter a valid amount.');
      return;
    }
    try {
      await data.addCryptoToUser(cryptoUser.trim(), amount);
      const bal = await data.getCryptoBalances();
      setBalances(bal);
      setCryptoUser('');
      setCryptoAmount('');
      showMsg('success', `Added ${amount} CB to @${cryptoUser.trim()}`);
    } catch (err) {
      showMsg('error', err?.message || 'Failed.');
    }
  }

  async function handleDeletePost(postId) {
    try {
      await data.deleteStorePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      showMsg('success', 'Listing deleted.');
    } catch (_) {
      showMsg('error', 'Failed to delete.');
    }
  }

  async function handleBan(username) {
    if (username === session?.username) {
      showMsg('error', 'You cannot ban yourself.');
      return;
    }
    try {
      await data.banUser(username);
      setBanned((prev) => [...prev, username]);
      showMsg('success', `Banned @${username}`);
    } catch (_) {
      showMsg('error', 'Failed to ban.');
    }
  }

  async function handleUnban(username) {
    try {
      await data.unbanUser(username);
      setBanned((prev) => prev.filter((u) => u !== username));
      showMsg('success', `Unbanned @${username}`);
    } catch (_) {
      showMsg('error', 'Failed to unban.');
    }
  }

  async function handleSetAdmin(username, isAdmin) {
    if (username === session?.username && !isAdmin) {
      showMsg('error', 'You cannot remove your own admin role.');
      return;
    }
    try {
      await data.setUserAdmin(username, isAdmin);
      setUsers((prev) => prev.map((u) => (u.username === username ? { ...u, isAdmin } : u)));
      showMsg('success', isAdmin ? `@${username} is now admin.` : `@${username} is no longer admin.`);
    } catch (_) {
      showMsg('error', 'Failed to update.');
    }
  }

  if (!session) return null;

  const isAdmin = users.find((u) => u.username === session.username)?.isAdmin;
  if (!isAdmin) return null;

  return (
    <>
      <div className="card">
        <h2>Admin Panel</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
          Give site crypto, delete listings, ban users, and set admins. Use <strong>Config</strong> for a quick list to manage admins.
        </p>
        {message.text && (
          <p className={message.type === 'error' ? 'error-msg' : 'success-msg'}>{message.text}</p>
        )}
      </div>

      <div className="card admin-section">
        <h2>Give Crypto</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.85rem' }}>
          Credit CB (CryptixBay) balance to a user.
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
