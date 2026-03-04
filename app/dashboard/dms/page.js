'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { storage } from '@/lib/storage';
import * as data from '@/lib/data';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

function threadKey(a, b) {
  return [a, b].sort().join('::');
}

function formatTime(isoDate) {
  try {
    const d = new Date(isoDate);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch {
    return '';
  }
}

export default function DMsPage() {
  const searchParams = useSearchParams();
  const [session, setSession] = useState(null);
  const [dms, setDms] = useState({});
  const [targetUser, setTargetUser] = useState('');
  const [message, setMessage] = useState('');
  const [activeThread, setActiveThread] = useState(null);
  const [users, setUsers] = useState([]);
  const [showNewConv, setShowNewConv] = useState(false);
  const [dmReads, setDmReads] = useState({});

  useEffect(() => {
    const s = storage.getSession();
    setSession(s);
    setDmReads(storage.getDmReads());
    data.getDms().then(setDms);
    data.getUsers().then((u) => setUsers(u));
  }, []);

  // Realtime: refetch DMs when any message is added so sent/received messages show without refresh
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;
    const channel = supabase
      .channel('dm_messages_live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'dm_messages' }, () => {
        data.getDms().then(setDms);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const userParam = searchParams.get('user');
    if (!userParam || !session) return;
    const key = threadKey(session.username, userParam);
    setActiveThread(key);
    setTargetUser('');
  }, [searchParams, session]);

  // Build display name map (username -> displayName || username)
  const displayNames = users.reduce((acc, u) => {
    acc[u.username] = (u.displayName && u.displayName.trim()) ? u.displayName.trim() : u.username;
    return acc;
  }, {});

  const threads = Object.entries(dms).map(([key, messages]) => {
    const [u1, u2] = key.split('::');
    const other = u1 === session?.username ? u2 : u1;
    const last = messages[messages.length - 1];
    const lastRead = dmReads[key] ? new Date(dmReads[key]).getTime() : 0;
    const unread = messages.filter((m) => m.from !== session?.username && new Date(m.date).getTime() > lastRead).length;
    return {
      key,
      other,
      messages,
      last,
      displayName: displayNames[other] || other,
      unread,
      lastTime: last ? formatTime(last.date) : '',
    };
  });

  const currentThread = activeThread ? threads.find((t) => t.key === activeThread) : null;
  // New conversation: activeThread set but no messages yet — show chat pane with empty thread
  const otherInActive = activeThread ? activeThread.split('::').find((u) => u !== session?.username) : null;
  const isNewThread = activeThread && !currentThread && otherInActive;

  // When opening a thread, mark it as read
  function openThread(key) {
    setActiveThread(key);
    storage.setDmRead(key, new Date().toISOString());
    setDmReads(storage.getDmReads());
  }

  async function sendMessage(toUser) {
    if (!session || !message.trim()) return;
    const key = threadKey(session.username, toUser);
    try {
      await data.sendDm(key, session.username, toUser, message.trim());
      const updated = await data.getDms();
      setDms(updated);
    } catch (_) {}
    setMessage('');
    setActiveThread(key);
    storage.setDmRead(key, new Date().toISOString());
    setDmReads(storage.getDmReads());
  }

  function startOrOpenThread() {
    const username = targetUser.trim();
    if (!username) return;
    const key = threadKey(session.username, username);
    setActiveThread(key);
    setTargetUser('');
    setShowNewConv(false);
    storage.setDmRead(key, new Date().toISOString());
    setDmReads(storage.getDmReads());
  }

  return (
    <div className="dms-page">
      <header className="dms-header">
        <h1 className="dms-title">ENCRYPTED MESSAGES</h1>
        <p className="dms-subtitle">[ end-to-end encryption • no logs ]</p>
      </header>

      <div className="dms-layout">
        <aside className="dms-sidebar">
          <div className="dms-sidebar-header">
            <span className="dms-sidebar-icon" aria-hidden>✉</span>
            <h2>CONVERSATIONS</h2>
          </div>
          <div className="dms-new-conv">
            {showNewConv ? (
              <div className="dms-new-conv-inner">
                <input
                  value={targetUser}
                  onChange={(e) => setTargetUser(e.target.value)}
                  placeholder="Username"
                  onKeyDown={(e) => e.key === 'Enter' && startOrOpenThread()}
                  autoFocus
                />
                <div className="dms-new-conv-btns">
                  <button type="button" className="btn btn-primary" onClick={startOrOpenThread}>Open</button>
                  <button type="button" className="btn btn-ghost" onClick={() => { setShowNewConv(false); setTargetUser(''); }}>Cancel</button>
                </div>
              </div>
            ) : (
              <button type="button" className="btn btn-ghost dms-new-conv-btn" onClick={() => setShowNewConv(true)}>
                + New conversation
              </button>
            )}
          </div>
          <div className="dms-conv-list">
            {threads.length === 0 ? (
              <p className="dms-conv-empty">No conversations yet.</p>
            ) : (
              threads.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  className={`dms-conv-entry ${activeThread === t.key ? 'active' : ''}`}
                  onClick={() => openThread(t.key)}
                >
                  <span className="dms-conv-avatar" aria-hidden>👤</span>
                  <div className="dms-conv-body">
                    <div className="dms-conv-top">
                      <span className="dms-conv-name">{t.displayName}</span>
                      <span className="dms-conv-time">{t.lastTime}</span>
                    </div>
                    <p className="dms-conv-preview">
                      {t.last ? t.last.text.slice(0, 40) + (t.last.text.length > 40 ? '…' : '') : 'No messages'}
                    </p>
                  </div>
                  {t.unread > 0 && (
                    <span className="dms-unread-badge">{t.unread > 99 ? '99+' : t.unread}</span>
                  )}
                </button>
              ))
            )}
          </div>
        </aside>

        <main className="dms-chat-pane">
          {!currentThread && !isNewThread ? (
            <div className="dms-empty-state">
              <span className="dms-empty-icon" aria-hidden>✉</span>
              <p>Select a conversation</p>
            </div>
          ) : (
            <>
              <div className="dms-chat-header">
                <span className="dms-chat-avatar" aria-hidden>👤</span>
                <span className="dms-chat-name">
                  {currentThread ? (displayNames[currentThread.other] || currentThread.other) : (displayNames[otherInActive] || otherInActive)}
                </span>
                <span className="dms-chat-private">Private — only you and this user can see this thread.</span>
              </div>
              <div className="dm-thread dms-thread">
                {(currentThread ? currentThread.messages : []).map((m) => (
                  <div
                    key={m.id || m.date + m.text}
                    className={`dm-message ${m.from === session?.username ? 'self' : ''}`}
                  >
                    <div className="dm-meta">@{m.from} · {new Date(m.date).toLocaleString()}</div>
                    {m.text}
                  </div>
                ))}
              </div>
              <div className="dms-chat-input-wrap">
                <input
                  className="dms-chat-input"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyDown={(e) => {
                    const toUser = currentThread ? currentThread.other : otherInActive;
                    if (e.key === 'Enter' && toUser) e.preventDefault(), sendMessage(toUser);
                  }}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => sendMessage(currentThread ? currentThread.other : otherInActive)}
                >
                  Send
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
