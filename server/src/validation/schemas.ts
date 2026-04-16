import { z } from 'zod';

// ─── Student report submission ───────────────────────────────────────────────

export const createReportSchema = z.object({
  incident_type: z.string().min(1, 'incident_type is required'),
  location_text: z.string().min(1, 'location_text is required'),
  description: z.string().min(1, 'description is required'),
  confidence_level: z.number().int().min(1).max(10),
  urgency: z.boolean(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  reporter_session_id: z.string().min(1, 'reporter_session_id is required'),
  evidence_urls: z.array(z.string().url()).nullable().optional(),
});

// ─── Admin: report status update ─────────────────────────────────────────────

export const updateReportStatusSchema = z.object({
  status: z.enum(['submitted', 'under_review', 'verified', 'dismissed', 'resolved']),
});

// ─── Admin: create public incident ───────────────────────────────────────────

export const createIncidentSchema = z.object({
  source_report_id: z.string().uuid().nullable().optional(),
  title: z.string().min(1, 'title is required'),
  public_message: z.string().min(1, 'public_message is required'),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  status: z.enum(['active', 'monitoring', 'resolved']).default('active'),
  latitude: z.number(),
  longitude: z.number(),
  radius_meters: z.number().int().min(0).default(100),
  report_count: z.number().int().min(0).default(1),
  confidence_percent: z.number().int().min(0).max(100),
  expires_at: z.string().datetime().nullable().optional(),
});

// ─── Admin: update public incident ───────────────────────────────────────────

export const updateIncidentSchema = z.object({
  title: z.string().min(1).optional(),
  public_message: z.string().min(1).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['active', 'monitoring', 'resolved']).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radius_meters: z.number().int().min(0).optional(),
  report_count: z.number().int().min(0).optional(),
  confidence_percent: z.number().int().min(0).max(100).optional(),
  expires_at: z.string().datetime().nullable().optional(),
});

// ─── Admin: create public alert ──────────────────────────────────────────────

export const createAlertSchema = z.object({
  title: z.string().min(1, 'title is required'),
  message: z.string().min(1, 'message is required'),
  level: z.enum(['info', 'warning', 'critical']),
  verified: z.boolean().default(true),
  expires_at: z.string().datetime().nullable().optional(),
  linked_incident_id: z.string().uuid().nullable().optional(),
});

export const updateAlertSchema = createAlertSchema.partial();

// ─── Admin: create safe location ─────────────────────────────────────────────

export const createSafeLocationSchema = z.object({
  name: z.string().min(1, 'name is required'),
  description: z.string().min(1, 'description is required'),
  latitude: z.number(),
  longitude: z.number(),
  category: z.enum(['building', 'service', 'emergency', 'shelter', 'other']),
  is_active: z.boolean().default(true),
});

export const updateSafeLocationSchema = createSafeLocationSchema.partial();
