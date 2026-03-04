'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import * as data from '@/lib/data';

export default function ConfigPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [session, setSession] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const s = storage.getSession();
    setSession(s);
    data.getUsers().then(setUsers);
  }, []);

  const currentUser = session ? users.find((u) => u.username === session.username) : null;
  const isAdmin = currentUser?.isAdmin === true;

  useEffect(() => {
    if (session && users.length && !isAdmin) {
      router.replace('/dashboard');
    }
  }, [session, users, isAdmin, router]);

  async function handleSetAdmin(username, admin) {
    try {
      await data.setUserAdmin(username, admin);
      setUsers((prev) => prev.map((u) => (u.username === username ? { ...u, isAdmin: admin } : u)));
      setMessage({ type: 'success', text: admin ? `@${username} is now admin.` : `@${username} is no longer admin.` });
    } catch (err) {
      setMessage({ type: 'error', text: err?.message || 'Failed to update.' });
    }
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  }

  if (!session || !isAdmin) return null;

  return (
    <div className="card">
      <h2>Config — Set admins</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
        Choose which users are admins. Admins can delete listings, ban users, give crypto, and manage other admins here.
      </p>
      {message.text && (
        <p className={message.type === 'error' ? 'error-msg' : 'success-msg'}>{message.text}</p>
      )}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Admin</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.username}>
              <td>@{u.username}</td>
              <td>{u.isAdmin ? 'Yes' : 'No'}</td>
              <td>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ fontSize: '0.8rem' }}
                  onClick={() => handleSetAdmin(u.username, !u.isAdmin)}
                  disabled={u.username === session.username && u.isAdmin}
                >
                  {u.isAdmin ? 'Revoke admin' : 'Make admin'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
