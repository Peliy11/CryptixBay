const KEYS = {
  USERS: 'cryptixbay_users',
  SESSION: 'cryptixbay_session',
  THEME: 'cryptixbay_theme',
  STORE_POSTS: 'cryptixbay_store_posts',
  DMS: 'cryptixbay_dms',
  NEWS: 'cryptixbay_news',
  BANNED: 'cryptixbay_banned',
  CRYPTO_BALANCES: 'cryptixbay_crypto_balances',
};

function get(key, fallback = null) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function set(key, value) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (_) {}
}

export const storage = {
  getUsers: () => get(KEYS.USERS, []),
  setUsers: (users) => set(KEYS.USERS, users),
  getSession: () => get(KEYS.SESSION),
  setSession: (user) => set(KEYS.SESSION, user),
  clearSession: () => set(KEYS.SESSION, null),
  getTheme: () => get(KEYS.THEME, 'green'),
  setTheme: (theme) => set(KEYS.THEME, theme),
  getStorePosts: () => get(KEYS.STORE_POSTS, []),
  setStorePosts: (posts) => set(KEYS.STORE_POSTS, posts),
  getDMs: () => get(KEYS.DMS, {}),
  setDMs: (dms) => set(KEYS.DMS, dms),
  getNews: () => get(KEYS.NEWS, []),
  setNews: (news) => set(KEYS.NEWS, news),
  getBanned: () => get(KEYS.BANNED, []),
  setBanned: (list) => set(KEYS.BANNED, list),
  getCryptoBalances: () => get(KEYS.CRYPTO_BALANCES, {}),
  setCryptoBalances: (balances) => set(KEYS.CRYPTO_BALANCES, balances),
};

export default storage;
