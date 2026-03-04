'use client';

import { useEffect, useState } from 'react';
import { storage } from '@/lib/storage';

export default function SettingsPage() {
  const [theme, setTheme] = useState('green');

  useEffect(() => {
    setTheme(storage.getTheme());
  }, []);

  function applyTheme(value) {
    storage.setTheme(value);
    setTheme(value);
    document.documentElement.classList.remove('theme-green', 'theme-purple');
    document.documentElement.classList.add(value === 'purple' ? 'theme-purple' : 'theme-green');
  }

  return (
    <div className="card">
      <h2>Settings</h2>
      <div className="settings-option">
        <span>Theme</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            className="theme-swatch green"
            title="Green"
            onClick={() => applyTheme('green')}
            style={{ borderColor: theme === 'green' ? 'var(--text-primary)' : undefined, boxShadow: theme === 'green' ? '0 0 0 2px var(--accent)' : undefined }}
          />
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Green</span>
          <button
            type="button"
            className="theme-swatch purple"
            title="Purple"
            onClick={() => applyTheme('purple')}
            style={{ borderColor: theme === 'purple' ? 'var(--text-primary)' : undefined, boxShadow: theme === 'purple' ? '0 0 0 2px var(--accent)' : undefined }}
          />
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Purple</span>
        </div>
      </div>
      <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        Theme is saved to this device. CryptixBay does not track or store preferences on servers.
      </p>
    </div>
  );
}
