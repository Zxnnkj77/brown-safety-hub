import { createClient } from '@supabase/supabase-js';
import { PublicAlert, PublicIncident, Report, SafeLocation } from '../api';

const BASE_URL: string = (import.meta as any).env?.VITE_API_URL || '';
const ADMIN_TOKEN_KEY = 'brown_safety_admin_token';

export type AdminProfile = {
  id: string;
  user_id: string;
  email: string;
  role: 'admin' | 'moderator' | string;
};

export type ReportStatus = Report['status'];
export type IncidentStatus = PublicIncident['status'];

export type CreateIncidentInput = {
  source_report_id?: string | null;
  title: string;
  public_message: string;
  severity: PublicIncident['severity'];
  status: PublicIncident['status'];
  latitude: number;
  longitude: number;
  radius_meters: number;
  report_count: number;
  confidence_percent: number;
  expires_at?: string | null;
};

export type CreateAlertInput = {
  title: string;
  message: string;
  level: PublicAlert['level'];
  verified: boolean;
  expires_at?: string | null;
  linked_incident_id?: string | null;
};

export type CreateSafeLocationInput = {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  category: SafeLocation['category'];
  is_active: boolean;
};

export function getStoredAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function storeAdminToken(token: string): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export async function signInAdminWithPassword(email: string, password: string): Promise<string> {
  const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
  const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase browser auth is not configured. Paste an admin access token instead.');
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await client.auth.signInWithPassword({ email, password });

  if (error || !data.session?.access_token) {
    throw new Error(error?.message || 'Admin sign-in failed');
  }

  return data.session.access_token;
}

async function adminFetch<T>(token: string, path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${BASE_URL}/api/admin${path}`, {
    ...init,
    headers,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const payload = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(payload.error || 'Admin request failed');
  }

  return payload as T;
}

export function fetchAdminProfile(token: string): Promise<AdminProfile> {
  return adminFetch<AdminProfile>(token, '/me');
}

export function fetchAdminReports(token: string, status?: string): Promise<Report[]> {
  const query = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
  return adminFetch<Report[]>(token, `/reports${query}`);
}

export function updateAdminReportStatus(token: string, id: string, status: ReportStatus): Promise<Report> {
  return adminFetch<Report>(token, `/reports/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function fetchAdminIncidents(token: string): Promise<PublicIncident[]> {
  return adminFetch<PublicIncident[]>(token, '/incidents');
}

export function createAdminIncident(token: string, input: CreateIncidentInput): Promise<PublicIncident> {
  return adminFetch<PublicIncident>(token, '/incidents', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateAdminIncident(
  token: string,
  id: string,
  input: Partial<CreateIncidentInput>,
): Promise<PublicIncident> {
  return adminFetch<PublicIncident>(token, `/incidents/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function deleteAdminIncident(token: string, id: string): Promise<void> {
  return adminFetch<void>(token, `/incidents/${id}`, { method: 'DELETE' });
}

export function fetchAdminAlerts(token: string): Promise<PublicAlert[]> {
  return adminFetch<PublicAlert[]>(token, '/alerts');
}

export function createAdminAlert(token: string, input: CreateAlertInput): Promise<PublicAlert> {
  return adminFetch<PublicAlert>(token, '/alerts', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateAdminAlert(token: string, id: string, input: Partial<CreateAlertInput>): Promise<PublicAlert> {
  return adminFetch<PublicAlert>(token, `/alerts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function deleteAdminAlert(token: string, id: string): Promise<void> {
  return adminFetch<void>(token, `/alerts/${id}`, { method: 'DELETE' });
}

export function fetchAdminSafeLocations(token: string): Promise<SafeLocation[]> {
  return adminFetch<SafeLocation[]>(token, '/safe-locations');
}

export function createAdminSafeLocation(token: string, input: CreateSafeLocationInput): Promise<SafeLocation> {
  return adminFetch<SafeLocation>(token, '/safe-locations', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateAdminSafeLocation(
  token: string,
  id: string,
  input: Partial<CreateSafeLocationInput>,
): Promise<SafeLocation> {
  return adminFetch<SafeLocation>(token, `/safe-locations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function deleteAdminSafeLocation(token: string, id: string): Promise<void> {
  return adminFetch<void>(token, `/safe-locations/${id}`, { method: 'DELETE' });
}
