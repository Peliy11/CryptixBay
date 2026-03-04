'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { storage } from '@/lib/storage';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const users = storage.getUsers();
    const user = users.find((u) => u.username === username && u.password === password);
    if (!user) {
      setError('Invalid username or password.');
      return;
    }
    const banned = storage.getBanned();
    if (banned.includes(user.username)) {
      storage.setSession({ username: user.username });
      router.push('/banned');
      return;
    }
    storage.setSession({ username: user.username });
    router.push('/dashboard');
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1>
          <Image src="/cb_logo.png" alt="CryptixBay" width={36} height={36} />
          CryptixBay
        </h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          {error && <p className="error-msg">{error}</p>}
          <button type="submit">Log in</button>
        </form>
        <p className="auth-footer">
          No account? <Link href="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
