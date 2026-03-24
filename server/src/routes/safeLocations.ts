import { Router, Request, Response } from 'express';
import { supabase } from '../supabaseClient.js';

export const safeLocationsRouter = Router();

/**
 * GET /api/safe-locations
 * Returns all active safe locations.
 */
safeLocationsRouter.get('/', async (_req: Request, res: Response): Promise<void> => {
  const { data, error } = await supabase
    .from('safe_locations')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('[GET /api/safe-locations] Supabase error:', error);
    res.status(500).json({ error: 'Failed to fetch safe locations' });
    return;
  }

  res.json(data);
});
