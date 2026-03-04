'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { storage } from '@/lib/storage';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const session = storage.getSession();
    if (!session) {
      router.replace('/login');
      return;
    }
    const banned = storage.getBanned();
    if (banned.includes(session.username)) {
      router.replace('/banned');
      return;
    }
    const users = storage.getUsers();
    const current = users.find((u) => u.username === session.username);
    setUser(session);
    setIsAdmin(current?.isAdmin === true);
  }, [router]);

  function handleLogout() {
    storage.clearSession();
    router.replace('/login');
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      </div>
    );
  }

  const nav = [
    { href: '/dashboard', label: 'Store' },
    { href: '/dashboard/profile', label: 'Profile' },
    { href: '/dashboard/dms', label: 'DMs' },
    { href: '/dashboard/news', label: 'News' },
    ...(isAdmin ? [{ href: '/dashboard/admin', label: 'Admin' }] : []),
    { href: '/dashboard/settings', label: 'Settings' },
  ];

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <Link href="/dashboard">
          <Image src="/cb_logo.png" alt="CryptixBay" width={28} height={28} />
          CryptixBay
        </Link>
        <nav className="dashboard-nav">
          {nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={pathname === href || (href === '/dashboard/admin' && pathname?.startsWith('/dashboard/admin')) ? 'active' : ''}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="user-bar">
          {isAdmin && <span className="badge badge-admin" style={{ marginRight: '0.5rem', padding: '0.2rem 0.4rem', fontSize: '0.7rem' }}>ADMIN</span>}
          <span>@{user.username}</span>
          <button type="button" onClick={handleLogout}>Log out</button>
        </div>
      </header>
      <main className="dashboard-main">{children}</main>
    </div>
  );
}
