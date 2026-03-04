'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';

export default function HomePage() {
  const router = useRouter();

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
    router.replace('/dashboard');
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-muted)' }}>Redirecting...</p>
    </div>
  );
}
