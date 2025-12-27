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
    <div className="login-wrapper">
      <div className="login-panel card">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className="login-logo">⚙️</div>
          <h1 className="login-title">Guardians</h1>
          <p className="login-subtitle">Equipment Maintenance Management</p>
        </div>
        
        <h2 style={{ marginTop: 0, fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Sign in</h2>
        <form onSubmit={submit}>
          <div style={{ display: 'grid', gap: 20, marginBottom: 24 }}>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14, color: '#0c1f36' }}>Email</label>
              <input 
                className="input" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                placeholder="your.email@gearguard.local"
                required
              />
            </div>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14, color: '#0c1f36' }}>Name (optional)</label>
              <input 
                className="input" 
                value={name} 
                onChange={e => setName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
          </div>
          
          <button className="button" type="submit" disabled={loading} style={{ width: '100%', padding: '14px 20px', fontSize: 16 }}>
            {loading ? '⟳ Signing in...' : '→ Continue'}
          </button>
          
          {error && (
            <div style={{ 
              marginTop: 16, 
              padding: '12px 16px', 
              background: 'rgba(227,76,76,0.1)', 
              border: '2px solid rgba(227,76,76,0.3)',
              borderRadius: 12,
              color: '#e34c4c',
              fontWeight: 600,
              fontSize: 14
            }}>
              ⚠️ {error}
            </div>
          )}
        </form>
        
        <div className="login-footer">
          <p style={{ margin: 0, fontSize: 13, color: '#5b718c' }}>
            🔒 Secure authentication • 🎯 Role-based access
          </p>
        </div>
      </div>
    </div>
  );
}
