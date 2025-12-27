import { query } from '../models/db.js';

const baseFields = [
  'name','serial_number','category','purchase_date','warranty_info','location','department','assigned_employee','maintenance_team_id','is_scrapped'
];

export async function createEquipment(req, res) {
  try {
    const values = baseFields.map(f => req.body[f] ?? null);
    const placeholders = values.map((_, idx) => `$${idx + 1}`).join(',');
    const result = await query(
      `INSERT INTO equipment (${baseFields.join(',')}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create equipment', detail: err.message });
  }
}

export async function listEquipment(req, res) {
  try {
    const result = await query(
      `SELECT e.*, COALESCE(COUNT(r.*) FILTER (WHERE r.status != 'repaired'), 0) AS open_request_count
       FROM equipment e
       LEFT JOIN maintenance_requests r ON r.equipment_id = e.id
       GROUP BY e.id
       ORDER BY e.id DESC`
    );
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to list equipment', detail: err.message });
  }
}

export async function getEquipment(req, res) {
  try {
    const result = await query(
      `SELECT e.*, COALESCE(COUNT(r.*) FILTER (WHERE r.status != 'repaired'), 0) AS open_request_count
       FROM equipment e
       LEFT JOIN maintenance_requests r ON r.equipment_id = e.id
       WHERE e.id = $1
       GROUP BY e.id`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch equipment', detail: err.message });
  }
}

export async function updateEquipment(req, res) {
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
    const result = await query(
      `UPDATE equipment SET ${updates.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update equipment', detail: err.message });
  }
}
