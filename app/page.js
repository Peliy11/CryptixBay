'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import * as data from '@/lib/data';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const session = storage.getSession();
    if (!session) {
      router.replace('/login');
      return;
    }
    data.getBanned().then((banned) => {
      if (cancelled) return;
      if (banned.includes(session.username)) {
        router.replace('/banned');
        return;
      }
      router.replace('/dashboard');
    });
    return () => { cancelled = true; };
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-muted)' }}>Redirecting...</p>
    </div>
  );
}
