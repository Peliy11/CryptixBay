import { supabase, isSupabaseConfigured } from './supabase';
import { storage } from './storage';

function useStorage() {
  return !isSupabaseConfigured();
}

// Username that is always an admin (can still set others in Config/Admin)
const ALWAYS_ADMIN_USERNAME = 'Peliy11';

function ensureAlwaysAdmin(users) {
  return users.map((u) => (u.username === ALWAYS_ADMIN_USERNAME ? { ...u, isAdmin: true } : u));
}

// --- Users ---
export function getUsers() {
  if (useStorage()) {
    return Promise.resolve(ensureAlwaysAdmin(storage.getUsers()));
  }
  return supabase.from('users').select('*').order('join_date', { ascending: true }).then(({ data, error }) => {
    if (error) throw error;
    return ensureAlwaysAdmin((data || []).map(normUser));
  });
}

export async function createUser(user) {
  if (useStorage()) {
    const users = storage.getUsers();
    users.push(user);
    storage.setUsers(users);
    return user;
  }
  const { data, error } = await supabase.from('users').insert({
    username: user.username,
    password: user.password,
    is_admin: user.isAdmin ?? false,
    join_date: user.joinDate || new Date().toISOString(),
    display_name: user.displayName || null,
    avatar: user.avatar || null,
  }).select().single();
  if (error) throw error;
  return normUser(data);
}

export async function updateUser(username, updates) {
  if (useStorage()) {
    const users = storage.getUsers().map((u) =>
      u.username === username ? { ...u, ...updates } : u
    );
    storage.setUsers(users);
    return;
  }
  const row = {};
  if (updates.isAdmin !== undefined) row.is_admin = updates.isAdmin;
  if (updates.displayName !== undefined) row.display_name = updates.displayName;
  if (updates.avatar !== undefined) row.avatar = updates.avatar;
  if (Object.keys(row).length === 0) return;
  const { error } = await supabase.from('users').update(row).eq('username', username);
  if (error) throw error;
}

export async function setUserAdmin(username, isAdmin) {
  return updateUser(username, { isAdmin });
}

// Normalize user from DB shape
function normUser(r) {
  if (!r) return null;
  return {
    username: r.username,
    password: r.password,
    isAdmin: r.is_admin ?? r.isAdmin,
    joinDate: r.join_date ?? r.joinDate,
    displayName: r.display_name ?? r.displayName,
    avatar: r.avatar,
  };
}

// --- Store posts ---
export function getStorePosts() {
  if (useStorage()) return Promise.resolve(storage.getStorePosts());
  return supabase.from('store_posts').select('*').order('date', { ascending: false }).then(({ data, error }) => {
    if (error) throw error;
    return (data || []).map((r) => ({
    id: r.id,
    author: r.author_username,
    title: r.title,
    description: r.description,
    price: r.price,
    date: r.date,
    category: r.category || 'OTHER',
    image: r.image,
    views: r.views ?? 0,
  }));
  });
}

export async function addStorePost(post) {
  if (useStorage()) {
    const posts = storage.getStorePosts();
    posts.unshift(post);
    storage.setStorePosts(posts);
    return post;
  }
  const { data, error } = await supabase.from('store_posts').insert({
    author_username: post.author,
    title: post.title,
    description: post.description || '',
    price: post.price || '0',
    date: post.date || new Date().toISOString(),
    category: post.category || 'OTHER',
    image: post.image || null,
    views: post.views ?? 0,
  }).select().single();
  if (error) throw error;
  return { ...post, id: data.id };
}

export async function updateStorePost(id, updates) {
  if (useStorage()) {
    const posts = storage.getStorePosts().map((p) => (p.id === id ? { ...p, ...updates } : p));
    storage.setStorePosts(posts);
    return;
  }
  const row = {};
  if (updates.views !== undefined) row.views = updates.views;
  if (Object.keys(row).length === 0) return;
  const { error } = await supabase.from('store_posts').update(row).eq('id', id);
  if (error) throw error;
}

