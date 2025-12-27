import jwt from 'jsonwebtoken';
import { query } from '../models/db.js';

export async function login(req, res) {
  try {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const existing = await query('SELECT * FROM users WHERE email = $1', [email]);
    let user = existing.rows[0];

    if (!user) {
      const inferredName = name || email.split('@')[0];
      const insert = await query(
        'INSERT INTO users (name, email, role) VALUES ($1, $2, $3) RETURNING *',
        [inferredName, email, 'user']
      );
      user = insert.rows[0];
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    return res.json({ token, user });
  } catch (err) {
    return res.status(500).json({ error: 'Login failed', detail: err.message });
  }
}
