'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { storage } from '@/lib/storage';
import * as data from '@/lib/data';

export default function BannedPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const session = storage.getSession();
    if (!session) {
      router.replace('/login');
      return;
    }
    data.getBanned().then((banned) => {
      if (cancelled) return;
      if (!banned.includes(session.username)) {
        router.replace('/dashboard');
        return;
      }
      setReady(true);
    });
    return () => { cancelled = true; };
  }, [router]);

  function handleLogout() {
    storage.clearSession();
    router.replace('/login');
  }

  if (!ready) {
    return (
      <div className="ban-page">
        <p style={{ color: 'var(--text-muted)' }}>Checking...</p>
      </div>
    );
  }

  return (
    <div className="ban-page">
      <Image src="/cb_logo.png" alt="CryptixBay" width={80} height={80} style={{ marginBottom: '1.5rem' }} />
      <h1>Access denied</h1>
      <p>Your account has been banned from CryptixBay. You cannot access the site with this account.</p>
      <button type="button" className="btn btn-ghost" onClick={handleLogout}>
        Log out
      </button>
    </div>
  );
}
