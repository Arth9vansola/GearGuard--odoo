import React, { useEffect, useState } from 'react';

export default function ReportsPage({ api }) {
  const [teamStats, setTeamStats] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [typeStats, setTypeStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('team');

  async function load() {
    setLoading(true);
    try {
      const [team, category, type] = await Promise.all([
        api.get('/reports/by-team'),
        api.get('/reports/by-category'),
        api.get('/reports/by-type')
      ]);
      setTeamStats(team.data);
      setCategoryStats(category.data);
      setTypeStats(type.data);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const maxTeam = Math.max(...teamStats.map(t => t.request_count), 1);
  const maxCategory = Math.max(...categoryStats.map(c => c.request_count), 1);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontSize: 26, background: 'linear-gradient(135deg, #1ea896, #6c5ce7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          📊 Analytics & Reports
        </h3>
        {loading && <span style={{ color: '#5b718c' }}>⟳ Loading...</span>}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <button 
          className={`nav button ${view === 'team' ? 'active' : ''}`}
          onClick={() => setView('team')}
        >
          By Team
        </button>
        <button 
          className={`nav button ${view === 'category' ? 'active' : ''}`}
          onClick={() => setView('category')}
        >
          By Equipment Category
        </button>
        <button 
          className={`nav button ${view === 'type' ? 'active' : ''}`}
          onClick={() => setView('type')}
        >
          By Request Type
        </button>
      </div>

      {view === 'team' && (
        <div className="card">
          <h4 style={{ marginTop: 0, fontSize: 20, color: '#1ea896' }}>🏆 Requests by Maintenance Team</h4>
          <div style={{ display: 'grid', gap: 16 }}>
            {teamStats.map((team, idx) => (
              <div key={idx} className="report-row">
                <div className="report-label">
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{team.team_name}</div>
                  <div className="report-breakdown">
                    <span style={{ color: '#fdcb6e' }}>New: {team.new_count}</span>
                    <span style={{ color: '#1ea896' }}>In Progress: {team.in_progress_count}</span>
                    <span style={{ color: '#00b894' }}>Repaired: {team.repaired_count}</span>
                    <span style={{ color: '#e34c4c' }}>Scrap: {team.scrap_count}</span>
                  </div>
                </div>
                <div className="report-bar-container">
                  <div 
                    className="report-bar"
                    style={{ width: `${(team.request_count / maxTeam) * 100}%` }}
                  >
                    <span className="report-count">{team.request_count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'category' && (
        <div className="card">
          <h4 style={{ marginTop: 0, fontSize: 20, color: '#1ea896' }}>🔧 Requests by Equipment Category</h4>
          <div style={{ display: 'grid', gap: 16 }}>
            {categoryStats.map((cat, idx) => (
              <div key={idx} className="report-row">
                <div className="report-label">
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{cat.category}</div>
                  <div className="report-breakdown">
                    <span style={{ color: '#6c5ce7' }}>Corrective: {cat.corrective_count}</span>
                    <span style={{ color: '#ff8a4c' }}>Preventive: {cat.preventive_count}</span>
                    <span style={{ color: '#00b894' }}>Repaired: {cat.repaired_count}</span>
                  </div>
                </div>
                <div className="report-bar-container">
                  <div 
                    className="report-bar"
                    style={{ width: `${(cat.request_count / maxCategory) * 100}%` }}
                  >
                    <span className="report-count">{cat.request_count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'type' && (
        <div className="grid-2">
          {typeStats.map((type, idx) => (
            <div key={idx} className="card" style={{ background: idx === 0 ? 'linear-gradient(135deg, rgba(108,92,231,0.08), rgba(30,168,150,0.08))' : 'linear-gradient(135deg, rgba(255,138,76,0.08), rgba(253,203,110,0.08))' }}>
              <h4 style={{ marginTop: 0, fontSize: 18, textTransform: 'capitalize', color: idx === 0 ? '#6c5ce7' : '#ff8a4c' }}>
                {type.request_type}
              </h4>
              <div style={{ fontSize: 48, fontWeight: 800, marginBottom: 16, background: idx === 0 ? 'linear-gradient(135deg, #6c5ce7, #1ea896)' : 'linear-gradient(135deg, #ff8a4c, #fdcb6e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {type.count}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, fontSize: 13 }}>
                <div className="stat-pill" style={{ background: 'rgba(253,203,110,0.3)' }}>
                  <div style={{ fontWeight: 700 }}>{type.new_count}</div>
                  <div style={{ color: '#5b718c' }}>New</div>
                </div>
                <div className="stat-pill" style={{ background: 'rgba(30,168,150,0.3)' }}>
                  <div style={{ fontWeight: 700 }}>{type.in_progress_count}</div>
                  <div style={{ color: '#5b718c' }}>In Progress</div>
                </div>
                <div className="stat-pill" style={{ background: 'rgba(0,184,148,0.3)' }}>
                  <div style={{ fontWeight: 700 }}>{type.repaired_count}</div>
                  <div style={{ color: '#5b718c' }}>Repaired</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