export async function deleteStorePost(id) {
  if (useStorage()) {
    storage.setStorePosts(storage.getStorePosts().filter((p) => p.id !== id));
    return;
  }
  const { error } = await supabase.from('store_posts').delete().eq('id', id);
  if (error) throw error;
}

// --- DMs (thread_key = sorted usernames joined) ---
export function getDms() {
  if (useStorage()) return Promise.resolve(storage.getDMs());
  return supabase.from('dm_messages').select('*').order('date', { ascending: true }).then(({ data, error }) => {
    if (error) throw error;
    const threads = {};
    (data || []).forEach((m) => {
      const key = m.thread_key;
      if (!threads[key]) threads[key] = [];
      threads[key].push({
        id: m.id,
        from: m.from_username,
        to: m.to_username,
        text: m.text,
        date: m.date,
      });
    });
    return threads;
  });
}

export async function sendDm(threadKey, from, to, text) {
  const msg = { id: null, from, to, text, date: new Date().toISOString() };
  if (useStorage()) {
    const dms = storage.getDMs();
    msg.id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    dms[threadKey] = (dms[threadKey] || []).concat([msg]);
    storage.setDMs(dms);
    return msg;
  }
  const { data, error } = await supabase.from('dm_messages').insert({
    thread_key: threadKey,
    from_username: from,
    to_username: to,
    text,
    date: msg.date,
  }).select().single();
  if (error) throw error;
  return { id: data.id, from, to, text, date: data.date };
}

// --- News ---
export function getNews() {
  if (useStorage()) return Promise.resolve(storage.getNews());
  return supabase.from('news').select('*').order('date', { ascending: false }).then(({ data, error }) => {
    if (error) throw error;
    return (data || []).map((r) => ({
    id: r.id,
    title: r.title,
    body: r.body,
    date: r.date,
    author: r.author_username,
  }));
  });
}

export async function addNews(item) {
  if (useStorage()) {
    const news = storage.getNews();
    news.unshift(item);
    storage.setNews(news);
    return item;
  }
  const { data, error } = await supabase.from('news').insert({
    title: item.title,
    body: item.body || '',
    date: item.date || new Date().toISOString(),
    author_username: item.author,
  }).select().single();
  if (error) throw error;
  return { ...item, id: data.id };
}

// --- Banned ---
export function getBanned() {
  if (useStorage()) return Promise.resolve(storage.getBanned());
  return supabase.from('banned').select('username').then(({ data, error }) => {
    if (error) throw error;
    return (data || []).map((r) => r.username);
  });
}

export async function setBanned(usernames) {
  if (useStorage()) {
    storage.setBanned(usernames);
    return;
  }
  const current = await getBanned();
  for (const u of current) {
    if (!usernames.includes(u)) await supabase.from('banned').delete().eq('username', u);
  }
  for (const u of usernames) {
    if (!current.includes(u)) await supabase.from('banned').insert({ username: u });
  }
}

export async function banUser(username) {
  const list = await getBanned();
  if (list.includes(username)) return;
  await setBanned([...list, username]);
}

export async function unbanUser(username) {
  await setBanned((await getBanned()).filter((u) => u !== username));
}

// --- Crypto balances ---
export function getCryptoBalances() {
  if (useStorage()) return Promise.resolve(storage.getCryptoBalances());
  return supabase.from('crypto_balances').select('username, balance').then(({ data, error }) => {
    if (error) throw error;
    const out = {};
    (data || []).forEach((r) => { out[r.username] = Number(r.balance) || 0; });
    return out;
  });
}

export async function setCryptoBalance(username, balance) {
  if (useStorage()) {
    const b = storage.getCryptoBalances();
    b[username] = balance;
    storage.setCryptoBalances(b);
    return;
  }
  const { error } = await supabase.from('crypto_balances').upsert({ username, balance }, { onConflict: 'username' });
  if (error) throw error;
}

export async function addCryptoToUser(username, amount) {
  const balances = await getCryptoBalances();
  const current = balances[username] || 0;
  await setCryptoBalance(username, current + amount);
}
