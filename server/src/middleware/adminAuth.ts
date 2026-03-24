import { Request, Response, NextFunction } from 'express';
import { supabase } from '../supabaseClient.js';

export interface AdminRequest extends Request {
  adminProfile?: {
    id: string;
    user_id: string;
    email: string;
    role: string;
  };
}

/**
 * Middleware that verifies the request has a valid Supabase Auth JWT
 * and that the authenticated user exists in admin_profiles with role admin or moderator.
 */
export async function adminAuth(req: AdminRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed Authorization header. Expected: Bearer <jwt>' });
    return;
  }

  const token = authHeader.slice(7);

  // Step 1: Verify the JWT with Supabase Auth
  const { data: userData, error: authError } = await supabase.auth.getUser(token);

  if (authError || !userData?.user) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  const userId = userData.user.id;

  // Step 2: Check user exists in admin_profiles with an allowed role
  const { data: profile, error: profileError } = await supabase
    .from('admin_profiles')
    .select('id, user_id, email, role')
    .eq('user_id', userId)
    .in('role', ['admin', 'moderator'])
    .single();

  if (profileError || !profile) {
    res.status(403).json({ error: 'User is not an authorized admin or moderator' });
    return;
  }

  // Attach profile to request for downstream use
  req.adminProfile = profile;
  next();
}
