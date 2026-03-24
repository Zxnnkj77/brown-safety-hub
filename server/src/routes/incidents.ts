import { Router, Request, Response } from 'express';
import { supabase } from '../supabaseClient.js';

export const incidentsRouter = Router();

/**
 * GET /api/incidents/public
 * Returns active/monitoring public incidents for the student map.
 */
incidentsRouter.get('/public', async (_req: Request, res: Response): Promise<void> => {
  const { data, error } = await supabase
    .from('public_incidents')
    .select('*')
    .in('status', ['active', 'monitoring'])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[GET /api/incidents/public] Supabase error:', error);
    res.status(500).json({ error: 'Failed to fetch public incidents' });
    return;
  }

  res.json(data);
});
