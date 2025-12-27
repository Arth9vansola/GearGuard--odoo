import React, { useEffect, useState } from 'react';
import api, { setAuthToken } from './api.js';
import LoginPage from './pages/LoginPage.jsx';
import EquipmentPage from './pages/EquipmentPage.jsx';
import KanbanPage from './pages/KanbanPage.jsx';
import CalendarPage from './pages/CalendarPage.jsx';

const views = [
  { key: 'equipment', label: 'Equipment' },
  { key: 'kanban', label: 'Kanban' },
  { key: 'calendar', label: 'Calendar' }
];

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [view, setView] = useState('equipment');
  const [requestFilter, setRequestFilter] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('gearguard_token');
    const savedUser = localStorage.getItem('gearguard_user');
    if (savedToken) {
      setAuthToken(savedToken);
      setToken(savedToken);
    }
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  function handleLogin(data) {
    setToken(data.token);
    setUser(data.user);
    setAuthToken(data.token);
    localStorage.setItem('gearguard_user', JSON.stringify(data.user));
  }

  function handleLogout() {
    setToken(null);
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem('gearguard_user');
  }

  function openEquipmentRequests(equipmentId) {
    setRequestFilter(equipmentId);
    setView('kanban');
  }

  if (!token) {
    return (
      <div className="app-shell">
        <LoginPage onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="header">
        <div className="brand">⚙️ Guardians</div>
        <nav className="nav">
          {views.map(v => (
            <button key={v.key} className={view === v.key ? 'active' : ''} onClick={() => setView(v.key)}>
              {v.label}
            </button>
          ))}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 600 }}>{user?.name}</div>
            <div style={{ fontSize: 12, color: '#5b718c' }}>{user?.role}</div>
          </div>
          <button className="nav button" onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <main className="main">
        {view === 'equipment' && <EquipmentPage api={api} user={user} onOpenRequests={openEquipmentRequests} />}
        {view === 'kanban' && <KanbanPage api={api} user={user} filterEquipmentId={requestFilter} clearFilter={() => setRequestFilter(null)} />}
        {view === 'calendar' && <CalendarPage api={api} user={user} />}
      </main>
    </div>
  );
}
