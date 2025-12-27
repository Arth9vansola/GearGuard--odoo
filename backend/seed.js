import dotenv from 'dotenv';
import { poolInstance, query } from './models/db.js';

dotenv.config();

async function seed() {
  try {
    await query('BEGIN');

    const users = [
      { name: 'Mia Manager', email: 'mia@gearguard.local', role: 'manager' },
      { name: 'Tom Technician', email: 'tom@gearguard.local', role: 'technician' },
      { name: 'Uma User', email: 'uma@gearguard.local', role: 'user' }
    ];

    for (const u of users) {
      await query(
        `INSERT INTO users (name, email, role) VALUES ($1, $2, $3)
         ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role`,
        [u.name, u.email, u.role]
      );
    }

    const teams = ['North Ops', 'South Ops'];
    const teamIds = [];
    for (const name of teams) {
      const result = await query(
        `INSERT INTO maintenance_teams (name) VALUES ($1)
         ON CONFLICT (name) DO NOTHING RETURNING id`,
        [name]
      );
      if (result.rows[0]) teamIds.push(result.rows[0].id);
    }
    const existingTeams = await query('SELECT id FROM maintenance_teams ORDER BY id');
    while (teamIds.length < 2 && existingTeams.rows[teamIds.length]) {
      teamIds.push(existingTeams.rows[teamIds.length].id);
    }

    // Map technician to team 1
    await query('DELETE FROM team_members');
    await query('INSERT INTO team_members (team_id, user_id) SELECT $1, id FROM users WHERE email = $2', [teamIds[0], 'tom@gearguard.local']);

    const equipmentSeed = [
      {
        name: 'Hydraulic Press',
        serial_number: 'HP-1001',
        category: 'Press',
        purchase_date: '2022-02-15',
        warranty_info: '3y warranty',
        location: 'Plant A',
        department: 'Manufacturing',
        assigned_employee: 'Alex',
        maintenance_team_id: teamIds[0]
      },
      {
        name: 'Conveyor Belt',
        serial_number: 'CB-3399',
        category: 'Conveyor',
        purchase_date: '2021-06-01',
        warranty_info: '2y extended',
        location: 'Plant B',
        department: 'Logistics',
        assigned_employee: 'Jamie',
        maintenance_team_id: teamIds[1]
      }
    ];

    for (const eq of equipmentSeed) {
      await query(
        `INSERT INTO equipment (name, serial_number, category, purchase_date, warranty_info, location, department, assigned_employee, maintenance_team_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (serial_number) DO UPDATE SET name = EXCLUDED.name, maintenance_team_id = EXCLUDED.maintenance_team_id`,
        [eq.name, eq.serial_number, eq.category, eq.purchase_date, eq.warranty_info, eq.location, eq.department, eq.assigned_employee, eq.maintenance_team_id]
      );
    }

    const eqIds = (await query('SELECT id, serial_number FROM equipment ORDER BY id')).rows;
    const equipmentMap = Object.fromEntries(eqIds.map(e => [e.serial_number, e.id]));

    await query('DELETE FROM maintenance_requests');
    await query(
      `INSERT INTO maintenance_requests (subject, request_type, equipment_id, maintenance_team_id, assigned_technician, scheduled_date, duration_hours, status)
       VALUES
       ('Oil leakage', 'corrective', $1, $3, (SELECT id FROM users WHERE email = 'tom@gearguard.local'), CURRENT_DATE - 2, 3, 'in_progress'),
       ('Quarterly check', 'preventive', $2, $4, NULL, CURRENT_DATE + 7, NULL, 'new')`,
      [equipmentMap['HP-1001'], equipmentMap['CB-3399'], teamIds[0], teamIds[1]]
    );

    await query('COMMIT');
    console.log('Seed complete');
  } catch (err) {
    await query('ROLLBACK');
    console.error('Seed failed', err);
    process.exitCode = 1;
  } finally {
    await poolInstance.end();
  }
}

seed();
