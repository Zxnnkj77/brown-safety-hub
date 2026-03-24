
export type TabType = 'hub' | 'map' | 'history' | 'report';

// Re-export backend-aligned types from api.ts for convenience
export type { Report, PublicIncident, PublicAlert, SafeLocation } from './api';
