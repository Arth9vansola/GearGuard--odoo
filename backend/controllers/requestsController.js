import { query } from '../models/db.js';

const baseFields = [
  'subject','request_type','equipment_id','maintenance_team_id','assigned_technician','scheduled_date','duration_hours','status'
];

async function fetchEquipmentTeam(equipmentId) {
  const eq = await query('SELECT maintenance_team_id FROM equipment WHERE id = $1', [equipmentId]);
  return eq.rows[0]?.maintenance_team_id || null;
}

export async function createRequest(req, res) {
  try {
    const payload = { ...req.body };
    if (payload.equipment_id) {
      payload.maintenance_team_id = await fetchEquipmentTeam(payload.equipment_id);
    }
    if (!payload.status) payload.status = 'new';

    const values = baseFields.map(f => payload[f] ?? null);
    const placeholders = values.map((_, idx) => `$${idx + 1}`).join(',');
    const result = await query(
      `INSERT INTO maintenance_requests (${baseFields.join(',')}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create request', detail: err.message });
  }
}

export async function listRequests(req, res) {
  try {
    const { status } = req.query;
    const where = status ? 'WHERE r.status = $1' : '';
    const params = status ? [status] : [];
    const result = await query(
      `SELECT r.id, r.subject, r.request_type, r.equipment_id, r.maintenance_team_id, 
              r.assigned_technician, TO_CHAR(r.scheduled_date, 'YYYY-MM-DD') as scheduled_date, 
              r.duration_hours, r.status, r.created_at,
              e.name AS equipment_name, u.name AS technician_name, u.avatar_url
       FROM maintenance_requests r
       LEFT JOIN equipment e ON r.equipment_id = e.id
       LEFT JOIN users u ON r.assigned_technician = u.id
       ${where}
       ORDER BY r.created_at DESC`,
      params
    );
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to list requests', detail: err.message });
  }
}

export async function getRequest(req, res) {
  try {
    const result = await query('SELECT * FROM maintenance_requests WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch request', detail: err.message });
  }
}

export async function updateRequest(req, res) {
  try {
    const updates = [];
    const params = [];
    baseFields.forEach((field) => {
      if (field in req.body) {
        params.push(req.body[field]);
        updates.push(`${field} = $${params.length}`);
      }
    });

    if (!updates.length) return res.status(400).json({ error: 'No updates provided' });
    params.push(req.params.id);

    // Scrap logic: if updating to scrap, mark equipment scrapped
    if (req.body.status === 'scrap') {
      const equipmentId = req.body.equipment_id;
      const equipmentResult = equipmentId
        ? { rows: [{ id: equipmentId }] }
        : await query('SELECT equipment_id FROM maintenance_requests WHERE id = $1', [req.params.id]);
      const eqId = equipmentResult.rows[0]?.equipment_id || equipmentResult.rows[0]?.id;
      if (eqId) await query('UPDATE equipment SET is_scrapped = TRUE WHERE id = $1', [eqId]);
    }

    const result = await query(
      `UPDATE maintenance_requests SET ${updates.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update request', detail: err.message });
  }
}
