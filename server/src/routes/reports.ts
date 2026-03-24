import { Router, Request, Response } from 'express';
import { supabase } from '../supabaseClient.js';
import { createReportSchema } from '../validation/schemas.js';

export const reportsRouter = Router();

/**
 * POST /api/reports
 * Submit a new private safety report (anonymous, session-based).
 */
reportsRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  const parsed = createReportSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    return;
  }

  const body = parsed.data;

  const { data, error } = await supabase
    .from('reports')
    .insert({
      incident_type: body.incident_type,
      location_text: body.location_text,
      description: body.description,
      confidence_level: body.confidence_level,
      urgency: body.urgency,
      latitude: body.latitude ?? null,
      longitude: body.longitude ?? null,
      reporter_session_id: body.reporter_session_id,
      evidence_urls: body.evidence_urls ?? null,
      status: 'submitted',
    })
    .select()
    .single();

  if (error) {
    console.error('[POST /api/reports] Supabase error:', error);
    res.status(500).json({ error: 'Failed to create report' });
    return;
  }

  res.status(201).json(data);
});

/**
 * GET /api/reports/my-history?sessionId=...
 * Fetch reports for a specific reporter session, ordered newest first.
 */
reportsRouter.get('/my-history', async (req: Request, res: Response): Promise<void> => {
  const sessionId = req.query.sessionId as string | undefined;

  if (!sessionId) {
    res.status(400).json({ error: 'sessionId query parameter is required' });
    return;
  }

  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('reporter_session_id', sessionId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[GET /api/reports/my-history] Supabase error:', error);
    res.status(500).json({ error: 'Failed to fetch report history' });
    return;
  }

  res.json(data);
});
