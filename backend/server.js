import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import equipmentRoutes from './routes/equipment.js';
import requestRoutes from './routes/requests.js';
import reportRoutes from './routes/reports.js';
import { poolInstance } from './models/db.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', async (_req, res) => {
  try {
    await poolInstance.query('SELECT 1');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.use('/auth', authRoutes);
app.use('/equipment', equipmentRoutes);
app.use('/requests', requestRoutes);
app.use('/reports', reportRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`GearGuard backend listening on ${port}`);
});
