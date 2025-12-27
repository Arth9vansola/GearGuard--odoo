import React, { useEffect, useState } from 'react';

const emptyForm = {
  name: '', serial_number: '', category: '', purchase_date: '', warranty_info: '', location: '', department: '', assigned_employee: '', maintenance_team_id: ''
};

export default function EquipmentPage({ api, onOpenRequests }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/equipment');
      setItems(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function submit(e) {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/equipment', { ...form, maintenance_team_id: form.maintenance_team_id ? Number(form.maintenance_team_id) : null });
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save');
    }
  }

  return (
    <div className="grid-2">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 24, background: 'linear-gradient(135deg, #1ea896, #6c5ce7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>🔧 Equipment Inventory</h3>
          {loading && <span style={{ color: '#5b718c' }}>⟳ Refreshing...</span>}
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th><th>Serial</th><th>Location</th><th>Smart Count</th><th>Maintenance</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.serial_number}</td>
                <td>{item.location}</td>
                <td><span className="badge">{item.open_request_count}</span></td>
                <td>
                  <button className="button" type="button" style={{ padding: '6px 10px' }}
                    onClick={() => onOpenRequests?.(item.id)}>
                    Maintenance
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {error && <div style={{ color: 'crimson' }}>{error}</div>}
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0, fontSize: 20, color: '#1ea896' }}>➕ Add New Equipment</h3>
        <form className="grid-2" onSubmit={submit}>
          {Object.entries({
            name: 'Name', serial_number: 'Serial', category: 'Category', purchase_date: 'Purchase date', warranty_info: 'Warranty', location: 'Location', department: 'Department', assigned_employee: 'Assigned to', maintenance_team_id: 'Team ID'
          }).map(([key, label]) => (
            <div key={key} style={{ gridColumn: key === 'warranty_info' ? '1 / span 2' : undefined }}>
              <label>{label}</label>
              <input
                className="input"
                value={form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                type={key === 'purchase_date' ? 'date' : 'text'}
              />
            </div>
          ))}
          <div style={{ gridColumn: '1 / span 2' }}>
            <button className="button" type="submit">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
