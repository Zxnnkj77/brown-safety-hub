import { Router, Response } from 'express';
import { supabase } from '../supabaseClient.js';
import { adminAuth, AdminRequest } from '../middleware/adminAuth.js';
import {
  updateReportStatusSchema,
  createIncidentSchema,
  updateIncidentSchema,
  createAlertSchema,
  createSafeLocationSchema,
} from '../validation/schemas.js';

export const adminRouter = Router();

// All admin routes require authenticated admin/moderator
adminRouter.use(adminAuth);

// ─── Reports ─────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/reports?status=submitted
 * List all reports, optionally filtered by status.
 */
adminRouter.get('/reports', async (req: AdminRequest, res: Response): Promise<void> => {
  const statusFilter = req.query.status as string | undefined;

  let query = supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[GET /api/admin/reports] Supabase error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
    return;
  }

  res.json(data);
});

/**
 * PATCH /api/admin/reports/:id/status
 * Update the status of a report (e.g. submitted → under_review → verified).
 */
adminRouter.patch('/reports/:id/status', async (req: AdminRequest, res: Response): Promise<void> => {
  const parsed = updateReportStatusSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    return;
  }

  const { data, error } = await supabase
    .from('reports')
    .update({ status: parsed.data.status })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) {
    console.error('[PATCH /api/admin/reports/:id/status] Supabase error:', error);
    res.status(500).json({ error: 'Failed to update report status' });
    return;
  }

  if (!data) {
    res.status(404).json({ error: 'Report not found' });
    return;
  }

  res.json(data);
});

// ─── Public Incidents ────────────────────────────────────────────────────────

/**
 * POST /api/admin/incidents
 * Create a new public incident (may reference a source report).
 */
adminRouter.post('/incidents', async (req: AdminRequest, res: Response): Promise<void> => {
  const parsed = createIncidentSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    return;
  }

  const { data, error } = await supabase
    .from('public_incidents')
    .insert(parsed.data)
    .select()
    .single();

  if (error) {
    console.error('[POST /api/admin/incidents] Supabase error:', error);
    res.status(500).json({ error: 'Failed to create incident' });
    return;
  }

  res.status(201).json(data);
});

/**
 * PATCH /api/admin/incidents/:id
 * Update an existing public incident.
 */
adminRouter.patch('/incidents/:id', async (req: AdminRequest, res: Response): Promise<void> => {
  const parsed = updateIncidentSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    return;
  }

  const updatePayload = {
    ...parsed.data,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('public_incidents')
    .update(updatePayload)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) {
    console.error('[PATCH /api/admin/incidents/:id] Supabase error:', error);
    res.status(500).json({ error: 'Failed to update incident' });
    return;
  }

  if (!data) {
    res.status(404).json({ error: 'Incident not found' });
    return;
  }

  res.json(data);
});

// ─── Public Alerts ───────────────────────────────────────────────────────────

/**
 * POST /api/admin/alerts
 * Create a new public alert.
 */
adminRouter.post('/alerts', async (req: AdminRequest, res: Response): Promise<void> => {
  const parsed = createAlertSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    return;
  }

  const { data, error } = await supabase
    .from('public_alerts')
    .insert(parsed.data)
    .select()
    .single();

  if (error) {
    console.error('[POST /api/admin/alerts] Supabase error:', error);
    res.status(500).json({ error: 'Failed to create alert' });
    return;
  }

  res.status(201).json(data);
});

// ─── Safe Locations ──────────────────────────────────────────────────────────

/**
 * POST /api/admin/safe-locations
 * Create a new curated safe location.
 */
adminRouter.post('/safe-locations', async (req: AdminRequest, res: Response): Promise<void> => {
  const parsed = createSafeLocationSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    return;
  }

  const { data, error } = await supabase
    .from('safe_locations')
    .insert(parsed.data)
    .select()
    .single();

  if (error) {
    console.error('[POST /api/admin/safe-locations] Supabase error:', error);
    res.status(500).json({ error: 'Failed to create safe location' });
    return;
  }

  res.status(201).json(data);
});
