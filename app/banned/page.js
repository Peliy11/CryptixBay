'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { storage } from '@/lib/storage';

export default function BannedPage() {
  const router = useRouter();

  useEffect(() => {
    const session = storage.getSession();
    const banned = storage.getBanned();
    if (!session) {
      router.replace('/login');
      return;
    }
    if (!banned.includes(session.username)) {
      router.replace('/dashboard');
    }
  }, [router]);

  function handleLogout() {
    storage.clearSession();
    router.replace('/login');
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
