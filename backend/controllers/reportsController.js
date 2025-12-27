import { query } from '../models/db.js';

export async function getRequestsByTeam(req, res) {
  try {
    const result = await query(
      `SELECT 
        mt.name as team_name,
        COUNT(r.id) as request_count,
        COUNT(CASE WHEN r.status = 'new' THEN 1 END) as new_count,
        COUNT(CASE WHEN r.status = 'in_progress' THEN 1 END) as in_progress_count,
        COUNT(CASE WHEN r.status = 'repaired' THEN 1 END) as repaired_count,
        COUNT(CASE WHEN r.status = 'scrap' THEN 1 END) as scrap_count
       FROM maintenance_teams mt
       LEFT JOIN maintenance_requests r ON r.maintenance_team_id = mt.id
       GROUP BY mt.id, mt.name
       ORDER BY request_count DESC`
    );
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch team stats', detail: err.message });
  }
}

export async function getRequestsByCategory(req, res) {
  try {
    const result = await query(
      `SELECT 
        COALESCE(e.category, 'Uncategorized') as category,
        COUNT(r.id) as request_count,
        COUNT(CASE WHEN r.status = 'new' THEN 1 END) as new_count,
        COUNT(CASE WHEN r.status = 'in_progress' THEN 1 END) as in_progress_count,
        COUNT(CASE WHEN r.status = 'repaired' THEN 1 END) as repaired_count,
        COUNT(CASE WHEN r.status = 'scrap' THEN 1 END) as scrap_count,
        COUNT(CASE WHEN r.request_type = 'corrective' THEN 1 END) as corrective_count,
        COUNT(CASE WHEN r.request_type = 'preventive' THEN 1 END) as preventive_count
       FROM equipment e
       LEFT JOIN maintenance_requests r ON r.equipment_id = e.id
       WHERE e.category IS NOT NULL
       GROUP BY e.category
       ORDER BY request_count DESC`
    );
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch category stats', detail: err.message });
  }
}

export async function getRequestsByType(req, res) {
  try {
    const result = await query(
      `SELECT 
        request_type,
        COUNT(*) as count,
        COUNT(CASE WHEN status = 'new' THEN 1 END) as new_count,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_count,
        COUNT(CASE WHEN status = 'repaired' THEN 1 END) as repaired_count
       FROM maintenance_requests
       GROUP BY request_type`
    );
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch type stats', detail: err.message });
  }
}
