import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { reportsRouter } from './routes/reports.js';
import { incidentsRouter } from './routes/incidents.js';
import { alertsRouter } from './routes/alerts.js';
import { safeLocationsRouter } from './routes/safeLocations.js';
import { adminRouter } from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Student-facing routes
app.use('/api/reports', reportsRouter);
app.use('/api/incidents', incidentsRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/safe-locations', safeLocationsRouter);

// Admin routes (Supabase Auth protected)
app.use('/api/admin', adminRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[server] Brown Safety Hub API running on port ${PORT}`);
});
