'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { storage } from '@/lib/storage';

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }
    const users = storage.getUsers();
    if (users.some((u) => u.username === username)) {
      setError('Username already taken.');
      return;
    }
    const isFirstUser = users.length === 0;
    users.push({
      username,
      password,
      isAdmin: isFirstUser,
      joinDate: new Date().toISOString(),
    });
    storage.setUsers(users);
    storage.setSession({ username });
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
            minLength={4}
            autoComplete="new-password"
          />
          <label htmlFor="confirm">Confirm password</label>
          <input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
          />
          {error && <p className="error-msg">{error}</p>}
          <button type="submit">Create account</button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
