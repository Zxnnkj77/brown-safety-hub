import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getJwtRole(key: string): string | null {
  const [, payload] = key.split('.');

  if (!payload) {
    return null;
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return typeof decoded.role === 'string' ? decoded.role : null;
  } catch {
    return null;
  }
}

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables. ' +
    'Copy server/.env.example to server/.env and fill in your Supabase credentials.'
  );
}

if (
  supabaseServiceKey.startsWith('sb_publishable_') ||
  supabaseServiceKey.startsWith('sb_anon_')
) {
  throw new Error(
    'SUPABASE_SERVICE_ROLE_KEY must be a backend-only Supabase secret/service_role key. ' +
    'Do not use sb_publishable_ or anon keys for the Express server.'
  );
}

const jwtRole = getJwtRole(supabaseServiceKey);

if (jwtRole && jwtRole !== 'service_role') {
  throw new Error(
    `SUPABASE_SERVICE_ROLE_KEY contains a JWT with role "${jwtRole}", but the server requires "service_role".`
  );
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
