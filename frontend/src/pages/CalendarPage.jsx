import React, { useEffect, useMemo, useState } from 'react';
import { addDays, eachDayOfInterval, endOfMonth, format, startOfMonth, startOfWeek } from 'date-fns';

export default function CalendarPage({ api, user }) {
  const [requests, setRequests] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [form, setForm] = useState({ subject: 'Preventive check', equipment_id: '', scheduled_date: format(new Date(), 'yyyy-MM-dd') });
  const [error, setError] = useState(null);

  async function load() {
    const [reqRes, eqRes] = await Promise.all([api.get('/requests'), api.get('/equipment')]);
    setRequests(reqRes.data.filter(r => r.request_type === 'preventive'));
    setEquipment(eqRes.data);
  }

  useEffect(() => { load(); }, []);

  async function create(date) {
    if (user.role !== 'manager') {
      alert('Only managers can create preventive requests');
      return;
    }
    console.log('Creating request for date:', date); // Debug log
    try {
      await api.post('/requests', {
        subject: form.subject,
        request_type: 'preventive',
        scheduled_date: date,
        equipment_id: form.equipment_id ? Number(form.equipment_id) : null,
        status: 'new'
      });
      setError(null);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create');
    }
  }

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(new Date()), { weekStartsOn: 1 });
    const end = endOfMonth(new Date());
    const span = eachDayOfInterval({ start, end: addDays(end, 7) });
    return span;
  }, []);

  return (
    <div className="grid-2">
      <div className="card">
        <h3 style={{ marginTop: 0, fontSize: 24, background: 'linear-gradient(135deg, #1ea896, #6c5ce7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>📅 Preventive Calendar</h3>
        <div className="calendar-grid">
          {days.map(day => {
            const key = format(day, 'yyyy-MM-dd');
            const dayReqs = requests.filter(r => r.scheduled_date?.startsWith(key));
            return (
              <div key={key} className="calendar-day" onClick={() => create(key)}>
                <h4>{format(day, 'MMM d')}</h4>
                <div style={{ fontSize: 10, color: '#999', marginBottom: 4 }}>{key}</div>
                <div className="day-requests">
                  {dayReqs.map(r => (
                    <div key={r.id} className="calendar-pill">{r.subject}</div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0, fontSize: 20, color: '#1ea896' }}>📝 New Preventive Request</h3>
        <div className="grid-2">
          <div>
            <label>Subject</label>
            <input className="input" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
          </div>
          <div>
            <label>Equipment</label>
            <select className="input" value={form.equipment_id} onChange={e => setForm({ ...form, equipment_id: e.target.value })}>
              <option value="">Select equipment</option>
              {equipment.map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
            </select>
          </div>
          <div>
            <label>Date</label>
            <input className="input" type="date" value={form.scheduled_date} onChange={e => setForm({ ...form, scheduled_date: e.target.value })} />
          </div>
          <div style={{ gridColumn: '1 / span 2' }}>
            <button className="button" onClick={() => create(form.scheduled_date)}>Create</button>
            {error && <div style={{ color: 'crimson', marginTop: 8 }}>{error}</div>}
            <p style={{ color: '#5b718c' }}>Tip: click any date on the calendar to add quickly.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
