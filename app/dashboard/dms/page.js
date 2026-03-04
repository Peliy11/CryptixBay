'use client';

import { useEffect, useState } from 'react';
import { storage } from '@/lib/storage';

function id() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function threadKey(a, b) {
  return [a, b].sort().join('::');
}

export default function DMsPage() {
  const [session, setSession] = useState(null);
  const [dms, setDms] = useState({});
  const [targetUser, setTargetUser] = useState('');
  const [message, setMessage] = useState('');
  const [activeThread, setActiveThread] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const s = storage.getSession();
    setSession(s);
    setDms(storage.getDMs());
    setUsers(storage.getUsers().map((u) => u.username).filter((u) => u !== s?.username));
  }, []);

  const threads = Object.entries(dms).map(([key, messages]) => {
    const [u1, u2] = key.split('::');
    const other = u1 === session?.username ? u2 : u1;
    const last = messages[messages.length - 1];
    return { key, other, messages, last };
  });

  const currentThread = activeThread ? threads.find((t) => t.key === activeThread) : null;

  function sendMessage(toUser) {
    if (!session || !message.trim()) return;
    const key = threadKey(session.username, toUser);
    const messages = (dms[key] || []).concat({
      id: id(),
      from: session.username,
      to: toUser,
      text: message.trim(),
      date: new Date().toISOString(),
    });
    const next = { ...dms, [key]: messages };
    storage.setDMs(next);
    setDms(next);
    setMessage('');
    setActiveThread(key);
  }

  function startOrOpenThread() {
    if (!targetUser.trim()) return;
    const key = threadKey(session.username, targetUser.trim());
    if (!dms[key]) {
      const next = { ...dms, [key]: [] };
      storage.setDMs(next);
      setDms(next);
    }
    setActiveThread(key);
    setTargetUser('');
  }

  return (
    <>
      <div className="card">
        <h2>DM Services</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
          Send encrypted-style messages to other users. Start a conversation by username.
        </p>
        <div className="form-group" style={{ maxWidth: '320px' }}>
          <label>Username to message</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              value={targetUser}
              onChange={(e) => setTargetUser(e.target.value)}
              placeholder="Enter username"
              onKeyDown={(e) => e.key === 'Enter' && startOrOpenThread()}
            />
            <button type="button" className="btn btn-primary" onClick={startOrOpenThread}>Open</button>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Conversations</h2>
        {threads.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No conversations yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {threads.map((t) => (
              <button
                key={t.key}
                type="button"
                className="btn btn-ghost"
                style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                onClick={() => setActiveThread(t.key)}
              >
                @{t.other} {t.last && `· ${t.last.text.slice(0, 30)}${t.last.text.length > 30 ? '…' : ''}`}
              </button>
            ))}
          </div>
        )}
      </div>

      {currentThread && (
        <div className="card">
          <h2>Chat with @{currentThread.other}</h2>
          <div className="dm-thread" style={{ marginBottom: '1rem' }}>
            {currentThread.messages.map((m) => (
              <div
                key={m.id}
                className={`dm-message ${m.from === session?.username ? 'self' : ''}`}
              >
                <div className="dm-meta">@{m.from} · {new Date(m.date).toLocaleString()}</div>
                {m.text}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              style={{ flex: 1, padding: '0.65rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)' }}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), sendMessage(currentThread.other))}
            />
            <button type="button" className="btn btn-primary" onClick={() => sendMessage(currentThread.other)}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}
