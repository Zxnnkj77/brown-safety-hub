import { Router, Response } from 'express';
import { supabase } from '../supabaseClient.js';
import { adminAuth, AdminRequest } from '../middleware/adminAuth.js';
import {
  updateReportStatusSchema,
  createIncidentSchema,
  updateIncidentSchema,
  createAlertSchema,
  updateAlertSchema,
  createSafeLocationSchema,
  updateSafeLocationSchema,
} from '../validation/schemas.js';

export const adminRouter = Router();

// All admin routes require authenticated admin/moderator
adminRouter.use(adminAuth);

adminRouter.get('/me', (req: AdminRequest, res: Response): void => {
  res.json(req.adminProfile);
});

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
 * GET /api/admin/incidents
 * List all public incidents for admin review, including resolved incidents.
 */
adminRouter.get('/incidents', async (_req: AdminRequest, res: Response): Promise<void> => {
  const { data, error } = await supabase
    .from('public_incidents')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[GET /api/admin/incidents] Supabase error:', error);
    res.status(500).json({ error: 'Failed to fetch incidents' });
    return;
  }

  res.json(data);
});

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

/**
 * DELETE /api/admin/incidents/:id
 * Remove a public incident from the admin feed and student map.
 */
adminRouter.delete('/incidents/:id', async (req: AdminRequest, res: Response): Promise<void> => {
  const { error } = await supabase
    .from('public_incidents')
    .delete()
    .eq('id', req.params.id);

  if (error) {
    console.error('[DELETE /api/admin/incidents/:id] Supabase error:', error);
    res.status(500).json({ error: 'Failed to delete incident' });
    return;
  }

  res.status(204).send();
});

// ─── Public Alerts ───────────────────────────────────────────────────────────

/**
 * GET /api/admin/alerts
 * List all public alerts, including expired alerts.
 */
adminRouter.get('/alerts', async (_req: AdminRequest, res: Response): Promise<void> => {
  const { data, error } = await supabase
    .from('public_alerts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[GET /api/admin/alerts] Supabase error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
    return;
  }

  res.json(data);
});

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

/**
 * PATCH /api/admin/alerts/:id
 * Update an existing public alert. Admins can expire alerts by setting expires_at.
 */
adminRouter.patch('/alerts/:id', async (req: AdminRequest, res: Response): Promise<void> => {
  const parsed = updateAlertSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    return;
  }

  const updatePayload = {
    ...parsed.data,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('public_alerts')
    .update(updatePayload)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) {
    console.error('[PATCH /api/admin/alerts/:id] Supabase error:', error);
    res.status(500).json({ error: 'Failed to update alert' });
    return;
  }

  if (!data) {
    res.status(404).json({ error: 'Alert not found' });
    return;
  }

  res.json(data);
});

/**
 * DELETE /api/admin/alerts/:id
 * Delete a public alert.
 */
adminRouter.delete('/alerts/:id', async (req: AdminRequest, res: Response): Promise<void> => {
  const { error } = await supabase
    .from('public_alerts')
    .delete()
    .eq('id', req.params.id);

  if (error) {
    console.error('[DELETE /api/admin/alerts/:id] Supabase error:', error);
    res.status(500).json({ error: 'Failed to delete alert' });
    return;
  }

  res.status(204).send();
});

// ─── Safe Locations ──────────────────────────────────────────────────────────

/**
 * GET /api/admin/safe-locations
 * List all safe locations, including inactive locations.
 */
adminRouter.get('/safe-locations', async (_req: AdminRequest, res: Response): Promise<void> => {
  const { data, error } = await supabase
    .from('safe_locations')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('[GET /api/admin/safe-locations] Supabase error:', error);
    res.status(500).json({ error: 'Failed to fetch safe locations' });
    return;
  }

  res.json(data);
});

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

/**
 * PATCH /api/admin/safe-locations/:id
 * Update an existing safe location, including activation state.
 */
adminRouter.patch('/safe-locations/:id', async (req: AdminRequest, res: Response): Promise<void> => {
  const parsed = updateSafeLocationSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    return;
  }

  const { data, error } = await supabase
    .from('safe_locations')
    .update(parsed.data)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) {
    console.error('[PATCH /api/admin/safe-locations/:id] Supabase error:', error);
    res.status(500).json({ error: 'Failed to update safe location' });
    return;
  }

  if (!data) {
    res.status(404).json({ error: 'Safe location not found' });
    return;
  }

  res.json(data);
});

/**
 * DELETE /api/admin/safe-locations/:id
 * Delete a curated safe location.
 */
adminRouter.delete('/safe-locations/:id', async (req: AdminRequest, res: Response): Promise<void> => {
  const { error } = await supabase
    .from('safe_locations')
    .delete()
    .eq('id', req.params.id);

  if (error) {
    console.error('[DELETE /api/admin/safe-locations/:id] Supabase error:', error);
    res.status(500).json({ error: 'Failed to delete safe location' });
    return;
  }

  res.status(204).send();
});
