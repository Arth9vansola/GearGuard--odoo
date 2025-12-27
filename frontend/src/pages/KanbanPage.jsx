import React, { useEffect, useState } from 'react';
import { format, isBefore, startOfDay } from 'date-fns';

const columns = [
  { key: 'new', label: 'New' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'repaired', label: 'Repaired' },
  { key: 'scrap', label: 'Scrap' }
];

export default function KanbanPage({ api, user }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragItem, setDragItem] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/requests');
      setItems(res.data);
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

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Maintenance Board</h3>
        {loading && <span style={{ color: '#5b718c' }}>Refreshing...</span>}
        {error && <span style={{ color: 'crimson' }}>{error}</span>}
      </div>
      <div className="kanban">
        {columns.map(col => (
          <div key={col.key} className="kanban-column" onDragOver={allowDrop} onDrop={() => onDrop(col.key)}>
            <h3>{col.label} <span className="badge">{items.filter(i => i.status === col.key).length}</span></h3>
            {items.filter(i => i.status === col.key).map(item => (
              <div
                key={item.id}
                className={`kanban-card ${overdue(item) ? 'overdue' : ''}`}
                draggable
                onDragStart={() => onDragStart(item)}
              >
                <div style={{ fontWeight: 700 }}>{item.subject}</div>
                <div style={{ color: '#5b718c', fontSize: 13 }}>{item.equipment_name || 'Unassigned equipment'}</div>
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
  return (
    <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(30,168,150,0.18)', display: 'grid', placeItems: 'center', fontWeight: 700 }}>
      {initial}
    </div>
  );
}
