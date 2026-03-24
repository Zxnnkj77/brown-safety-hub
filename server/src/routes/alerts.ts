import { Router, Request, Response } from 'express';
import { supabase } from '../supabaseClient.js';

export const alertsRouter = Router();

/**
 * GET /api/alerts/public
 * Returns non-expired public alerts, newest first.
 */
alertsRouter.get('/public', async (_req: Request, res: Response): Promise<void> => {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('public_alerts')
    .select('*')
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[GET /api/alerts/public] Supabase error:', error);
    res.status(500).json({ error: 'Failed to fetch public alerts' });
    return;
  }

  res.json(data);
});
