import React, { useState } from 'react';
import api from '../api.js';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('mia@gearguard.local');
  const [name, setName] = useState('Mia Manager');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, name });
      onLogin(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-panel card">
      <h2 style={{ marginTop: 0 }}>Sign in</h2>
      <p style={{ color: '#5b718c' }}>Enter an email to get a token. Seeds: mia@gearguard.local, tom@gearguard.local, uma@gearguard.local</p>
      <form onSubmit={submit} className="grid-2">
        <div>
          <label>Email</label>
          <input className="input" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label>Name (optional)</label>
          <input className="input" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div style={{ gridColumn: '1 / span 2' }}>
          <button className="button" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Continue'}</button>
          {error && <div style={{ color: 'crimson', marginTop: 8 }}>{error}</div>}
        </div>
      </form>
    </div>
  );
}
