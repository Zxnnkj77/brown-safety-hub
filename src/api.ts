/// <reference types="vite/client" />

const BASE_URL: string = (import.meta as any).env?.VITE_API_URL || '';

// ─── Session ID (anonymous identity for MVP) ─────────────────────────────────

const SESSION_KEY = 'brown_safety_session_id';

export function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

// ─── Types (matching backend DB models) ──────────────────────────────────────

export interface Report {
  id: string;
  created_at: string;
  incident_type: string;
  location_text: string;
  description: string;
  confidence_level: number; // integer 1–10
  urgency: boolean;
  latitude: number | null;
  longitude: number | null;
  reporter_session_id: string | null;
  status: 'submitted' | 'under_review' | 'verified' | 'dismissed' | 'resolved';
  evidence_urls: string[] | null;
}

export interface PublicIncident {
  id: string;
  source_report_id: string | null;
  title: string;
  public_message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'monitoring' | 'resolved';
  latitude: number;
  longitude: number;
  radius_meters: number;
  report_count: number;
  confidence_percent: number;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
}

export interface PublicAlert {
  id: string;
  title: string;
  message: string;
  level: 'info' | 'warning' | 'critical';
  verified: boolean;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  linked_incident_id: string | null;
}

export interface SafeLocation {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  category: 'building' | 'service' | 'emergency' | 'shelter' | 'other';
  is_active: boolean;
  created_at: string;
}

// ─── API Functions ───────────────────────────────────────────────────────────

export async function submitReport(data: {
  incident_type: string;
  location_text: string;
  description: string;
  confidence_level: number;
  urgency: boolean;
  latitude?: number | null;
  longitude?: number | null;
}): Promise<Report> {
  const res = await fetch(`${BASE_URL}/api/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...data,
      reporter_session_id: getSessionId(),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to submit report');
  }

  return res.json();
}

export async function fetchMyHistory(): Promise<Report[]> {
  const sessionId = getSessionId();
  const res = await fetch(`${BASE_URL}/api/reports/my-history?sessionId=${encodeURIComponent(sessionId)}`);

  if (!res.ok) {
    throw new Error('Failed to fetch report history');
  }

  return res.json();
}

export async function fetchPublicIncidents(): Promise<PublicIncident[]> {
  const res = await fetch(`${BASE_URL}/api/incidents/public`);

  if (!res.ok) {
    throw new Error('Failed to fetch public incidents');
  }

  return res.json();
}

export async function fetchPublicAlerts(): Promise<PublicAlert[]> {
  const res = await fetch(`${BASE_URL}/api/alerts/public`);

  if (!res.ok) {
    throw new Error('Failed to fetch public alerts');
  }

  return res.json();
}

export async function fetchSafeLocations(): Promise<SafeLocation[]> {
  const res = await fetch(`${BASE_URL}/api/safe-locations`);

  if (!res.ok) {
    throw new Error('Failed to fetch safe locations');
  }

  return res.json();
}
