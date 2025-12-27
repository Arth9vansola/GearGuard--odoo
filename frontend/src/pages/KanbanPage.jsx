import React, { useEffect, useState } from 'react';
import { format, isBefore, startOfDay } from 'date-fns';

const columns = [
  { key: 'new', label: 'New' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'repaired', label: 'Repaired' },
  { key: 'scrap', label: 'Scrap' }
];

const emptyForm = {
  subject: 'New request',
  request_type: 'corrective',
  equipment_id: '',
  scheduled_date: '',
  assign_to_me: false
};

export default function KanbanPage({ api, user, filterEquipmentId, clearFilter }) {
  const [items, setItems] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragItem, setDragItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [reqRes, eqRes] = await Promise.all([
        api.get('/requests'),
        api.get('/equipment')
      ]);
      setItems(reqRes.data);
      setEquipment(eqRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function overdue(item) {
    if (!item.scheduled_date || item.status === 'repaired') return false;
    return isBefore(new Date(item.scheduled_date), startOfDay(new Date()));
  }

  function onDragStart(item) { setDragItem(item); }
  function allowDrop(ev) { ev.preventDefault(); }

  async function onDrop(status) {
    if (!dragItem) return;
    if (!['manager', 'technician'].includes(user.role)) {
      alert('Only team members can move cards');
      return;
    }
    try {
      await api.put(`/requests/${dragItem.id}`, { status });
      setDragItem(null);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to move card');
    }
  }

  async function createRequest(e) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await api.post('/requests', {
        subject: form.subject,
        request_type: form.request_type,
        equipment_id: form.equipment_id ? Number(form.equipment_id) : null,
        scheduled_date: form.scheduled_date || null,
        assigned_technician: form.assign_to_me ? user.id : null,
        status: 'new'
      });
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create request');
    } finally {
      setCreating(false);
    }
  }

  const filteredItems = filterEquipmentId
    ? items.filter(i => i.equipment_id === filterEquipmentId)
    : items;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 26, background: 'linear-gradient(135deg, #1ea896, #ff8a4c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>📋 Maintenance Board</h3>
        {loading && <span style={{ color: '#5b718c' }}>⟳ Refreshing...</span>}
        {error && <span style={{ color: 'crimson' }}>{error}</span>}
      </div>
      <div className="card" style={{ marginBottom: 14 }}>
        <h4 style={{ marginTop: 0, color: '#1ea896', fontSize: 18 }}>✨ Create New Request</h4>
        <form className="grid-2" onSubmit={createRequest}>
          <div>
            <label>Subject</label>
            <input className="input" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
          </div>
          <div>
            <label>Type</label>
            <select className="input" value={form.request_type} onChange={e => setForm({ ...form, request_type: e.target.value })}>
              <option value="corrective">Corrective</option>
              <option value="preventive">Preventive</option>
            </select>
          </div>
          <div>
            <label>Equipment</label>
            <select className="input" value={form.equipment_id} onChange={e => setForm({ ...form, equipment_id: e.target.value })} required>
              <option value="">Select equipment</option>
              {equipment.map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
            </select>
          </div>
          <div>
            <label>Scheduled date (for preventive)</label>
            <input className="input" type="date" value={form.scheduled_date} onChange={e => setForm({ ...form, scheduled_date: e.target.value })} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={form.assign_to_me} id="assignToMe" onChange={e => setForm({ ...form, assign_to_me: e.target.checked })} />
            <label htmlFor="assignToMe">Assign to me ({user.name})</label>
          </div>
          <div style={{ gridColumn: '1 / span 2' }}>
            <button className="button" type="submit" disabled={creating}>{creating ? 'Creating...' : 'Create request'}</button>
            <span style={{ color: '#5b718c', marginLeft: 10 }}>Team auto-fills from equipment.</span>
          </div>
        </form>
      </div>
      {filterEquipmentId && (
        <div className="card" style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, rgba(30,168,150,0.08), rgba(108,92,231,0.08))' }}>
          <div style={{ fontWeight: 600 }}>🔍 Filtered: Equipment ID {filterEquipmentId}</div>
          <button className="button" type="button" style={{ padding: '6px 14px', fontSize: 13 }} onClick={clearFilter}>Clear Filter</button>
        </div>
      )}
      <div className="kanban">
        {columns.map(col => (
          <div key={col.key} className="kanban-column" onDragOver={allowDrop} onDrop={() => onDrop(col.key)}>
            <h3>{col.label} <span className="badge">{filteredItems.filter(i => i.status === col.key).length}</span></h3>
            {filteredItems.filter(i => i.status === col.key).map(item => (
              <div
                key={item.id}
                className={`kanban-card ${overdue(item) ? 'overdue' : ''}`}
                draggable
                onDragStart={() => onDragStart(item)}
                style={overdue(item) ? { borderLeft: '5px solid #e34c4c' } : undefined}
              >
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{item.subject}</div>
                <div style={{ color: '#5b718c', fontSize: 13, marginBottom: 8 }}>🔧 {item.equipment_name || 'Unassigned equipment'}</div>
                <div className="kanban-meta">
                  <div>{item.request_type}</div>
                  {item.scheduled_date && <div>{format(new Date(item.scheduled_date), 'MMM d')}</div>}
                </div>
                <div className="kanban-meta">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Avatar name={item.technician_name} />
                    <span style={{ fontSize: 12 }}>{item.technician_name || 'Unassigned'}</span>
                  </div>
                  {overdue(item) && <span style={{ color: '#ff8a4c', fontWeight: 600 }}>Overdue</span>}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Avatar({ name }) {
  const initial = name ? name[0].toUpperCase() : '?';
  const colors = ['#1ea896', '#ff8a4c', '#6c5ce7', '#00b894', '#fdcb6e'];
  const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;
  return (
    <div style={{ 
      width: 32, 
      height: 32, 
      borderRadius: '50%', 
      background: `linear-gradient(135deg, ${colors[colorIndex]}, ${colors[(colorIndex + 1) % colors.length]})`,
      display: 'grid', 
      placeItems: 'center', 
      fontWeight: 700,
      color: '#fff',
      fontSize: 14,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    }}>
      {initial}
    </div>
  );
}
